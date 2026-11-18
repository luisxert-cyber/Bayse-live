-- Running the timetable from the back office: add weekly classes, add one-off classes, cancel a single date,
-- and stop a class running. A cancelled class cannot be booked or joined and is not paid.
alter table public.live_classes add column if not exists one_off_date date;
alter table public.live_classes add constraint live_classes_one_off_weekday
  check (one_off_date is null or weekday = extract(isodow from one_off_date)::int);

-- Only one weekly class per slot, but stopped classes and one-off classes do not hold the slot.
do $$
declare c text;
begin
  for c in select conname from pg_constraint where conrelid = 'public.live_classes'::regclass and contype = 'u' loop
    execute format('alter table public.live_classes drop constraint %I', c);
  end loop;
end $$;
create unique index if not exists live_classes_weekly_slot on public.live_classes (weekday, starts_at) where one_off_date is null and active;
create unique index if not exists live_classes_one_off_slot on public.live_classes (one_off_date, starts_at) where one_off_date is not null and active;

create table public.live_class_cancellations (
  class_id   uuid not null references public.live_classes (id) on delete cascade,
  class_date date not null,
  reason     text check (char_length(reason) <= 200),
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (class_id, class_date)
);
alter table public.live_class_cancellations enable row level security;
create policy live_cancellations_read on public.live_class_cancellations for select to authenticated using (true);
create policy live_cancellations_staff on public.live_class_cancellations for all to authenticated
  using (public.is_support()) with check (public.is_support());

-- Does this class run on this date? (Right weekday, the one date for a one-off, and not cancelled.)
create or replace function public.live_class_runs(p_class uuid, p_date date) returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.live_classes c where c.id = p_class and c.active
      and c.weekday = extract(isodow from p_date)::int and (c.one_off_date is null or c.one_off_date = p_date))
    and not exists (select 1 from public.live_class_cancellations x where x.class_id = p_class and x.class_date = p_date);
$$;
grant execute on function public.live_class_runs(uuid, date) to authenticated;

create or replace function public.live_schedule(p_days int default 7)
returns table (class_id uuid, class_date date, starts_at time, name text, minutes int, starts_ts timestamptz, booked int, mine boolean, state text)
language sql stable security definer set search_path to '' as $$
  with d as (
    select g::date as day from generate_series((now() at time zone 'Europe/London')::date,
      (now() at time zone 'Europe/London')::date + (least(greatest(p_days, 1), 14) - 1), interval '1 day') g
  ),
  occ as (
    select c.id, d.day, c.starts_at, c.name, c.minutes, ((d.day + c.starts_at) at time zone 'Europe/London') as ts
    from d join public.live_classes c on c.active and c.weekday = extract(isodow from d.day)::int and (c.one_off_date is null or c.one_off_date = d.day)
  )
  select o.id, o.day, o.starts_at, o.name, o.minutes, o.ts,
    (select count(*)::int from public.live_class_bookings b where b.class_id = o.id and b.class_date = o.day and b.status = 'booked'),
    exists (select 1 from public.live_class_bookings b where b.class_id = o.id and b.class_date = o.day and b.status = 'booked' and b.user_id = auth.uid()),
    case when exists (select 1 from public.live_class_cancellations x where x.class_id = o.id and x.class_date = o.day) then 'cancelled'
         when o.ts + make_interval(mins => o.minutes) <= now() then 'finished'
         when o.ts - interval '15 minutes' <= now() then 'open' else 'upcoming' end
  from occ o
  where auth.uid() is not null
  order by o.ts;
$$;

create or replace function public.book_live_class(p_class uuid, p_date date) returns text
language plpgsql security definer set search_path to '' as $$
declare c record; today date := (now() at time zone 'Europe/London')::date;
begin
  if auth.uid() is null then raise exception 'not allowed'; end if;
  if not (public.has_entitlement('live_classes') or public.is_support()) then raise exception 'Live classes come with BAYSE Inner Circle and BAYSE Black.'; end if;
  select * into c from public.live_classes where id = p_class;
  if c.id is null or not public.live_class_runs(p_class, p_date) then raise exception 'That class is not running on that day.'; end if;
  if p_date < today or p_date > today + 13 then raise exception 'You can book up to two weeks ahead.'; end if;
  if ((p_date + c.starts_at) at time zone 'Europe/London') + make_interval(mins => c.minutes) <= now() then raise exception 'That class has finished.'; end if;
  insert into public.live_class_bookings (class_id, class_date, user_id) values (p_class, p_date, auth.uid())
    on conflict (class_id, class_date, user_id) do update set status = 'booked', cancelled_at = null;
  return 'booked';
end $$;

create or replace function public.join_live_class(p_class uuid, p_date date) returns text
language plpgsql security definer set search_path to '' as $$
declare c record; ts timestamptz; url text;
begin
  if auth.uid() is null then raise exception 'not allowed'; end if;
  if not (public.has_entitlement('live_classes') or public.is_support()) then raise exception 'Live classes come with BAYSE Inner Circle and BAYSE Black.'; end if;
  select * into c from public.live_classes where id = p_class;
  if c.id is null or not public.live_class_runs(p_class, p_date) then raise exception 'That class is not running on that day.'; end if;
  ts := (p_date + c.starts_at) at time zone 'Europe/London';
  if now() < ts - interval '15 minutes' then raise exception 'The room opens 15 minutes before the class starts.'; end if;
  if now() >= ts + make_interval(mins => c.minutes) then raise exception 'That class has finished.'; end if;
  select join_url into url from public.live_class_links where class_id = p_class;
  if url is null then raise exception 'The Zoom link for this class has not been set yet.'; end if;
  insert into public.live_class_bookings as b (class_id, class_date, user_id, joined_at) values (p_class, p_date, auth.uid(), now())
    on conflict (class_id, class_date, user_id) do update set status = 'booked', cancelled_at = null, joined_at = coalesce(b.joined_at, now());
  return url;
end $$;

-- Pay log: cancelled dates are not logged, and one-off classes only count on their date.
create or replace function public.record_live_classes() returns int
language plpgsql security definer set search_path to '' as $$
declare s record; n int; t timestamptz := now();
begin
  select live_logged_until, live_class_rate_pence into s from public.booking_settings for update;
  if s.live_logged_until is null or s.live_logged_until >= t then return 0; end if;
  insert into public.live_class_log (class_id, class_name, class_date, starts_at, instructor_id, rate_pence)
  select c.id, c.name, d.day::date, c.starts_at, l.instructor_id, s.live_class_rate_pence
  from generate_series((s.live_logged_until at time zone 'Europe/London')::date - 1, (t at time zone 'Europe/London')::date, interval '1 day') as d(day)
  join public.live_classes c on c.active and c.weekday = extract(isodow from d.day)::int and (c.one_off_date is null or c.one_off_date = d.day::date)
  join public.live_class_instructors l on l.class_id = c.id
  cross join lateral (select ((d.day::date + c.starts_at) at time zone 'Europe/London') + make_interval(mins => c.minutes) as ends) e
  where e.ends > s.live_logged_until and e.ends <= t
    and not exists (select 1 from public.live_class_cancellations x where x.class_id = c.id and x.class_date = d.day::date)
  on conflict (class_id, class_date) do nothing;
  get diagnostics n = row_count;
  update public.booking_settings set live_logged_until = t where id;
  return n;
end $$;
