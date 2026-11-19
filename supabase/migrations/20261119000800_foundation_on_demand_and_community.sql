-- Owner decision, 19 November 2026 (evening): BAYSE Foundation (£19.99, 7-day trial) is on-demand classes,
-- the workout builder and the community only. The personal plan and programmes, nutrition, progress and
-- challenges move up to Inner Circle and Black. Studio members get Foundation free, as before, which is
-- the same on-demand and community access set in 20261119000600.
delete from public.plan_entitlements pe using public.plans p
 where pe.plan_id = p.id and p.key = 'essential' and pe.entitlement_key not in ('on_demand', 'community');

-- Rebuild access for anyone with a subscription so the new rule applies straight away.
do $$
declare u uuid;
begin
  for u in select distinct user_id from public.subscriptions loop
    perform public.recompute_entitlements(u);
  end loop;
end $$;
