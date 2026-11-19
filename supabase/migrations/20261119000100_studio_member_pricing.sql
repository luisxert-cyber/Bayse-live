-- Owner brief (19 Nov 2026): studio members get BAYSE Foundation free and 50% off Inner Circle and Black.
--   Standard (every 28 days): Foundation £19.99 · Inner Circle £39.99 · Black £79.99
--   Verified £99 / £148 studio members: Foundation included · Inner Circle £19.99 · Black £39.99
-- Nothing here touches Stripe or any existing subscription.

-- 1. Foundation includes member challenges (community is already included) --------------------
insert into public.plan_entitlements (plan_id, entitlement_key)
select id, 'challenges' from public.plans where key = 'essential'
on conflict do nothing;

-- 2. Qualifying studio memberships now include Foundation only (was Inner Circle level).
--    Live classes come with the paid Inner Circle or Black upgrade; no private-session credit is included.
delete from public.studio_tier_entitlements
 where tier in ('studio_99', 'studio_148') and entitlement_key in ('live_classes', 'group_coaching');

-- 3. Studio-member prices. A separate price per plan, never a public coupon.
--    Checkout only accepts a 'studio' price for a member the database says is eligible.
alter table public.prices add column audience text not null default 'standard'
  check (audience in ('standard', 'studio'));

insert into public.prices (plan_id, billing_interval, amount_pence, trial_days, audience)
select p.id, '28_days', v.amount, 0, 'studio'
  from public.plans p
  join (values ('club', 1999), ('coaching', 3999)) as v(plan, amount) on v.plan = p.key
 where not exists (select 1 from public.prices x where x.plan_id = p.id and x.audience = 'studio');

-- 4. Eligibility is re-checked. A verified link carries a date it must be re-confirmed by,
--    and an ended link records when it ended so the 28-day notice period can run.
alter table public.studio_memberships
  add column verified_until date,
  add column ended_at timestamptz;

-- Links verified before this migration get the standard re-check window from today.
update public.studio_memberships set verified_until = current_date + 90
 where status = 'verified' and verified_until is null;

create or replace function public.studio_memberships_guard()
returns trigger language plpgsql set search_path = '' as $$
declare staff boolean := auth.uid() is null or public.is_admin() or public.manages_studio(new.studio_id);
begin
  if tg_op = 'INSERT' then
    if not staff then
      new.status := 'pending';
      new.verified_by := null;
      new.verified_at := null;
      new.verified_until := null;
      new.ended_at := null;
    elsif new.status = 'verified' then
      new.verified_by := coalesce(new.verified_by, auth.uid());
      new.verified_at := coalesce(new.verified_at, now());
      new.verified_until := coalesce(new.verified_until, current_date + 90);
    end if;
  else
    new.user_id := old.user_id;
    new.requested_at := old.requested_at;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'verified' then
      new.verified_by := auth.uid();
      new.verified_at := now();
      new.ended_at := null;
      -- Re-check every 90 days unless staff chose another date in the same update.
      if new.verified_until is null or new.verified_until is not distinct from old.verified_until or new.verified_until < current_date then
        new.verified_until := current_date + 90;
      end if;
    elsif new.status = 'ended' then
      new.ended_at := now();
    end if;
  end if;
  return new;
end $$;

-- 5. Complimentary Foundation follows the studio membership and never runs on indefinitely:
--    · verified and in date: access with no end
--    · re-check date passed without re-confirmation: access for 28 more days, then it stops
--    · ended by staff: access for the 28-day notice period, then it stops
create or replace function public.recompute_entitlements(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.entitlements where user_id = p_user and source in ('subscription', 'studio');

  insert into public.entitlements (user_id, entitlement_key, source, source_id, ends_at)
  select s.user_id, pe.entitlement_key, 'subscription', s.id,
         case when s.status = 'past_due' then s.current_period_end + interval '7 days' else null end
    from public.subscriptions s
    join public.plan_entitlements pe on pe.plan_id = s.plan_id
   where s.user_id = p_user and s.status in ('trialing', 'active', 'past_due')
  on conflict do nothing;

  insert into public.entitlements (user_id, entitlement_key, source, source_id, ends_at)
  select m.user_id, te.entitlement_key, 'studio', m.id,
         case when m.status = 'ended' then m.ended_at + interval '28 days'
              when m.verified_until is not null then (m.verified_until + 29)::timestamp at time zone 'Europe/London'
              else null end
    from public.studio_memberships m
    join public.studio_tier_entitlements te on te.tier = m.tier
   where m.user_id = p_user
     and (m.status = 'verified'
          or (m.status = 'ended' and m.verified_at is not null and m.ended_at is not null))
  on conflict do nothing;
end $$;
revoke all on function public.recompute_entitlements(uuid) from public, anon, authenticated;

-- Rebuild everyone with a studio link so the new rules apply straight away.
do $$
declare u uuid;
begin
  for u in select distinct user_id from public.studio_memberships loop
    perform public.recompute_entitlements(u);
  end loop;
end $$;

-- 6. Who may pay the studio-member price: an in-date, verified £99 or £148 link. Asked by checkout
--    on the server. A matching email address, a checkbox or a pending request is never enough.
create or replace function public.studio_price_eligible()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.studio_memberships m
     where m.user_id = auth.uid()
       and m.status = 'verified'
       and m.tier in ('studio_99', 'studio_148')
       and (m.verified_until is null or m.verified_until >= current_date)
  );
$$;
revoke all on function public.studio_price_eligible() from public, anon;
grant execute on function public.studio_price_eligible() to authenticated;

-- A studio manager can see who is asking to link to their studio, even when that member's
-- home studio is set to another one (or not set).
create policy profiles_read_studio_link_manager on public.profiles for select to authenticated
  using (exists (select 1 from public.studio_memberships m
                  where m.user_id = profiles.id and public.manages_studio(m.studio_id)));

-- 7. Admin view: online-only and studio-member subscribers, counted separately.
create or replace function public.admin_studio_breakdown()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  with live_subs as (
    select s.user_id, s.cancel_at_period_end, pl.name as plan_name, coalesce(pr.audience, 'standard') as audience
      from public.subscriptions s
      left join public.prices pr on pr.id = s.price_id
      left join public.plans pl on pl.id = coalesce(s.plan_id, pr.plan_id)
     where s.status in ('trialing', 'active', 'past_due')
  ),
  eligible as (
    select distinct m.user_id from public.studio_memberships m
     where m.status = 'verified' and m.tier in ('studio_99', 'studio_148')
       and (m.verified_until is null or m.verified_until >= current_date)
  )
  select jsonb_build_object(
    'complimentary_foundation', (select count(*) from eligible e where not exists (select 1 from live_subs s where s.user_id = e.user_id)),
    'studio_upgrades', (select count(*) from live_subs where audience = 'studio'),
    'online_only', (select count(*) from live_subs where audience = 'standard'),
    'by_plan', (select coalesce(jsonb_agg(x order by x->>'plan'), '[]') from (
        select jsonb_build_object('plan', coalesce(plan_name, 'Unknown'),
          'online', count(*) filter (where audience = 'standard'),
          'studio', count(*) filter (where audience = 'studio')) x
        from live_subs group by plan_name) t),
    'pending_requests', (select count(*) from public.studio_memberships where status = 'pending'),
    'recheck_due', (select count(*) from public.studio_memberships where status = 'verified' and verified_until < current_date),
    'in_notice', (select count(*) from public.studio_memberships where status = 'ended' and ended_at + interval '28 days' > now()),
    'discount_without_eligibility', (select count(*) from live_subs s where s.audience = 'studio' and not s.cancel_at_period_end
        and not exists (select 1 from eligible e where e.user_id = s.user_id))
  ) into r;
  return r;
end $$;
revoke all on function public.admin_studio_breakdown() from public, anon;
grant execute on function public.admin_studio_breakdown() to authenticated;
