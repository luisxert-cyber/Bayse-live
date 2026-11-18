-- Live class booking: members book a place on a class like a studio class, everyone can see how many are booked,
-- and the Zoom room opens 15 minutes before the start. No class-size limit.
create table public.live_class_bookings (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.live_classes (id) on delete cascade,
  class_date   date not null,
  user_id      uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  status       text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at   timestamptz not null default now(),
  cancelled_at timestamptz,
  joined_at    timestamptz,
  reminded_at  timestamptz,
  unique (class_id, class_date, user_id)
);
create index live_class_bookings_user_idx on public.live_class_bookings (user_id, class_date);
create index live_class_bookings_class_idx on public.live_class_bookings (class_id, class_date) where status = 'booked';
alter table public.live_class_bookings enable row level security;
-- Members see their own; staff who help run classes see all; the class's instructor sees who is coming.
create policy live_bookings_read on public.live_class_bookings for select to authenticated using (
  user_id = auth.uid() or public.is_support()
  or exists (select 1 from public.live_class_instructors l where l.class_id = live_class_bookings.class_id and l.instructor_id = public.my_instructor_id()));

-- The next few days of classes, with how many are booked, whether you are, and whether the room is open.
create or replace function public.live_schedule(p_days int default 7)
returns table (class_id uuid, class_date date, starts_at time, name text, minutes int, starts_ts timestamptz, booked int, mine boolean, state text)
language sql stable security definer set search_path to '' as $$
  with d as (
    select g::date as day from generate_series((now() at time zone 'Europe/London')::date,
      (now() at time zone 'Europe/London')::date + (least(greatest(p_days, 1), 14) - 1), interval '1 day') g
  ),
  occ as (
    select c.id, d.day, c.starts_at, c.name, c.minutes, ((d.day + c.starts_at) at time zone 'Europe/London') as ts
    from d join public.live_classes c on c.active and c.weekday = extract(isodow from d.day)::int
  )
  select o.id, o.day, o.starts_at, o.name, o.minutes, o.ts,
    (select count(*)::int from public.live_class_bookings b where b.class_id = o.id and b.class_date = o.day and b.status = 'booked'),
    exists (select 1 from public.live_class_bookings b where b.class_id = o.id and b.class_date = o.day and b.status = 'booked' and b.user_id = auth.uid()),
    case when o.ts + make_interval(mins => o.minutes) <= now() then 'finished'
         when o.ts - interval '15 minutes' <= now() then 'open' else 'upcoming' end
  from occ o
  where auth.uid() is not null
  order by o.ts;
$$;
revoke all on function public.live_schedule(int) from public, anon;
grant execute on function public.live_schedule(int) to authenticated;

create or replace function public.book_live_class(p_class uuid, p_date date) returns text
language plpgsql security definer set search_path to '' as $$
declare c record; today date := (now() at time zone 'Europe/London')::date;
begin
  if auth.uid() is null then raise exception 'not allowed'; end if;
  if not (public.has_entitlement('live_classes') or public.is_support()) then raise exception 'Live classes come with BAYSE Inner Circle and BAYSE Black.'; end if;
  select * into c from public.live_classes where id = p_class and active and weekday = extract(isodow from p_date)::int;
  if c.id is null then raise exception 'That class is not on the timetable.'; end if;
  if p_date < today or p_date > today + 13 then raise exception 'You can book up to two weeks ahead.'; end if;
  if ((p_date + c.starts_at) at time zone 'Europe/London') + make_interval(mins => c.minutes) <= now() then raise exception 'That class has finished.'; end if;
  insert into public.live_class_bookings (class_id, class_date, user_id) values (p_class, p_date, auth.uid())
    on conflict (class_id, class_date, user_id) do update set status = 'booked', cancelled_at = null;
  return 'booked';
end $$;
revoke all on function public.book_live_class(uuid, date) from public, anon;
grant execute on function public.book_live_class(uuid, date) to authenticated;

create or replace function public.cancel_live_booking(p_class uuid, p_date date) returns void
language sql security definer set search_path to '' as $$
  update public.live_class_bookings set status = 'cancelled', cancelled_at = now()
  where class_id = p_class and class_date = p_date and user_id = auth.uid() and status = 'booked';
$$;
revoke all on function public.cancel_live_booking(uuid, date) from public, anon;
grant execute on function public.cancel_live_booking(uuid, date) to authenticated;

-- The Zoom link, only from 15 minutes before the start until the class ends. Joining books you in if you had not booked.
create or replace function public.join_live_class(p_class uuid, p_date date) returns text
language plpgsql security definer set search_path to '' as $$
declare c record; ts timestamptz; url text;
begin
  if auth.uid() is null then raise exception 'not allowed'; end if;
  if not (public.has_entitlement('live_classes') or public.is_support()) then raise exception 'Live classes come with BAYSE Inner Circle and BAYSE Black.'; end if;
  select * into c from public.live_classes where id = p_class and active and weekday = extract(isodow from p_date)::int;
  if c.id is null then raise exception 'That class is not on the timetable.'; end if;
  ts := (p_date + c.starts_at) at time zone 'Europe/London';
  if now() < ts - interval '15 minutes' then raise exception 'The room opens 15 minutes before the class starts.'; end if;
  if now() >= ts + make_interval(mins => c.minutes) then raise exception 'That class has finished.'; end if;
  select join_url into url from public.live_class_links where class_id = p_class;
  if url is null then raise exception 'The Zoom link for this class has not been set yet.'; end if;
  insert into public.live_class_bookings as b (class_id, class_date, user_id, joined_at) values (p_class, p_date, auth.uid(), now())
    on conflict (class_id, class_date, user_id) do update set status = 'booked', cancelled_at = null, joined_at = coalesce(b.joined_at, now());
  return url;
end $$;
revoke all on function public.join_live_class(uuid, date) from public, anon;
grant execute on function public.join_live_class(uuid, date) to authenticated;

-- Live classes a member has joined, for progress, points and stars.
create or replace function public.my_live_attendance()
returns table (class_date date, minutes int, joined_at timestamptz)
language sql stable security definer set search_path to '' as $$
  select b.class_date, c.minutes, b.joined_at from public.live_class_bookings b join public.live_classes c on c.id = b.class_id
  where b.user_id = auth.uid() and b.joined_at is not null order by b.joined_at;
$$;
revoke all on function public.my_live_attendance() from public, anon;
grant execute on function public.my_live_attendance() to authenticated;
