-- Owner decision, 19 November 2026: a £99 or £148 studio membership no longer includes the whole of
-- BAYSE Foundation. It includes on-demand classes and the community only. Anything else (recipes and
-- the food plan, programmes, challenges, live classes, 1-to-1s) comes with a half-price upgrade.
delete from public.studio_tier_entitlements
 where tier in ('studio_99', 'studio_148') and entitlement_key not in ('on_demand', 'community');

-- Rebuild everyone with a studio link so the new rule applies straight away.
do $$
declare u uuid;
begin
  for u in select distinct user_id from public.studio_memberships loop
    perform public.recompute_entitlements(u);
  end loop;
end $$;
