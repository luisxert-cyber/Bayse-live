-- Unpaid 1-to-1 requests hold the time for 30 minutes (the Stripe Checkout link expires then too).
-- After that they lapse: the time is free again and the request is closed as "payment not completed".
create or replace function public.expire_unpaid_sessions() returns int
language sql security definer set search_path to '' as $$
  with x as (
    update public.private_sessions set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Payment not completed'
    where status = 'requested' and payment = 'unpaid' and created_at < now() - interval '30 minutes'
    returning 1)
  select count(*)::int from x;
$$;
revoke all on function public.expire_unpaid_sessions() from public, anon;
grant execute on function public.expire_unpaid_sessions() to authenticated;

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
        and not (ps.status = 'requested' and ps.payment = 'unpaid' and ps.created_at < now() - interval '30 minutes')
        and tstzrange(ps.starts_at, ps.starts_at + make_interval(mins => ps.minutes)) && tstzrange(c.starts_at, c.starts_at + make_interval(mins => (select session_minutes from s))))
  order by 1;
$$;

create or replace function public.request_private_session(p_instructor uuid, p_starts timestamptz, p_note text default null, p_use_credit boolean default true)
returns uuid
language plpgsql security definer set search_path to '' as $$
declare s record; cid uuid; sid uuid; price int;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'Please sign in to book.'; end if;
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
