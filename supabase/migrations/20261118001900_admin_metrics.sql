-- One call for the back-office dashboard. Admins only. Counts exclude anonymous (unfinished) sign-ups.
create or replace function public.admin_metrics() returns jsonb
language plpgsql stable security definer set search_path to '' as $$
declare
  r jsonb; month_start timestamptz := date_trunc('month', now() at time zone 'Europe/London') at time zone 'Europe/London';
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  with accounts as (
    select p.id, p.created_at, p.onboarding_completed_at from public.profiles p join auth.users u on u.id = p.id where not coalesce(u.is_anonymous, false) and u.email not ilike '%@example.com'
  ),
  subs as (
    select s.*, pr.amount_pence, pr.billing_interval, pl.name as plan_name
    from public.subscriptions s left join public.prices pr on pr.id = s.price_id left join public.plans pl on pl.id = coalesce(s.plan_id, pr.plan_id)
  ),
  access as (
    select distinct e.user_id from public.entitlements e join accounts a on a.id = e.user_id where e.entitlement_key = 'on_demand' and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  ),
  weeks as (
    select gs::date as wk from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') gs
  )
  select jsonb_build_object(
    'accounts', (select count(*) from accounts),
    'test_accounts', (select count(*) from auth.users u where u.email ilike '%@example.com'),
    'onboarded', (select count(*) from accounts where onboarding_completed_at is not null),
    'new_7d', (select count(*) from accounts where created_at > now() - interval '7 days'),
    'new_30d', (select count(*) from accounts where created_at > now() - interval '30 days'),
    'with_access', (select count(*) from access),
    'trialing', (select count(*) from subs where status = 'trialing'),
    'paying', (select count(*) from subs where status = 'active'),
    'past_due', (select count(*) from subs where status in ('past_due', 'unpaid')),
    'cancelling', (select count(*) from subs where status in ('active', 'trialing') and cancel_at_period_end),
    'cancelled_30d', (select count(*) from subs where status = 'canceled' and updated_at > now() - interval '30 days'),
    'manual_access', (select count(distinct e.user_id) from public.entitlements e join accounts a on a.id = e.user_id where e.entitlement_key = 'on_demand' and e.source = 'manual' and (e.ends_at is null or e.ends_at > now())),
    'studio_linked', (select count(*) from public.studio_memberships where status = 'verified'),
    'mrr_pence', (select coalesce(sum(case when billing_interval = 'year' then amount_pence / 12.0 else amount_pence end), 0)::int from subs where status = 'active'),
    'plans', (select coalesce(jsonb_agg(x order by x->>'plan'), '[]') from (
        select jsonb_build_object('plan', coalesce(plan_name, 'Unknown'), 'paying', count(*) filter (where status = 'active'), 'trialing', count(*) filter (where status = 'trialing'),
          'mrr_pence', coalesce(sum(case when status = 'active' then case when billing_interval = 'year' then amount_pence / 12.0 else amount_pence end end), 0)::int) x
        from subs where status in ('active', 'trialing') group by plan_name) t),
    'signups_by_week', (select jsonb_agg(jsonb_build_object('week', w.wk, 'n', (select count(*) from accounts a where a.created_at >= w.wk and a.created_at < w.wk + 7))) from weeks w),
    'sessions_month', (select count(*) from public.private_sessions where starts_at >= month_start and status in ('confirmed', 'completed', 'no_show', 'late_cancelled')),
    'sessions_requests', (select count(*) from public.private_sessions where status = 'requested'),
    'sessions_revenue_month_pence', (select coalesce(sum(price_pence), 0) from public.private_sessions where payment = 'paid' and created_at >= month_start),
    'refunds_due', (select count(*) from public.private_sessions where payment = 'refund_due'),
    'credits_unused', (select count(*) from public.coaching_credits where session_id is null and expires_at > now()),
    'workouts_7d', (select count(*) from public.workout_completions where completed_at > now() - interval '7 days'),
    'active_members_7d', (select count(distinct user_id) from public.workout_completions where completed_at > now() - interval '7 days'),
    'instructors', (select count(*) from public.instructors where active),
    'instructors_pending', (select count(*) from public.instructors where status = 'pending'),
    'video_classes', (select count(*) from public.video_classes where status = 'published'),
    'open_reports', (select count(*) from public.reports where status = 'open')
  ) into r;
  return r;
end $$;
revoke all on function public.admin_metrics() from public, anon;
grant execute on function public.admin_metrics() to authenticated;
