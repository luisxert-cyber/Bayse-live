-- Reports from the master brief: trial conversion, churn, live attendance by class and time, Black profitability.
-- Admins only. Test accounts (@example.com) are left out.
create or replace function public.admin_reports() returns jsonb
language plpgsql stable security definer set search_path to '' as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  with real_users as (
    select u.id from auth.users u where not coalesce(u.is_anonymous, false) and u.email not ilike '%@example.com'
  ),
  subs as (select s.* from public.subscriptions s join real_users u on u.id = s.user_id),
  att as (
    select b.class_id, c.name, c.weekday, c.starts_at, count(*) filter (where b.status = 'booked')::int as booked,
      count(*) filter (where b.joined_at is not null)::int as attended, count(distinct b.user_id)::int as people
    from public.live_class_bookings b join public.live_classes c on c.id = b.class_id join real_users u on u.id = b.user_id
    where b.class_date >= (now() at time zone 'Europe/London')::date - 56
    group by b.class_id, c.name, c.weekday, c.starts_at
  ),
  black as (
    select
      (select count(distinct e.user_id) from public.entitlements e join real_users u on u.id = e.user_id
        where e.entitlement_key = 'individual_coaching' and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now()))::int as members,
      (select count(*) from public.coaching_credits c where c.source = 'subscription' and c.created_at > now() - interval '56 days')::int as credits_given,
      (select count(*) from public.coaching_credits c where c.source = 'subscription' and c.created_at > now() - interval '56 days' and c.session_id is not null)::int as credits_booked,
      (select count(*) from public.private_sessions ps join public.coaching_credits c on c.session_id = ps.id
        where c.source = 'subscription' and ps.status in ('completed') and ps.starts_at > now() - interval '56 days')::int as completed,
      (select count(*) from public.private_sessions ps join public.coaching_credits c on c.session_id = ps.id
        where c.source = 'subscription' and ps.status in ('no_show', 'late_cancelled') and ps.starts_at > now() - interval '56 days')::int as missed
  )
  select jsonb_build_object(
    'trials_started', (select count(*) from subs where trial_end is not null),
    'trials_converted', (select count(*) from subs where trial_end is not null and trial_end < now() and status in ('active', 'past_due')),
    'trials_ended', (select count(*) from subs where trial_end is not null and trial_end < now()),
    'active_28d_ago', (select count(*) from subs where created_at < now() - interval '28 days' and (status in ('active', 'past_due') or (status = 'canceled' and updated_at > now() - interval '28 days'))),
    'cancelled_28d', (select count(*) from subs where status = 'canceled' and updated_at > now() - interval '28 days'),
    'attendance', (select coalesce(jsonb_agg(to_jsonb(a) order by a.attended desc, a.booked desc), '[]') from att a),
    'attendance_by_hour', (select coalesce(jsonb_agg(jsonb_build_object('hour', h, 'attended', n) order by h), '[]')
        from (select extract(hour from starts_at)::int h, sum(attended)::int n from att group by 1) x),
    'black', (select to_jsonb(b) from black b),
    'instructor_rate_pence', (select instructor_rate_pence from public.booking_settings),
    'black_price_pence', (select amount_pence from public.prices p join public.plans pl on pl.id = p.plan_id where pl.key = 'coaching' and p.audience = 'standard' limit 1),
    'black_studio_price_pence', (select amount_pence from public.prices p join public.plans pl on pl.id = p.plan_id where pl.key = 'coaching' and p.audience = 'studio' limit 1)
  ) into r;
  return r;
end $$;
revoke all on function public.admin_reports() from public, anon;
grant execute on function public.admin_reports() to authenticated;

-- Launch checklist: facts only the database knows (no secrets).
create or replace function public.launch_status() returns jsonb
language sql stable security definer set search_path to '' as $$
  select case when not public.is_admin() then null else jsonb_build_object(
    'prices_missing', (select coalesce(jsonb_agg(pl.name || case when p.audience = 'studio' then ' (studio)' else '' end), '[]')
        from public.prices p join public.plans pl on pl.id = p.plan_id where p.active and p.amount_pence > 0 and p.stripe_price_id is null),
    'webhook_events_7d', (select count(*) from public.stripe_events where processed_at > now() - interval '7 days'),
    'webhook_errors_7d', (select count(*) from public.stripe_events where error is not null),
    'flags', (select jsonb_object_agg(key, enabled) from public.feature_flags),
    'instructors_published', (select count(*) from public.instructors where status = 'published' and active),
    'live_classes', (select count(*) from public.live_classes where active and status = 'live' and one_off_date is null),
    'live_without_instructor', (select count(*) from public.live_classes c where c.active and c.status = 'live' and c.one_off_date is null
        and not exists (select 1 from public.live_class_instructors l where l.class_id = c.id)),
    'live_without_zoom', (select count(*) from public.live_classes c where c.active and c.status = 'live' and c.one_off_date is null
        and not exists (select 1 from public.live_class_links l where l.class_id = c.id)),
    'video_classes', (select count(*) from public.video_classes where status = 'published')
  ) end;
$$;
revoke all on function public.launch_status() from public, anon;
grant execute on function public.launch_status() to authenticated;
