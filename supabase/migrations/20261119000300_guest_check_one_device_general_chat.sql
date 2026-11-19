-- 19 November 2026: three fixes found while testing on an iPad.

-- 1. A guest who has just created a real account keeps a guest-marked session token until it
--    refreshes, so checks that read the token treated a signed-in member as signed out.
--    Check the account itself instead.
create or replace function public.is_guest()
returns boolean language sql stable security definer set search_path to '' as $$
  select auth.uid() is null
      or not exists (select 1 from auth.users u where u.id = auth.uid() and not coalesce(u.is_anonymous, false));
$$;
revoke execute on function public.is_guest() from public, anon, authenticated;

create or replace function public.start_test_access()
returns boolean language plpgsql security definer set search_path to '' as $$
declare
  me uuid := auth.uid();
  until_ts timestamptz := now() + interval '7 days';
begin
  if public.is_guest() then return false; end if;
  if not exists (select 1 from public.feature_flags f where f.key = 'test_mode' and f.enabled) then return false; end if;
  -- Renew earlier test access. Access BAYSE gave by hand with no end date is left alone.
  update public.entitlements e set ends_at = until_ts
    where e.user_id = me and e.source = 'manual' and e.source_id is null and e.ends_at is not null;
  insert into public.entitlements (user_id, entitlement_key, source, ends_at)
  select me, k.key, 'manual', until_ts from public.entitlement_keys k
    where not exists (select 1 from public.entitlements e where e.user_id = me and e.entitlement_key = k.key and e.source = 'manual' and e.source_id is null);
  return true;
end $$;

create or replace function public.can_participate()
returns boolean language sql stable security definer set search_path to '' as $$
  select not public.is_guest()
     and public.has_entitlement('community')
     and exists (select 1 from public.profiles p where p.id = auth.uid() and p.adult_confirmed and p.display_name is not null)
     and not exists (select 1 from public.account_restrictions r where r.user_id = auth.uid() and (r.until is null or r.until > now()));
$$;

create or replace function public.community_status()
returns text language sql stable security definer set search_path to '' as $$
  select case
    when public.is_guest() then 'sign_in'
    when exists (select 1 from public.account_restrictions r where r.user_id = auth.uid() and (r.until is null or r.until > now())) then 'restricted'
    when not public.has_entitlement('community') then 'membership'
    when not exists (select 1 from public.profiles p where p.id = auth.uid() and p.adult_confirmed and p.display_name is not null) then 'profile'
    else 'ok' end;
$$;

create or replace function public.claim_reward(p_offer uuid)
returns table (code text, how_to_use text) language plpgsql security definer set search_path to '' as $$
declare o public.reward_offers%rowtype; n int;
begin
  if public.is_guest() then raise exception 'Sign in to claim rewards' using errcode = '42501'; end if;
  select * into o from public.reward_offers where id = p_offer for update;
  if not found or not o.active or o.starts_at > now() or (o.ends_at is not null and o.ends_at <= now()) then raise exception 'This reward is not available' using errcode = '22023'; end if;
  if not exists (select 1 from public.reward_claims where offer_id = p_offer and user_id = auth.uid()) then
    select count(*) into n from public.workout_completions where user_id = auth.uid();
    if n < o.min_classes then raise exception 'Finish % classes to unlock this reward', o.min_classes using errcode = '22023'; end if;
    if (select count(*) from public.reward_claims where offer_id = p_offer) >= o.max_claims then raise exception 'All of these rewards have been claimed' using errcode = '22023'; end if;
    insert into public.reward_claims (offer_id, user_id) values (p_offer, auth.uid());
  end if;
  return query select o.code, o.how_to_use;
end $$;

create or replace function public.request_private_session(p_instructor uuid, p_starts timestamp with time zone, p_note text default null::text, p_use_credit boolean default true)
returns uuid language plpgsql security definer set search_path to '' as $$
declare s record; cid uuid; sid uuid; price int;
begin
  if public.is_guest() then raise exception 'Please sign in to book.'; end if;
  perform public.expire_unpaid_sessions();
  select * into s from public.booking_settings;
  if not exists (select 1 from public.instructor_open_slots(p_instructor, s.booking_window_days) o where o.starts_at = p_starts) then
    raise exception 'That time is no longer available.';
  end if;
  if exists (select 1 from public.private_sessions where member_id = auth.uid() and status in ('requested', 'confirmed')
             and tstzrange(starts_at, starts_at + make_interval(mins => minutes)) && tstzrange(p_starts, p_starts + make_interval(mins => s.session_minutes))) then
    raise exception 'You already have a session at that time.';
  end if;
  price := case when public.has_entitlement('on_demand') then s.member_price_pence else s.price_pence end;
  if p_use_credit then
    select id into cid from public.coaching_credits
      where user_id = auth.uid() and session_id is null and expires_at > p_starts and expires_at > now()
      order by expires_at limit 1 for update skip locked;
  end if;
  insert into public.private_sessions (member_id, instructor_id, starts_at, minutes, payment, price_pence, credit_id, member_note)
  values (auth.uid(), p_instructor, p_starts, s.session_minutes, case when cid is null then 'unpaid' else 'credit' end,
          case when cid is null then price else 0 end, cid, nullif(left(btrim(coalesce(p_note, '')), 500), ''))
  returning id into sid;
  if cid is not null then update public.coaching_credits set session_id = sid where id = cid; end if;
  return sid;
end $$;

-- 2. One device per membership. A new device takes over automatically instead of showing the
--    "remove a device" screen. Each takeover is still logged so the back office can spot
--    accounts that keep switching devices.
update public.site_settings set max_devices = 1, updated_at = now();
alter table public.site_settings alter column max_devices set default 1;

create or replace function public.register_device(p_device text, p_label text)
returns text language plpgsql security definer set search_path to '' as $$
declare uid uuid := auth.uid(); replaced int;
begin
  if uid is null or p_device is null or char_length(p_device) < 16 then return 'ok'; end if;
  if exists (select 1 from public.user_roles where user_id = uid) then return 'ok'; end if;
  update public.user_devices set last_seen = now(), label = left(coalesce(p_label, label), 80) where user_id = uid and device_id = left(p_device, 64);
  if found then return 'ok'; end if;
  delete from public.user_devices where user_id = uid;
  get diagnostics replaced = row_count;
  insert into public.user_devices (user_id, device_id, label) values (uid, left(p_device, 64), left(coalesce(p_label, 'Unknown device'), 80)) on conflict do nothing;
  if replaced > 0 then
    insert into public.device_limit_events (user_id, label) values (uid, left(p_label, 80));
  end if;
  return 'ok';
end $$;

-- 3. General Chat: one open chat room for every member.
insert into public.groups (kind, slug, name, description, meetup_kind, sort) values
  ('room', 'general', 'General Chat', 'The main BAYSE chat room. Say hello, ask anything and chat with everyone in the club.', 'social', 0)
on conflict (slug) do nothing;
