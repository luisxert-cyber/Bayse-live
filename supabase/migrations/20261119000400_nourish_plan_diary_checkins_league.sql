-- 19 November 2026: Nourish goals, plan and food diary; the daily check-in behind Progress;
-- member levels beside names and the weekly league.

-- ---------- Nourish: goals and how (or whether) the member wants to track food ----------
-- Tracking is the member's choice: none, a simple log, protein, or full calories and macros.
-- BAYSE never sets a calorie target. Any target is one the member types in themselves.
create table if not exists public.nourish_settings (
  user_id        uuid primary key references public.profiles (id) on delete cascade default auth.uid(),
  goals          text[] not null default '{}' check (goals <@ array['protein','energy','quick','family','budget','plants','batch','balanced']::text[]),
  tracking       text not null default 'none' check (tracking in ('none','simple','protein','full')),
  protein_target int check (protein_target between 20 and 300),
  calorie_target int check (calorie_target between 1200 and 6000),
  updated_at     timestamptz not null default now()
);
alter table public.nourish_settings enable row level security;
drop policy if exists nourish_settings_own on public.nourish_settings;
create policy nourish_settings_own on public.nourish_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Food diary. Private to the member: never visible to staff or other members.
create table if not exists public.food_diary (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  day        date not null,
  meal       text not null check (meal in ('Breakfast','Lunch','Dinner','Snack')),
  label      text not null check (char_length(label) between 1 and 120),
  recipe_key text check (recipe_key ~ '^[a-z0-9-]{2,60}$'),
  calories   int check (calories between 0 and 5000),
  protein_g  int check (protein_g between 0 and 500),
  carbs_g    int check (carbs_g between 0 and 1000),
  fat_g      int check (fat_g between 0 and 500),
  created_at timestamptz not null default now()
);
create index if not exists food_diary_user_day on public.food_diary (user_id, day);
alter table public.food_diary enable row level security;
drop policy if exists food_diary_own on public.food_diary;
create policy food_diary_own on public.food_diary for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (select count(*) from public.food_diary d where d.user_id = auth.uid() and d.day = food_diary.day) < 40);

-- ---------- Progress: a daily check-in instead of a wearable ----------
-- The member tells BAYSE how they slept and feel; Progress turns that into recovery and sleep scores.
-- Private to the member: never visible to staff or other members.
create table if not exists public.daily_checkins (
  user_id       uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  day           date not null,
  sleep_hours   numeric(3,1) not null check (sleep_hours between 0 and 14),
  sleep_quality int not null check (sleep_quality between 1 and 5),
  energy        int not null check (energy between 1 and 5),
  soreness      int not null check (soreness between 1 and 5),
  stress        int not null check (stress between 1 and 5),
  mood          int not null check (mood between 1 and 5),
  created_at    timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.daily_checkins enable row level security;
drop policy if exists daily_checkins_own on public.daily_checkins;
create policy daily_checkins_own on public.daily_checkins for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Levels beside names and the weekly league ----------
-- Members can leave the league and hide their level in Community → Privacy.
alter table public.discovery_prefs add column if not exists show_in_rankings boolean not null default true;

-- Monday-based week number in UK time. Matches weekIndex() in lib/daily/progress.ts.
create or replace function public.bayse_week(ts timestamptz)
returns int language sql stable set search_path to '' as $$
  select ((((ts at time zone 'Europe/London')::date - date '1970-01-01') + 3) / 7)::int;
$$;

-- Points for a set of members. Matches computeGame() in lib/daily/game.ts:
-- 10 a session, 15 a live class joined, 25 bonus for each week the weekly goal was met.
-- Internal: only called by the two functions below, which decide who may be seen.
create or replace function public.member_points(p_ids uuid[])
returns table (user_id uuid, points int, week_points int)
language sql stable security definer set search_path to '' as $$
  with ids as (select distinct unnest(p_ids) as id),
  acts as (
    select w.user_id, w.completed_at as at, false as live from public.workout_completions w where w.user_id = any (p_ids)
    union all
    select b.user_id, b.joined_at, true from public.live_class_bookings b where b.user_id = any (p_ids) and b.joined_at is not null
  ),
  wk as (
    select a.user_id, public.bayse_week(a.at) as w, count(*)::int as n, sum(case when a.live then 15 else 10 end)::int as pts
    from acts a group by a.user_id, public.bayse_week(a.at)
  ),
  goal as (
    select i.id, greatest(1, coalesce(
      (select r.sessions_per_week from public.programme_recommendations r where r.user_id = i.id order by r.created_at desc limit 1),
      (select o.sessions_per_week from public.onboarding_answers o where o.user_id = i.id), 3)) as g
    from ids i
  )
  select g.id,
    coalesce(sum(wk.pts + case when wk.n >= g.g then 25 else 0 end), 0)::int,
    coalesce(sum(case when wk.w = public.bayse_week(now()) then wk.pts + case when wk.n >= g.g then 25 else 0 end else 0 end), 0)::int
  from goal g left join wk on wk.user_id = g.id
  group by g.id;
$$;
revoke all on function public.member_points(uuid[]) from public, anon, authenticated;

-- Can the caller see this member's level and league place?
create or replace function public.rank_visible(p_id uuid)
returns boolean language sql stable security definer set search_path to '' as $$
  select p_id = auth.uid() or (
    not public.is_blocked_between(p_id)
    and coalesce((select d.show_in_rankings from public.discovery_prefs d where d.user_id = p_id), true));
$$;
revoke all on function public.rank_visible(uuid) from public, anon, authenticated;

-- Points for people the caller can already see in the community (for the level beside a name).
create or replace function public.member_levels(p_ids uuid[])
returns table (user_id uuid, points int)
language sql stable security definer set search_path to '' as $$
  select m.user_id, m.points
  from public.member_points(array(select x from unnest(p_ids) x where public.can_participate() and public.rank_visible(x))) m;
$$;
revoke all on function public.member_levels(uuid[]) from public, anon;
grant execute on function public.member_levels(uuid[]) to authenticated;

-- This week's league: members who have earned points since Monday, best first. Resets every Monday.
create or replace function public.weekly_league()
returns table (user_id uuid, display_name text, points int, week_points int, is_me boolean)
language sql stable security definer set search_path to '' as $$
  with eligible as (
    select p.id, p.display_name from public.profiles p
    where public.can_participate() and p.display_name is not null and p.adult_confirmed
      and coalesce(p.email, '') not ilike '%@example.com'
      and public.rank_visible(p.id)
  ),
  pts as (select * from public.member_points(array(select e.id from eligible e)))
  select e.id, e.display_name, pts.points, pts.week_points, e.id = auth.uid()
  from eligible e join pts on pts.user_id = e.id
  where pts.week_points > 0 or e.id = auth.uid()
  order by pts.week_points desc, pts.points desc, e.display_name
  limit 100;
$$;
revoke all on function public.weekly_league() from public, anon;
grant execute on function public.weekly_league() to authenticated;
