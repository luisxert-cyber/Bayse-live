-- Four features (18 Nov 2026):
--   1. Live check-ins: recorded when a member taps Join, so BAYSE knows who is in a live class.
--   2. Spotter console: the second instructor sees who has joined and can send a cheer.
--   3. Monthly challenges: finish a number of sessions in a calendar month (Inner Circle and Black).
--   4. Free 7-day Pilates challenge: name and email captured in front of the free trial.

-- 1. Live check-ins ------------------------------------------------------------------------------
create table public.live_checkins (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.live_classes (id) on delete cascade,
  class_date  date not null default ((now() at time zone 'Europe/London')::date),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  unique (class_id, class_date, user_id)
);
create index live_checkins_user_idx on public.live_checkins (user_id, class_date desc);
create index live_checkins_class_idx on public.live_checkins (class_id, class_date);
alter table public.live_checkins enable row level security;
create policy live_checkins_own_read on public.live_checkins for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy live_checkins_own_insert on public.live_checkins for insert to authenticated
  with check (user_id = auth.uid() and public.has_entitlement('live_classes')
              and class_date = (now() at time zone 'Europe/London')::date);

-- 2. Spotter console -----------------------------------------------------------------------------
-- True for the instructors put on a live class (lead or second) and for admins.
create or replace function public.teaches_class(p_class uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.live_class_instructors l
    where l.class_id = p_class and l.instructor_id = public.my_instructor_id());
$$;
revoke all on function public.teaches_class(uuid) from public, anon;
grant execute on function public.teaches_class(uuid) to authenticated;

-- A cheer from an instructor to a member after (or during) a live class.
create table public.live_shoutouts (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.live_classes (id) on delete cascade,
  class_date    date not null,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  instructor_id uuid references public.instructors (id) on delete set null,
  emoji         text not null check (emoji in ('👏', '💪', '🔥', '⭐', '❤️')),
  note          text check (note is null or char_length(note) between 1 and 140),
  created_at    timestamptz not null default now()
);
create index live_shoutouts_user_idx on public.live_shoutouts (user_id, created_at desc);
alter table public.live_shoutouts enable row level security;
create policy live_shoutouts_read on public.live_shoutouts for select to authenticated
  using (user_id = auth.uid() or public.teaches_class(class_id));

-- Who has joined a class today (first names only), for that class's instructors.
create or replace function public.class_roster(p_class uuid)
returns table (user_id uuid, member_name text, joined_at timestamptz, live_count int, first_live boolean, cheered boolean)
language sql stable security definer set search_path = '' as $$
  select c.user_id, coalesce(nullif(p.first_name, ''), nullif(p.display_name, ''), 'Member'), c.joined_at,
    (select count(*)::int from public.live_checkins x where x.user_id = c.user_id),
    not exists (select 1 from public.live_checkins x where x.user_id = c.user_id and x.class_date < c.class_date),
    exists (select 1 from public.live_shoutouts s where s.class_id = c.class_id and s.class_date = c.class_date and s.user_id = c.user_id)
  from public.live_checkins c join public.profiles p on p.id = c.user_id
  where c.class_id = p_class and c.class_date = (now() at time zone 'Europe/London')::date
    and public.teaches_class(p_class)
  order by c.joined_at;
$$;
revoke all on function public.class_roster(uuid) from public, anon;
grant execute on function public.class_roster(uuid) to authenticated;

-- Send a cheer. Only to a member who joined that class today, only from its instructors.
create or replace function public.send_shoutout(p_class uuid, p_user uuid, p_emoji text, p_note text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'Europe/London')::date;
  clean text := nullif(left(btrim(coalesce(p_note, '')), 140), '');
begin
  if not public.teaches_class(p_class) then return false; end if;
  if not exists (select 1 from public.live_checkins c where c.class_id = p_class and c.class_date = today and c.user_id = p_user) then return false; end if;
  insert into public.live_shoutouts (class_id, class_date, user_id, instructor_id, emoji, note)
  values (p_class, today, p_user, public.my_instructor_id(), p_emoji, clean);
  return true;
end;
$$;
revoke all on function public.send_shoutout(uuid, uuid, text, text) from public, anon;
grant execute on function public.send_shoutout(uuid, uuid, text, text) to authenticated;

-- 3. Monthly challenges --------------------------------------------------------------------------
create table public.challenges (
  id          uuid primary key default gen_random_uuid(),
  month       date not null unique check (extract(day from month) = 1),
  title       text not null check (char_length(title) between 2 and 80),
  blurb       text not null default '' check (char_length(blurb) <= 300),
  target      int  not null default 12 check (target between 1 and 60),
  created_at  timestamptz not null default now()
);
alter table public.challenges enable row level security;
create policy challenges_read on public.challenges for select to authenticated using (true);
create policy challenges_admin on public.challenges for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.challenge_entries (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (challenge_id, user_id)
);
alter table public.challenge_entries enable row level security;
create policy challenge_entries_read on public.challenge_entries for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy challenge_entries_join on public.challenge_entries for insert to authenticated
  with check (user_id = auth.uid() and public.has_entitlement('challenges'));
create policy challenge_entries_leave on public.challenge_entries for delete to authenticated
  using (user_id = auth.uid());

-- How many members joined a challenge and how many have reached the target. Counts only, no names.
-- A session is a finished workout or a live class joined, in that calendar month (UK time).
create or replace function public.challenge_stats(p_id uuid)
returns table (joined int, finished int)
language sql stable security definer set search_path = '' as $$
  with c as (select month, target from public.challenges where id = p_id),
  n as (
    select e.user_id,
      (select count(*) from public.workout_completions w
        where w.user_id = e.user_id
          and (w.completed_at at time zone 'Europe/London')::date >= c.month
          and (w.completed_at at time zone 'Europe/London')::date < (c.month + interval '1 month')::date)
      + (select count(*) from public.live_checkins l
        where l.user_id = e.user_id and l.class_date >= c.month and l.class_date < (c.month + interval '1 month')::date) as done
    from public.challenge_entries e, c where e.challenge_id = p_id)
  select (select count(*)::int from n), (select count(*)::int from n, c where n.done >= c.target);
$$;
revoke all on function public.challenge_stats(uuid) from public, anon;
grant execute on function public.challenge_stats(uuid) to authenticated;

-- A challenge for every month to the end of 2027, so there is always one running. Edit them in Admin → Challenges.
insert into public.challenges (month, title, blurb, target)
select m::date,
  (array['Show Up 12', 'Core Reset', 'Strong & Steady', 'Move More May', 'Posture Month', 'Glutes & Legs'])[1 + (n % 6)],
  (array[
    'Twelve sessions this month. Any class counts: timer classes, filmed classes and live classes.',
    'Twelve sessions with your core switched on. Pick core classes when you can.',
    'Three sessions a week, every week. Consistency beats intensity.',
    'Twelve sessions, and try one class style you have never done before.',
    'Twelve sessions for a taller, freer back. Add a stretch class each week.',
    'Twelve sessions for strong glutes and steady legs.'])[1 + (n % 6)],
  12
from (select m, (row_number() over (order by m))::int - 1 as n
      from generate_series(date '2026-11-01', date '2027-12-01', interval '1 month') m) s
on conflict (month) do nothing;

-- 4. Free 7-day Pilates challenge ----------------------------------------------------------------
-- People who start the free challenge on the website. Not members yet: no account, no password.
create table public.challenge_leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(btrim(email)) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  first_name    text not null check (char_length(first_name) between 1 and 60),
  marketing_ok  boolean not null default false,
  health_ok_at  timestamptz not null default now(),
  started_on    date not null default ((now() at time zone 'Europe/London')::date),
  days_done     int[] not null default '{}',
  created_at    timestamptz not null default now()
);
alter table public.challenge_leads enable row level security;
-- Only admins read the list. Visitors go through the functions below with their private link id.
create policy challenge_leads_admin on public.challenge_leads for select to authenticated using (public.is_admin());
create policy challenge_leads_admin_delete on public.challenge_leads for delete to authenticated using (public.is_admin());

create or replace function public.challenge_signup(p_email text, p_first text, p_marketing boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  e text := lower(btrim(coalesce(p_email, '')));
  f text := left(btrim(coalesce(p_first, '')), 60);
  out_id uuid;
begin
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(e) > 200 or f = '' then return null; end if;
  insert into public.challenge_leads (email, first_name, marketing_ok)
  values (e, f, coalesce(p_marketing, false))
  on conflict (email) do update set first_name = excluded.first_name,
    marketing_ok = public.challenge_leads.marketing_ok or excluded.marketing_ok
  returning id into out_id;
  return out_id;
end;
$$;
revoke all on function public.challenge_signup(text, text, boolean) from public;
grant execute on function public.challenge_signup(text, text, boolean) to anon, authenticated;

create or replace function public.challenge_lead(p_id uuid)
returns table (first_name text, started_on date, days_done int[], today date)
language sql stable security definer set search_path = '' as $$
  select l.first_name, l.started_on, l.days_done, (now() at time zone 'Europe/London')::date
  from public.challenge_leads l where l.id = p_id;
$$;
revoke all on function public.challenge_lead(uuid) from public;
grant execute on function public.challenge_lead(uuid) to anon, authenticated;

-- Tick off a day. A day opens one day after the last: day 1 on the start date, day 7 six days later.
create or replace function public.challenge_mark_day(p_id uuid, p_day int)
returns void language sql security definer set search_path = '' as $$
  update public.challenge_leads l
  set days_done = (select coalesce(array_agg(distinct d order by d), '{}') from unnest(l.days_done || p_day) d)
  where l.id = p_id and p_day between 1 and 7
    and p_day <= ((now() at time zone 'Europe/London')::date - l.started_on) + 1;
$$;
revoke all on function public.challenge_mark_day(uuid, int) from public;
grant execute on function public.challenge_mark_day(uuid, int) to anon, authenticated;
