-- Master brief (19 Nov 2026), owner-approved:
--  * BAYSE Black £89.99 every 28 days, studio members £44.99 (was £79.99 / £39.99). The old Stripe price ids
--    charge the old amounts, so they are cleared: new prices must be created in Stripe and pasted in Admin → Plans and prices.
--  * Studio members get the 7-day free trial on Inner Circle and Black too (once per member, like everyone).
--  * Black's included private session: 40 minutes, no carry-over (expires at the end of the paid 28-day period).
update public.prices set amount_pence = 8999, stripe_price_id = null
  where audience = 'standard' and plan_id = (select id from public.plans where key = 'coaching');
update public.prices set amount_pence = 4499, stripe_price_id = null
  where audience = 'studio' and plan_id = (select id from public.plans where key = 'coaching');
update public.prices set trial_days = 7
  where audience = 'studio' and plan_id in (select id from public.plans where key in ('club', 'coaching'));
update public.plans set description = 'Everything in Inner Circle plus one 40-minute private Zoom session every paid 28 days.' where key = 'coaching';
update public.booking_settings set session_minutes = 40, credit_valid_months = 1 where id;
