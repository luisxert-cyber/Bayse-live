-- Owner decision (18 Nov 2026): BAYSE Foundation £19.99, BAYSE Inner Circle £39.99, BAYSE Black £79.99, billed every 28 days.
-- Plan keys stay the same (essential, club, coaching) so existing records keep working.
alter table public.prices drop constraint prices_billing_interval_check;
alter table public.prices add constraint prices_billing_interval_check check (billing_interval in ('month', 'year', '28_days'));

update public.plans set name = 'BAYSE Foundation', description = 'Your plan, the on-demand library, the workout builder, recipes, progress and The BAYSE Club.', is_hypothesis = false where key = 'essential';
update public.plans set name = 'BAYSE Inner Circle', description = 'Everything in Foundation plus live coached Zoom classes and monthly challenges.', is_hypothesis = false where key = 'club';
update public.plans set name = 'BAYSE Black', description = 'Everything in Inner Circle plus one 45-minute private Zoom session every 28 days.', is_hypothesis = false where key = 'coaching';
update public.prices set billing_interval = '28_days' where plan_id in (select id from public.plans where key in ('essential', 'club', 'coaching')) and billing_interval = 'month';
