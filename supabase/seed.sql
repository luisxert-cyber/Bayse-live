-- BAYSE Live · reference data
-- Studios, entitlement keys, plans (prices are HYPOTHESES, test mode only), programmes, flags.
-- No member data. Safe to run more than once.

insert into public.studios (slug, name, town, status) values
  ('altrincham',     'BAYSE Altrincham',     'Altrincham',     'open'),
  ('bolton',         'BAYSE Bolton',         'Bolton',         'open'),
  ('liverpool',      'BAYSE Liverpool',      'Liverpool',      'open'),
  ('stockton-heath', 'BAYSE Stockton Heath', 'Stockton Heath', 'open'),
  ('stafford',       'BAYSE Stafford',       'Stafford',       'open'),
  ('stoke',          'BAYSE Stoke',          'Stoke-on-Trent', 'open'),
  ('wilmslow',       'BAYSE Wilmslow',       'Wilmslow',       'open'),
  ('chester',        'BAYSE Chester',        'Chester',        'open'),
  ('harrogate',      'BAYSE Harrogate',      'Harrogate',      'open'),
  ('manchester-northern-quarter',  'BAYSE Manchester Northern Quarter',  'Manchester',     'opening'),
  ('leeds',                        'BAYSE Leeds',                        'Leeds',          'opening'),
  ('cheltenham',                   'BAYSE Cheltenham',                   'Cheltenham',     'opening')
on conflict (slug) do nothing;

insert into public.entitlement_keys (key, label, description) values
  ('on_demand',           'On-demand classes',     'Stream the on-demand library'),
  ('programmes',          'Training programmes',   'Enrol in 4, 6, 8 or 12-week programmes'),
  ('nutrition',           'Recipes',               'Recipe library and nutrition education'),
  ('meal_planning',       'Meal planning',         'Meal plans and shopping lists'),
  ('progress',            'Progress tracking',     'Progress dashboard and milestones'),
  ('community',           'Community',             'Global and studio community, Clubs and Circles'),
  ('challenges',          'Challenges',            'Monthly club challenges'),
  ('live_classes',        'Live classes',          'Book and join live Zoom classes'),
  ('group_coaching',      'Group coaching',        'Programme coaching groups'),
  ('individual_coaching', 'Individual coaching',   'Defined 1:1 coach contact and check-ins')
on conflict (key) do nothing;

insert into public.plans (key, name, description, sort, is_hypothesis) values
  ('essential', 'BAYSE Essential', 'On-demand, programmes, recipes, progress and community.', 1, true),
  ('club',      'BAYSE Club',      'Everything in Essential plus live classes, group coaching and challenges.', 2, true),
  ('coaching',  'BAYSE Coaching',  'Everything in Club plus defined individual coach contact.', 3, true)
on conflict (key) do nothing;

insert into public.plan_entitlements (plan_id, entitlement_key)
select p.id, k.key from public.plans p
join (values
  ('essential','on_demand'),('essential','programmes'),('essential','nutrition'),
  ('essential','meal_planning'),('essential','progress'),('essential','community'),
  ('club','on_demand'),('club','programmes'),('club','nutrition'),('club','meal_planning'),
  ('club','progress'),('club','community'),('club','challenges'),('club','live_classes'),
  ('club','group_coaching'),
  ('coaching','on_demand'),('coaching','programmes'),('coaching','nutrition'),('coaching','meal_planning'),
  ('coaching','progress'),('coaching','community'),('coaching','challenges'),('coaching','live_classes'),
  ('coaching','group_coaching'),('coaching','individual_coaching')
) as k(plan, key) on k.plan = p.key
on conflict do nothing;

-- Hypothesis prices (pence). stripe_price_id is filled in once the TEST-mode prices exist.
insert into public.prices (plan_id, billing_interval, amount_pence, trial_days)
select p.id, v.intv, v.amount, 7 from public.plans p
join (values ('essential','month',1999),('club','month',3999),('coaching','month',7999)) as v(plan, intv, amount)
  on v.plan = p.key
where not exists (select 1 from public.prices x where x.plan_id = p.id and x.billing_interval = v.intv);

-- Studio-member prices (owner brief 19 Nov 2026): half price on Inner Circle and Black, no trial.
insert into public.prices (plan_id, billing_interval, amount_pence, trial_days, audience)
select p.id, '28_days', v.amount, 0, 'studio' from public.plans p
join (values ('club',1999),('coaching',3999)) as v(plan, amount) on v.plan = p.key
where not exists (select 1 from public.prices x where x.plan_id = p.id and x.audience = 'studio');

-- Foundation includes member challenges.
insert into public.plan_entitlements (plan_id, entitlement_key)
select id, 'challenges' from public.plans where key = 'essential' on conflict do nothing;

-- Studio-tier access (owner brief 19 Nov 2026): £99 and £148 studio members get Foundation at no charge.
-- Live classes and private sessions come with the half-price Inner Circle and Black upgrades.
insert into public.studio_tier_entitlements (tier, entitlement_key) values
  ('studio_99','on_demand'),('studio_99','programmes'),('studio_99','nutrition'),('studio_99','meal_planning'),
  ('studio_99','progress'),('studio_99','community'),('studio_99','challenges'),
  ('studio_148','on_demand'),('studio_148','programmes'),('studio_148','nutrition'),('studio_148','meal_planning'),
  ('studio_148','progress'),('studio_148','community'),('studio_148','challenges'),
  ('other','community'),('other','progress')
on conflict do nothing;

insert into public.programmes (key, name, summary, level, focus, needs_equipment, weeks_options, published, sort) values
  ('foundations', 'Pilates Foundations', 'Learn the BAYSE basics: breath, alignment and control, building week by week.', 'new', '{core,posture,confidence,consistency}', '{mat}', '{4,6,8}', true, 1),
  ('strong_sculpt', 'Strong & Sculpt', 'Pilates with progressive strength work for tone and full-body strength.', 'intermediate', '{strength,tone,fitness,healthy_weight}', '{mat,weights}', '{4,6,8,12}', true, 2),
  ('reformer_progression', 'Reformer Progression', 'Progressive reformer training for members with reformer access.', 'intermediate', '{strength,tone,core}', '{reformer}', '{4,6,8}', true, 3),
  ('core_posture', 'Core & Posture', 'Deep core strength and everyday posture.', 'beginner', '{core,posture}', '{mat}', '{4,6,8}', true, 4),
  ('mobility_restore', 'Mobility & Restore', 'Mobility, stretching and recovery to move and feel better.', 'all', '{mobility,feel_better,recovery}', '{mat}', '{4,6,8}', true, 5),
  ('healthy_habits', 'Healthy Habits', 'Movement, practical nutrition education and habits that last.', 'all', '{healthy_eating,healthy_weight,consistency,feel_better}', '{mat}', '{6,8,12}', true, 6),
  ('move_more', 'Move More', 'Gentle movement and walking consistency.', 'new', '{fitness,consistency,feel_better}', '{}', '{4,6,8}', true, 7)
on conflict (key) do nothing;

insert into public.feature_flags (key, enabled, description) values
  ('live_billing', false, 'Stripe live mode. Off until Luis approves.'),
  ('member_emails', false, 'Send emails to real members. Off until Luis approves.'),
  ('community', false, 'Community and Clubs (Phase 5).'),
  ('nutrition', false, 'Nutrition hub (Phase 4).'),
  ('live_classes', false, 'Live timetable and booking (Phase 3).')
on conflict (key) do nothing;

-- Community groups (Phase 5). Studio groups are created for every open or opening studio.
insert into public.groups (kind, slug, name, description) values
  ('global', 'bayse-global', 'BAYSE Global', 'Everyone: online and studio members.'),
  ('topic', 'new-to-bayse', 'New to BAYSE', 'Say hello, ask anything. A welcoming place for new members.'),
  ('topic', 'nutrition-healthy-habits', 'Nutrition & Healthy Habits', 'Recipe ideas, meal inspiration and supportive healthy-living conversations.')
on conflict (slug) do nothing;
insert into public.groups (kind, slug, name, studio_id, description)
select 'studio', s.slug, s.name, s.id, 'Members of ' || s.name || '.' from public.studios s where s.status <> 'closed'
on conflict (slug) do nothing;
insert into public.groups (kind, slug, name, programme_id, description)
select 'programme', 'programme-' || replace(p.key, '_', '-'), p.name, p.id, 'Members following ' || p.name || '.' from public.programmes p where p.published
on conflict (slug) do nothing;
