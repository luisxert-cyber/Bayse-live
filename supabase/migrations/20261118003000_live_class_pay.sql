-- Live class pay: instructors earn a flat rate for every live class they teach, on the same pay cycle as 1-to-1s.
-- Each live class now has one instructor. A class is logged for pay once it has finished, against whoever is on the
-- timetable at that moment, so later timetable changes never rewrite what has already been earned.
alter table public.booking_settings
  add column if not exists live_class_rate_pence int not null default 1500 check (live_class_rate_pence >= 0),
  add column if not exists live_logged_until timestamptz not null default now();

-- One instructor per class.
delete from public.live_class_instructors where not lead;
update public.live_class_instructors set lead = true where not lead;
alter table public.live_class_instructors alter column lead set default true;
create unique index if not exists live_class_instructors_one_per_class on public.live_class_instructors (class_id);

create table public.live_class_log (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid references public.live_classes (id) on delete set null,
  class_name    text not null,
  class_date    date not null,
  starts_at     time not null,
  instructor_id uuid not null references public.instructors (id),
  rate_pence    int not null check (rate_pence >= 0),
  created_at    timestamptz not null default now(),
  unique (class_id, class_date)
);
create index live_class_log_instructor_idx on public.live_class_log (instructor_id, class_date);
alter table public.live_class_log enable row level security;
create policy live_class_log_read on public.live_class_log for select to authenticated
  using (public.is_admin() or instructor_id = public.my_instructor_id());
create policy live_class_log_admin_delete on public.live_class_log for delete to authenticated using (public.is_admin());

-- Log every class that has finished since the last time this ran. Safe to call as often as you like.
create or replace function public.record_live_classes() returns int
language plpgsql security definer set search_path to '' as $$
declare s record; n int; t timestamptz := now();
begin
  select live_logged_until, live_class_rate_pence into s from public.booking_settings for update;
  if s.live_logged_until is null or s.live_logged_until >= t then return 0; end if;
  insert into public.live_class_log (class_id, class_name, class_date, starts_at, instructor_id, rate_pence)
  select c.id, c.name, d.day::date, c.starts_at, l.instructor_id, s.live_class_rate_pence
  from generate_series((s.live_logged_until at time zone 'Europe/London')::date - 1, (t at time zone 'Europe/London')::date, interval '1 day') as d(day)
  join public.live_classes c on c.active and c.weekday = extract(isodow from d.day)::int
  join public.live_class_instructors l on l.class_id = c.id
  cross join lateral (select ((d.day::date + c.starts_at) at time zone 'Europe/London') + make_interval(mins => c.minutes) as ends) e
  where e.ends > s.live_logged_until and e.ends <= t
  on conflict (class_id, class_date) do nothing;
  get diagnostics n = row_count;
  update public.booking_settings set live_logged_until = t where id;
  return n;
end $$;
revoke all on function public.record_live_classes() from public, anon;
grant execute on function public.record_live_classes() to authenticated;

-- Before the timetable changes, log what has already been taught under the old timetable.
create or replace function public.record_live_classes_trg() returns trigger
language plpgsql security definer set search_path to '' as $$
begin
  perform public.record_live_classes();
  return null;
end $$;
create trigger live_class_instructors_log before insert or update or delete on public.live_class_instructors
  for each statement execute function public.record_live_classes_trg();
create trigger live_classes_log before update or delete on public.live_classes
  for each statement execute function public.record_live_classes_trg();

alter table public.pay_run_lines add column if not exists live_classes int not null default 0;

-- Pay for a period: 1-to-1s plus live classes.
drop function if exists public.instructor_pay(date, date);
create or replace function public.instructor_pay_calc(p_from date, p_to date)
returns table (instructor_id uuid, instructor_name text, sessions int, late_cancellations int, live_classes int, amount_pence int)
language sql stable security definer set search_path to '' as $$
  with s as (select * from public.booking_settings),
  one as (
    select ps.instructor_id as iid,
      count(*) filter (where ps.status in ('completed', 'no_show') or (ps.status = 'confirmed' and ps.starts_at + make_interval(mins => ps.minutes) <= now()))::int as sessions,
      count(*) filter (where ps.status = 'late_cancelled')::int as late,
      count(*) filter (where ps.status in ('completed', 'no_show') or (ps.status = 'confirmed' and ps.starts_at + make_interval(mins => ps.minutes) <= now())
                          or (ps.status = 'late_cancelled' and (select pay_late_cancellations from s)))::int as payable
    from public.private_sessions ps
    where (ps.starts_at at time zone 'Europe/London')::date between p_from and p_to
    group by ps.instructor_id
  ),
  live as (
    select g.instructor_id as iid, count(*)::int as classes, sum(g.rate_pence)::int as amount
    from public.live_class_log g where g.class_date between p_from and p_to group by g.instructor_id
  )
  select i.id, i.display_name, coalesce(o.sessions, 0), coalesce(o.late, 0), coalesce(v.classes, 0),
    (coalesce(o.payable, 0) * (select instructor_rate_pence from s) + coalesce(v.amount, 0))::int
  from public.instructors i
  left join one o on o.iid = i.id
  left join live v on v.iid = i.id
  where (o.iid is not null or v.iid is not null)
    and (public.is_admin() or i.id = public.my_instructor_id())
  order by i.display_name;
$$;
revoke all on function public.instructor_pay_calc(date, date) from public, anon;
grant execute on function public.instructor_pay_calc(date, date) to authenticated;

create or replace function public.instructor_pay(p_from date, p_to date)
returns table (instructor_id uuid, instructor_name text, sessions int, late_cancellations int, live_classes int, amount_pence int)
language plpgsql security definer set search_path to '' as $$
begin
  perform public.record_live_classes();
  return query select * from public.instructor_pay_calc(p_from, p_to);
end $$;
revoke all on function public.instructor_pay(date, date) from public, anon;
grant execute on function public.instructor_pay(date, date) to authenticated;

create or replace function public.close_pay_run(p_start date) returns uuid
language plpgsql security definer set search_path to '' as $$
declare rid uuid; d int; e date;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select pay_cycle_days into d from public.booking_settings;
  e := p_start + d - 1;
  if e >= (now() at time zone 'Europe/London')::date then raise exception 'This pay period has not finished yet.'; end if;
  insert into public.pay_runs (period_start, period_end, approved_by) values (p_start, e, auth.uid()) returning id into rid;
  insert into public.pay_run_lines (pay_run_id, instructor_id, sessions, late_cancellations, live_classes, amount_pence)
    select rid, x.instructor_id, x.sessions, x.late_cancellations, x.live_classes, x.amount_pence from public.instructor_pay(p_start, e) x;
  insert into public.audit_log (actor_id, action, entity, entity_id) values (auth.uid(), 'pay_run.approved', 'pay_run', rid::text);
  return rid;
end $$;
