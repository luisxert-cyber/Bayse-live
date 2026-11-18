-- Instructors, staff invites, private 1-to-1 Zoom sessions, Personal Coaching credits and instructor pay.
-- Owner rules (18 Nov 2026):
--   * 1-to-1: 45 minutes, £44.99 for everyone (members included).
--   * Cancel 12 hours or more before: money or credit back. Under 12 hours: the session is lost.
--   * Personal Coaching credit: one per paid billing month, rolls over one extra month, then expires.
--   * Instructors earn £15 per 1-to-1, paid on the usual 28-day pay cycle.
-- Everything is enforced here with RLS and SECURITY DEFINER functions, not only in the screens.

-- Settings (one row) -----------------------------------------------------------------------------
create table public.booking_settings (
  id                        boolean primary key default true check (id),
  session_minutes           int  not null default 45 check (session_minutes between 15 and 120),
  price_pence               int  not null default 4499 check (price_pence >= 0),
  member_price_pence        int  not null default 4499 check (member_price_pence >= 0),
  cancel_cutoff_hours       int  not null default 12 check (cancel_cutoff_hours between 0 and 168),
  booking_notice_hours      int  not null default 12 check (booking_notice_hours between 0 and 168),
  booking_window_days       int  not null default 28 check (booking_window_days between 1 and 180),
  credit_valid_months       int  not null default 2 check (credit_valid_months between 1 and 12),
  instructor_rate_pence     int  not null default 1500 check (instructor_rate_pence >= 0),
  pay_late_cancellations    boolean not null default true,
  pay_cycle_days            int  not null default 28 check (pay_cycle_days between 7 and 62),
  pay_cycle_anchor          date not null default date '2026-11-02',
  updated_at                timestamptz not null default now()
);
insert into public.booking_settings default values;
alter table public.booking_settings enable row level security;
create policy booking_settings_read on public.booking_settings for select using (true);
create policy booking_settings_admin on public.booking_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Instructors ------------------------------------------------------------------------------------
create table public.instructors (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references public.profiles (id) on delete set null,
  slug           text not null unique check (slug ~ '^[a-z0-9-]+$'),
  display_name   text not null check (char_length(display_name) between 2 and 60),
  headline       text check (char_length(headline) <= 120),
  bio            text check (char_length(bio) <= 1500),
  specialities   text[] not null default '{}',
  studios        text[] not null default '{}',
  photos         text[] not null default '{}' check (cardinality(photos) <= 6),
  offers_private boolean not null default true,
  status         text not null default 'draft' check (status in ('draft', 'pending', 'published', 'hidden')),
  active         boolean not null default true,
  sort           int not null default 100,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger instructors_updated before update on public.instructors for each row execute function public.set_updated_at();

-- Zoom room for 1-to-1s: private. Only the instructor, admins, and members with a confirmed session (via RPC).
create table public.instructor_private (
  instructor_id uuid primary key references public.instructors (id) on delete cascade,
  zoom_url      text check (zoom_url is null or zoom_url ~ '^https://([a-z0-9-]+\.)*zoom\.us/')
);

create or replace function public.my_instructor_id() returns uuid
language sql stable security definer set search_path to '' as $$
  select i.id from public.instructors i where i.user_id = auth.uid() and i.active;
$$;

-- Instructors edit their own profile but cannot publish themselves or change who they are.
create or replace function public.instructors_guard() returns trigger
language plpgsql set search_path to '' as $$
begin
  if public.is_admin() then return new; end if;
  new.user_id := old.user_id; new.slug := old.slug; new.active := old.active; new.sort := old.sort;
  if new.status not in ('draft', 'pending') or old.status = 'hidden' then
    -- Any edit to a published profile goes back for approval; hidden stays hidden.
    new.status := case when old.status = 'hidden' then 'hidden' else 'pending' end;
  end if;
  return new;
end $$;
create trigger instructors_guard before update on public.instructors for each row execute function public.instructors_guard();

alter table public.instructors enable row level security;
alter table public.instructor_private enable row level security;
create policy instructors_public on public.instructors for select using (status = 'published' and active);
create policy instructors_own on public.instructors for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy instructors_own_update on public.instructors for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy instructors_admin on public.instructors for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy instructor_private_own on public.instructor_private for all to authenticated
  using (instructor_id = public.my_instructor_id() or public.is_admin())
  with check (instructor_id = public.my_instructor_id() or public.is_admin());

-- Weekly availability for 1-to-1s, UK local time.
create table public.instructor_availability (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  weekday       int  not null check (weekday between 1 and 7),
  start_time    time not null,
  end_time      time not null,
  check (end_time > start_time)
);
create index instructor_availability_idx on public.instructor_availability (instructor_id, weekday);
alter table public.instructor_availability enable row level security;
create policy availability_read on public.instructor_availability for select using (
  exists (select 1 from public.instructors i where i.id = instructor_id and ((i.status = 'published' and i.active) or i.user_id = auth.uid())) or public.is_admin());
create policy availability_own on public.instructor_availability for all to authenticated
  using (instructor_id = public.my_instructor_id() or public.is_admin())
  with check (instructor_id = public.my_instructor_id() or public.is_admin());

-- Who teaches each live class (lead and second instructor).
create table public.live_class_instructors (
  class_id      uuid not null references public.live_classes (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  lead          boolean not null default false,
  primary key (class_id, instructor_id)
);
alter table public.live_class_instructors enable row level security;
create policy lci_read on public.live_class_instructors for select using (true);
create policy lci_admin on public.live_class_instructors for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Instructors see the Zoom links for classes they teach.
create policy live_links_teacher on public.live_class_links for select to authenticated using (
  exists (select 1 from public.live_class_instructors l where l.class_id = live_class_links.class_id and l.instructor_id = public.my_instructor_id()));

-- Staff invites: an admin adds an email and a role; the role is granted when that person's account exists.
create table public.staff_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (email = lower(btrim(email)) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role        public.app_role not null,
  invited_by  uuid references public.profiles (id) default auth.uid(),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (email, role)
);
alter table public.staff_invites enable row level security;
create policy staff_invites_admin on public.staff_invites for all to authenticated
  using (public.is_admin())
  with check (public.is_admin() and (role not in ('admin', 'super_admin') or public.is_super_admin()));

create or replace function public.slugify(t text) returns text
language sql immutable set search_path to '' as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(t), '[^a-z0-9]+', '-', 'g')), ''), 'instructor');
$$;

-- Grants pending invites for one profile. Called by the profile trigger and by admins right after inviting.
create or replace function public.apply_staff_invites(p_profile uuid) returns int
language plpgsql security definer set search_path to '' as $$
declare
  p record; inv record; n int := 0; s text; base text; i int := 1;
begin
  select id, email, coalesce(display_name, first_name, split_part(email, '@', 1)) as name into p from public.profiles where id = p_profile;
  if p.id is null or p.email is null then return 0; end if;
  for inv in select * from public.staff_invites where email = lower(p.email) and accepted_at is null loop
    insert into public.user_roles (user_id, role, granted_by) values (p.id, inv.role, inv.invited_by) on conflict do nothing;
    if inv.role = 'instructor' and not exists (select 1 from public.instructors where user_id = p.id) then
      base := public.slugify(p.name); s := base;
      while exists (select 1 from public.instructors where slug = s) loop i := i + 1; s := base || '-' || i; end loop;
      insert into public.instructors (user_id, slug, display_name) values (p.id, s, left(p.name, 60));
    end if;
    update public.staff_invites set accepted_at = now() where id = inv.id;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.apply_staff_invites(uuid) from public, anon, authenticated;

create or replace function public.staff_invites_on_profile() returns trigger
language plpgsql security definer set search_path to '' as $$
begin
  perform public.apply_staff_invites(new.id);
  return new;
end $$;
create trigger profiles_staff_invites after insert or update of email on public.profiles
  for each row execute function public.staff_invites_on_profile();

-- Admin: invite (or immediately grant, if the account already exists). Returns true when granted now.
create or replace function public.invite_staff(p_email text, p_role public.app_role) returns boolean
language plpgsql security definer set search_path to '' as $$
declare e text := lower(btrim(p_email)); pid uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_role in ('admin', 'super_admin') and not public.is_super_admin() then raise exception 'only a super admin can add admins'; end if;
  insert into public.staff_invites (email, role, invited_by) values (e, p_role, auth.uid())
    on conflict (email, role) do update set accepted_at = null, invited_by = auth.uid(), created_at = now();
  select id into pid from public.profiles where lower(email) = e;
  if pid is null then return false; end if;
  perform public.apply_staff_invites(pid);
  return true;
end $$;
revoke all on function public.invite_staff(text, public.app_role) from public, anon;
grant execute on function public.invite_staff(text, public.app_role) to authenticated;

-- Staff list for admins: everyone with a staff role, plus pending invites.
create or replace function public.staff_list()
returns table (user_id uuid, email text, name text, roles text[], instructor_id uuid, instructor_status text, last_sign_in timestamptz, invited boolean)
language sql stable security definer set search_path to '' as $$
  select p.id, p.email, coalesce(p.display_name, p.first_name), array_agg(distinct r.role::text order by r.role::text),
         i.id, i.status, u.last_sign_in_at, false
  from public.user_roles r join public.profiles p on p.id = r.user_id
  left join public.instructors i on i.user_id = p.id
  left join auth.users u on u.id = p.id
  where public.is_admin()
  group by p.id, p.email, p.display_name, p.first_name, i.id, i.status, u.last_sign_in_at
  union all
  select null, s.email, null, array_agg(s.role::text order by s.role::text), null, null, null, true
  from public.staff_invites s
  where public.is_admin() and s.accepted_at is null
  group by s.email
  order by 8, 2;
$$;
revoke all on function public.staff_list() from public, anon;
grant execute on function public.staff_list() to authenticated;

-- Personal Coaching credits ----------------------------------------------------------------------
create table public.coaching_credits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  period_start  date not null,
  expires_at    timestamptz not null,
  source        text not null check (source in ('subscription', 'manual')),
  source_ref    text unique,                       -- Stripe invoice id: one credit per paid period
  session_id    uuid unique,                       -- set when redeemed; unique, so a credit can only be used once
  note          text check (char_length(note) <= 200),
  created_by    uuid references public.profiles (id),
  created_at    timestamptz not null default now()
);
create index coaching_credits_user on public.coaching_credits (user_id, expires_at);
alter table public.coaching_credits enable row level security;
create policy credits_read on public.coaching_credits for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- No direct writes: credits change only through the functions below and the Stripe webhook (service role).

-- Admin: grant a credit by hand (for testers or goodwill).
create or replace function public.grant_coaching_credit(p_user uuid, p_note text default null) returns uuid
language plpgsql security definer set search_path to '' as $$
declare cid uuid; months int;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select credit_valid_months into months from public.booking_settings;
  insert into public.coaching_credits (user_id, period_start, expires_at, source, note, created_by)
  values (p_user, current_date, (date_trunc('month', now() at time zone 'Europe/London') + make_interval(months => months)) at time zone 'Europe/London', 'manual', left(p_note, 200), auth.uid())
  returning id into cid;
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), 'credit.granted', 'profile', p_user::text, jsonb_build_object('credit_id', cid));
  return cid;
end $$;
revoke all on function public.grant_coaching_credit(uuid, text) from public, anon;
grant execute on function public.grant_coaching_credit(uuid, text) to authenticated;

-- Private sessions -------------------------------------------------------------------------------
create table public.private_sessions (
  id                 uuid primary key default gen_random_uuid(),
  member_id          uuid not null references public.profiles (id) on delete cascade,
  instructor_id      uuid not null references public.instructors (id),
  starts_at          timestamptz not null,
  minutes            int not null default 45,
  status             text not null default 'requested'
                       check (status in ('requested', 'confirmed', 'declined', 'cancelled', 'late_cancelled', 'completed', 'no_show')),
  payment            text not null default 'unpaid' check (payment in ('unpaid', 'paid', 'credit', 'refund_due', 'refunded', 'none')),
  price_pence        int not null default 0,
  credit_id          uuid references public.coaching_credits (id),
  stripe_checkout_id text unique,
  stripe_payment_intent text,
  member_note        text check (char_length(member_note) <= 500),
  instructor_note    text check (char_length(instructor_note) <= 500),
  cancelled_by       uuid references public.profiles (id),
  cancel_reason      text check (char_length(cancel_reason) <= 300),
  responded_at       timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now()
);
create index private_sessions_instructor on public.private_sessions (instructor_id, starts_at);
create index private_sessions_member on public.private_sessions (member_id, starts_at);
alter table public.coaching_credits add constraint coaching_credits_session_fk foreign key (session_id) references public.private_sessions (id) on delete set null;

alter table public.private_sessions enable row level security;
create policy ps_read on public.private_sessions for select to authenticated
  using (member_id = auth.uid() or instructor_id = public.my_instructor_id() or public.is_admin());
-- No direct inserts/updates: only through the functions below (and the webhook for payment).

-- Instructor names for a member's own bookings and the public pages come from the instructors table.
-- Members of a session see each other's first name only through this function.
create or replace function public.session_people(p_id uuid)
returns table (member_name text, instructor_name text)
language sql stable security definer set search_path to '' as $$
  select coalesce(p.display_name, p.first_name, 'Member'), i.display_name
  from public.private_sessions s join public.profiles p on p.id = s.member_id join public.instructors i on i.id = s.instructor_id
  where s.id = p_id and (s.member_id = auth.uid() or s.instructor_id = public.my_instructor_id() or public.is_admin());
$$;
revoke all on function public.session_people(uuid) from public, anon;
grant execute on function public.session_people(uuid) to authenticated;

-- Open 45-minute slots for an instructor, on the half hour, inside their availability.
create or replace function public.instructor_open_slots(p_instructor uuid, p_days int default 14)
returns table (starts_at timestamptz)
language sql stable security definer set search_path to '' as $$
  with s as (select * from public.booking_settings),
  days as (
    select d::date as day from generate_series((now() at time zone 'Europe/London')::date,
      (now() at time zone 'Europe/London')::date + least(greatest(p_days, 1), (select booking_window_days from s)), interval '1 day') d
  ),
  cand as (
    select (t at time zone 'Europe/London') as starts_at
    from days dy
    join public.instructor_availability a on a.instructor_id = p_instructor and a.weekday = extract(isodow from dy.day)::int
    cross join lateral generate_series(dy.day + a.start_time, dy.day + a.end_time - make_interval(mins => (select session_minutes from s)), interval '30 minutes') t
  )
  select c.starts_at from cand c
  join public.instructors i on i.id = p_instructor and i.status = 'published' and i.active and i.offers_private
  where c.starts_at >= now() + make_interval(hours => (select booking_notice_hours from s))
    and not exists (
      select 1 from public.private_sessions ps
      where ps.instructor_id = p_instructor and ps.status in ('requested', 'confirmed')
        and tstzrange(ps.starts_at, ps.starts_at + make_interval(mins => ps.minutes)) && tstzrange(c.starts_at, c.starts_at + make_interval(mins => (select session_minutes from s))))
  order by 1;
$$;
grant execute on function public.instructor_open_slots(uuid, int) to anon, authenticated;

-- Member: request a session. With a valid credit it is reserved straight away; otherwise it awaits payment.
create or replace function public.request_private_session(p_instructor uuid, p_starts timestamptz, p_note text default null, p_use_credit boolean default true)
returns uuid
language plpgsql security definer set search_path to '' as $$
declare s record; cid uuid; sid uuid; price int;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'Please sign in to book.'; end if;
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
    -- Oldest valid credit first, locked so two requests cannot take the same one.
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
revoke all on function public.request_private_session(uuid, timestamptz, text, boolean) from public, anon;
grant execute on function public.request_private_session(uuid, timestamptz, text, boolean) to authenticated;

-- Releases the credit attached to a session (when the session did not happen through no fault of the member).
create or replace function public.release_session_credit(p_session uuid) returns void
language sql security definer set search_path to '' as $$
  update public.coaching_credits set session_id = null where session_id = p_session;
  update public.private_sessions set credit_id = null where id = p_session;
$$;
revoke all on function public.release_session_credit(uuid) from public, anon, authenticated;

-- Instructor (or admin): accept or decline a request. Paid sessions must be paid (or on a credit) before accepting.
create or replace function public.respond_private_session(p_id uuid, p_accept boolean, p_note text default null) returns text
language plpgsql security definer set search_path to '' as $$
declare ps record;
begin
  select * into ps from public.private_sessions where id = p_id for update;
  if ps.id is null or not (ps.instructor_id = public.my_instructor_id() or public.is_admin()) then raise exception 'not allowed'; end if;
  if ps.status <> 'requested' then raise exception 'This request has already been answered.'; end if;
  if p_accept then
    if ps.payment not in ('paid', 'credit', 'none') then raise exception 'This session has not been paid for yet.'; end if;
    update public.private_sessions set status = 'confirmed', responded_at = now(), instructor_note = nullif(left(btrim(coalesce(p_note, '')), 500), '') where id = p_id;
    return 'confirmed';
  end if;
  update public.private_sessions set status = 'declined', responded_at = now(), instructor_note = nullif(left(btrim(coalesce(p_note, '')), 500), ''),
    payment = case when ps.payment = 'paid' then 'refund_due' else ps.payment end where id = p_id;
  perform public.release_session_credit(p_id);
  return 'declined';
end $$;
revoke all on function public.respond_private_session(uuid, boolean, text) from public, anon;
grant execute on function public.respond_private_session(uuid, boolean, text) to authenticated;

-- Cancel. Member 12+ hours before: credit back / refund due. Member under 12 hours: lost (late_cancelled).
-- Instructor or admin cancelling: always credit back / refund due.
create or replace function public.cancel_private_session(p_id uuid, p_reason text default null) returns text
language plpgsql security definer set search_path to '' as $$
declare ps record; cutoff int; by_member boolean; late boolean; st text;
begin
  select * into ps from public.private_sessions where id = p_id for update;
  if ps.id is null then raise exception 'not allowed'; end if;
  by_member := ps.member_id = auth.uid();
  if not (by_member or ps.instructor_id = public.my_instructor_id() or public.is_admin()) then raise exception 'not allowed'; end if;
  if ps.status not in ('requested', 'confirmed') then raise exception 'This session cannot be cancelled.'; end if;
  if ps.starts_at <= now() then raise exception 'This session has already started.'; end if;
  select cancel_cutoff_hours into cutoff from public.booking_settings;
  late := by_member and ps.status = 'confirmed' and ps.starts_at - now() < make_interval(hours => cutoff);
  st := case when late then 'late_cancelled' else 'cancelled' end;
  update public.private_sessions set status = st, cancelled_at = now(), cancelled_by = auth.uid(),
    cancel_reason = nullif(left(btrim(coalesce(p_reason, '')), 300), ''),
    payment = case when not late and ps.payment = 'paid' then 'refund_due' else ps.payment end
  where id = p_id;
  if not late then perform public.release_session_credit(p_id); end if;
  return st;
end $$;
revoke all on function public.cancel_private_session(uuid, text) from public, anon;
grant execute on function public.cancel_private_session(uuid, text) to authenticated;

-- Instructor (or admin): after the session, mark it completed or a no-show.
create or replace function public.mark_private_session(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path to '' as $$
declare ps record;
begin
  if p_status not in ('completed', 'no_show') then raise exception 'invalid'; end if;
  select * into ps from public.private_sessions where id = p_id for update;
  if ps.id is null or not (ps.instructor_id = public.my_instructor_id() or public.is_admin()) then raise exception 'not allowed'; end if;
  if ps.status not in ('confirmed', 'completed', 'no_show') then raise exception 'Only confirmed sessions can be marked.'; end if;
  if ps.starts_at > now() then raise exception 'This session has not happened yet.'; end if;
  update public.private_sessions set status = p_status where id = p_id;
end $$;
revoke all on function public.mark_private_session(uuid, text) from public, anon;
grant execute on function public.mark_private_session(uuid, text) to authenticated;

-- Admin: record that a refund has been made in Stripe.
create or replace function public.mark_session_refunded(p_id uuid) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.private_sessions set payment = 'refunded' where id = p_id and payment = 'refund_due';
  insert into public.audit_log (actor_id, action, entity, entity_id) values (auth.uid(), 'session.refunded', 'private_session', p_id::text);
end $$;
revoke all on function public.mark_session_refunded(uuid) from public, anon;
grant execute on function public.mark_session_refunded(uuid) to authenticated;

-- The Zoom link for a confirmed session: only the member and the instructor, until the session ends.
create or replace function public.private_session_join(p_id uuid) returns text
language sql stable security definer set search_path to '' as $$
  select ip.zoom_url from public.private_sessions s join public.instructor_private ip on ip.instructor_id = s.instructor_id
  where s.id = p_id and s.status = 'confirmed' and s.starts_at + make_interval(mins => s.minutes) > now()
    and (s.member_id = auth.uid() or s.instructor_id = public.my_instructor_id() or public.is_admin());
$$;
revoke all on function public.private_session_join(uuid) from public, anon;
grant execute on function public.private_session_join(uuid) to authenticated;

-- Instructor pay ---------------------------------------------------------------------------------
-- Pay periods are 28 days from the anchor date. A session counts once it has happened
-- (confirmed and finished, completed or no-show) or was cancelled late, if late cancellations are paid.
create or replace function public.pay_period(p_offset int default 0)
returns table (period_start date, period_end date)
language sql stable security definer set search_path to '' as $$
  with s as (select pay_cycle_anchor a, pay_cycle_days d from public.booking_settings),
  n as (select floor(((now() at time zone 'Europe/London')::date - a) / d::numeric)::int + p_offset as k, a, d from s)
  select a + k * d, a + (k + 1) * d - 1 from n;
$$;
grant execute on function public.pay_period(int) to authenticated;

create or replace function public.instructor_pay(p_from date, p_to date)
returns table (instructor_id uuid, instructor_name text, sessions int, late_cancellations int, amount_pence int)
language sql stable security definer set search_path to '' as $$
  with s as (select * from public.booking_settings)
  select i.id, i.display_name,
    count(*) filter (where ps.status in ('completed', 'no_show') or (ps.status = 'confirmed' and ps.starts_at + make_interval(mins => ps.minutes) <= now()))::int,
    count(*) filter (where ps.status = 'late_cancelled')::int,
    (count(*) filter (where ps.status in ('completed', 'no_show') or (ps.status = 'confirmed' and ps.starts_at + make_interval(mins => ps.minutes) <= now())
                                or (ps.status = 'late_cancelled' and (select pay_late_cancellations from s)))
      * (select instructor_rate_pence from s))::int
  from public.private_sessions ps join public.instructors i on i.id = ps.instructor_id
  where (ps.starts_at at time zone 'Europe/London')::date between p_from and p_to
    and (public.is_admin() or i.id = public.my_instructor_id())
  group by i.id, i.display_name
  order by i.display_name;
$$;
revoke all on function public.instructor_pay(date, date) from public, anon;
grant execute on function public.instructor_pay(date, date) to authenticated;

-- Pay runs: an admin closes a period, which saves the figures so they no longer change.
create table public.pay_runs (
  id           uuid primary key default gen_random_uuid(),
  period_start date not null unique,
  period_end   date not null,
  status       text not null default 'approved' check (status in ('approved', 'paid')),
  approved_by  uuid references public.profiles (id),
  approved_at  timestamptz not null default now(),
  paid_at      timestamptz
);
create table public.pay_run_lines (
  pay_run_id    uuid not null references public.pay_runs (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id),
  sessions      int not null,
  late_cancellations int not null,
  amount_pence  int not null,
  primary key (pay_run_id, instructor_id)
);
alter table public.pay_runs enable row level security;
alter table public.pay_run_lines enable row level security;
create policy pay_runs_read on public.pay_runs for select to authenticated using (public.is_admin() or public.my_instructor_id() is not null);
create policy pay_run_lines_read on public.pay_run_lines for select to authenticated using (public.is_admin() or instructor_id = public.my_instructor_id());

create or replace function public.close_pay_run(p_start date) returns uuid
language plpgsql security definer set search_path to '' as $$
declare rid uuid; d int; e date;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select pay_cycle_days into d from public.booking_settings;
  e := p_start + d - 1;
  if e >= (now() at time zone 'Europe/London')::date then raise exception 'This pay period has not finished yet.'; end if;
  insert into public.pay_runs (period_start, period_end, approved_by) values (p_start, e, auth.uid()) returning id into rid;
  insert into public.pay_run_lines (pay_run_id, instructor_id, sessions, late_cancellations, amount_pence)
    select rid, x.instructor_id, x.sessions, x.late_cancellations, x.amount_pence from public.instructor_pay(p_start, e) x;
  insert into public.audit_log (actor_id, action, entity, entity_id) values (auth.uid(), 'pay_run.approved', 'pay_run', rid::text);
  return rid;
end $$;
revoke all on function public.close_pay_run(date) from public, anon;
grant execute on function public.close_pay_run(date) to authenticated;

create or replace function public.mark_pay_run_paid(p_id uuid) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.pay_runs set status = 'paid', paid_at = now() where id = p_id;
  insert into public.audit_log (actor_id, action, entity, entity_id) values (auth.uid(), 'pay_run.paid', 'pay_run', p_id::text);
end $$;
revoke all on function public.mark_pay_run_paid(uuid) from public, anon;
grant execute on function public.mark_pay_run_paid(uuid) to authenticated;

-- Instructor photos: public to view; instructors upload into their own folder; admins manage all.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('instructor-photos', 'instructor-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "instructor-photos: own folder upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'instructor-photos' and ((storage.foldername(name))[1] = public.my_instructor_id()::text or public.is_admin()));
create policy "instructor-photos: own folder replace" on storage.objects for update to authenticated
  using (bucket_id = 'instructor-photos' and ((storage.foldername(name))[1] = public.my_instructor_id()::text or public.is_admin()));
create policy "instructor-photos: own folder remove" on storage.objects for delete to authenticated
  using (bucket_id = 'instructor-photos' and ((storage.foldername(name))[1] = public.my_instructor_id()::text or public.is_admin()));
