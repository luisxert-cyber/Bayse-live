-- Studio member codes. BAYSE gives a code to a studio member; entering it links their studio
-- membership as verified, which switches on free Foundation and the studio member prices.
-- Codes are made in the back office (admins only), single use by default, and can expire.

create table public.studio_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[A-Z0-9-]{6,24}$'),
  studio_id    uuid not null references public.studios (id) on delete cascade,
  tier         text not null default 'studio_99' check (tier in ('studio_99', 'studio_148', 'other')),
  max_uses     int  not null default 1 check (max_uses between 1 and 1000),
  uses         int  not null default 0,
  access_days  int  not null default 365 check (access_days between 7 and 730),
  expires_at   timestamptz,
  note         text check (char_length(note) <= 120),
  active       boolean not null default true,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table public.studio_code_redemptions (
  code_id      uuid not null references public.studio_codes (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  redeemed_at  timestamptz not null default now(),
  primary key (code_id, user_id)
);

create table public.studio_code_attempts (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  tried_at     timestamptz not null default now()
);
create index studio_code_attempts_idx on public.studio_code_attempts (user_id, tried_at);

alter table public.studio_codes            enable row level security;
alter table public.studio_code_redemptions enable row level security;
alter table public.studio_code_attempts    enable row level security;
create policy studio_codes_admin on public.studio_codes for select to authenticated using (public.is_admin());
create policy studio_codes_admin_update on public.studio_codes for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy studio_code_redemptions_read on public.studio_code_redemptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Let a code redemption save a verified link (the member is not staff, so the guard would
-- otherwise force "pending"). The flag is transaction-local and only set inside redeem_studio_code.
create or replace function public.studio_memberships_guard()
returns trigger language plpgsql set search_path = '' as $$
declare staff boolean := auth.uid() is null or public.is_admin() or public.manages_studio(new.studio_id)
                         or coalesce(current_setting('bayse.code_redeem', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if not staff then
      new.status := 'pending';
      new.verified_by := null;
      new.verified_at := null;
      new.verified_until := null;
      new.ended_at := null;
    elsif new.status = 'verified' then
      new.verified_by := coalesce(new.verified_by, auth.uid());
      new.verified_at := coalesce(new.verified_at, now());
      new.verified_until := coalesce(new.verified_until, current_date + 90);
    end if;
  else
    new.user_id := old.user_id;
    new.requested_at := old.requested_at;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'verified' then
      new.verified_by := auth.uid();
      new.verified_at := now();
      new.ended_at := null;
      -- Re-check every 90 days unless staff chose another date in the same update.
      if new.verified_until is null or new.verified_until is not distinct from old.verified_until or new.verified_until < current_date then
        new.verified_until := current_date + 90;
      end if;
    elsif new.status = 'ended' then
      new.ended_at := now();
    end if;
  end if;
  return new;
end $$;

-- Member enters a code. Returns 'ok', 'invalid', 'used', 'expired', 'already' or 'slow_down'.
create or replace function public.redeem_studio_code(p_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  c public.studio_codes;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
begin
  if me is null then return 'invalid'; end if;
  -- At most 10 wrong tries an hour, so codes cannot be guessed.
  if (select count(*) from public.studio_code_attempts where user_id = me and tried_at > now() - interval '1 hour') >= 10 then
    return 'slow_down';
  end if;
  select * into c from public.studio_codes where code = v_code for update;
  if not found or not c.active then
    insert into public.studio_code_attempts (user_id) values (me);
    return 'invalid';
  end if;
  if c.expires_at is not null and c.expires_at < now() then return 'expired'; end if;
  if exists (select 1 from public.studio_code_redemptions where code_id = c.id and user_id = me) then return 'already'; end if;
  if c.uses >= c.max_uses then return 'used'; end if;
  if exists (select 1 from public.studio_memberships where user_id = me and status = 'verified'
             and (verified_until is null or verified_until >= current_date)) then
    return 'already';
  end if;

  perform set_config('bayse.code_redeem', 'on', true);
  insert into public.studio_memberships (user_id, studio_id, tier, member_ref, status, verified_until)
  values (me, c.studio_id, c.tier, 'Code ' || c.code, 'verified', current_date + c.access_days)
  on conflict (user_id, studio_id) do update
    set tier = excluded.tier, member_ref = excluded.member_ref, status = 'verified',
        verified_until = excluded.verified_until;
  -- The update path of the guard resets verified_until to 90 days; restore the code's length.
  update public.studio_memberships set verified_until = current_date + c.access_days
   where user_id = me and studio_id = c.studio_id;
  perform set_config('bayse.code_redeem', '', true);

  update public.studio_codes set uses = uses + 1 where id = c.id;
  insert into public.studio_code_redemptions (code_id, user_id) values (c.id, me);
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (me, 'studio_code.redeemed', 'studio_codes', c.id, jsonb_build_object('code', c.code));
  return 'ok';
end $$;
revoke all on function public.redeem_studio_code(text) from public, anon;
grant execute on function public.redeem_studio_code(text) to authenticated;

-- Admin makes a batch of codes. Returns the new codes.
create or replace function public.create_studio_codes(
  p_studio uuid, p_tier text, p_count int, p_max_uses int default 1,
  p_access_days int default 365, p_expires date default null, p_note text default null)
returns setof text language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  prefix text;
  v text;
  i int;
  k int;
  b bytea;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_count not between 1 and 200 then raise exception 'count must be 1 to 200'; end if;
  select upper(left(regexp_replace(replace(name, 'BAYSE ', ''), '[^A-Za-z]', '', 'g'), 4)) into prefix from public.studios where id = p_studio;
  if prefix is null then raise exception 'unknown studio'; end if;
  for i in 1..p_count loop
    loop
      b := extensions.gen_random_bytes(8);
      v := prefix || '-';
      for k in 0..7 loop v := v || substr(alphabet, (get_byte(b, k) % 32) + 1, 1); end loop;
      exit when not exists (select 1 from public.studio_codes where code = v);
    end loop;
    insert into public.studio_codes (code, studio_id, tier, max_uses, access_days, expires_at, note, created_by)
    values (v, p_studio, p_tier, p_max_uses, p_access_days,
            case when p_expires is null then null else (p_expires + 1)::timestamp at time zone 'Europe/London' end,
            nullif(trim(p_note), ''), auth.uid());
    return next v;
  end loop;
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), 'studio_codes.created', 'studios', p_studio, jsonb_build_object('count', p_count, 'tier', p_tier));
end $$;
revoke all on function public.create_studio_codes(uuid, text, int, int, int, date, text) from public, anon;
grant execute on function public.create_studio_codes(uuid, text, int, int, int, date, text) to authenticated;
