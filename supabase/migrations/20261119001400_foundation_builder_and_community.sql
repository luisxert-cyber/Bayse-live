-- Owner decision 19 Nov 2026: BAYSE Foundation is the workout builder and the community only, so
-- Inner Circle stands out. On-demand classes (including Reformer at home) move to Inner Circle and Black.
-- The workout builder gets its own key so it can be sold without the class library.
insert into public.entitlement_keys (key, label, description)
values ('workout_builder', 'Workout builder', 'Build a class for your time and kit')
on conflict (key) do nothing;

-- Every plan gets the builder.
insert into public.plan_entitlements (plan_id, entitlement_key)
select p.id, 'workout_builder' from public.plans p where p.key in ('essential', 'club', 'coaching')
on conflict do nothing;

-- Foundation: builder and community only.
delete from public.plan_entitlements pe using public.plans p
 where pe.plan_id = p.id and p.key = 'essential' and pe.entitlement_key not in ('workout_builder', 'community');

-- Verified £99/£148 studio members get Foundation free: the same two.
insert into public.studio_tier_entitlements (tier, entitlement_key)
values ('studio_99', 'workout_builder'), ('studio_148', 'workout_builder')
on conflict do nothing;
delete from public.studio_tier_entitlements
 where tier in ('studio_99', 'studio_148') and entitlement_key not in ('workout_builder', 'community');
