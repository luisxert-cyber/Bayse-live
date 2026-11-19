-- BAYSE Live · RLS and permission tests (Phase 1)
-- Signs in as each role and tries to read and write what it should and should not.
-- Results go to public._t_results; every row must have ok = true.
-- Uses fake users on the reserved .invalid domain. Run against a throwaway database,
-- or via scripts/test-rls-remote.sh which runs it in an isolated schema and cleans up.

create table if not exists public._t_results (n serial, name text, ok boolean);
create or replace function public._t_ok(p_name text, p_ok boolean) returns void
language sql as $$ insert into public._t_results (name, ok) values (p_name, coalesce(p_ok, false)); $$;
grant insert, select on public._t_results to anon, authenticated;
grant usage on sequence public._t_results_n_seq to anon, authenticated;
grant execute on function public._t_ok(text, boolean) to anon, authenticated;

-- Fake users ------------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@bayse.invalid', '{"first_name":"Amy"}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@bayse.invalid', '{"first_name":"Bea"}', now(), now()),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-c@bayse.invalid', '{}', now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-m@bayse.invalid', '{}', now(), now()),
  ('55555555-5555-4555-8555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-n@bayse.invalid', '{}', now(), now()),
  ('66666666-6666-4666-8666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-d@bayse.invalid', '{}', now(), now()),
  ('77777777-7777-4777-8777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-s@bayse.invalid', '{}', now(), now());

select public._t_ok('signup trigger creates profiles', (select count(*) = 7 from public.profiles where email like 'rls-%@bayse.invalid'));
select public._t_ok('signup trigger copies first name', (select first_name = 'Amy' from public.profiles where id = '11111111-1111-4111-8111-111111111111'));
-- Anonymous onboarding user later gets an email from Supabase Auth: the profile follows.
update auth.users set email = 'rls-c2@bayse.invalid' where id = '33333333-3333-4333-8333-333333333333';
select public._t_ok('email change syncs to profile', (select email = 'rls-c2@bayse.invalid' from public.profiles where id = '33333333-3333-4333-8333-333333333333'));
update auth.users set email = 'rls-c@bayse.invalid' where id = '33333333-3333-4333-8333-333333333333';

update public.profiles set home_studio_id = (select id from public.studios where slug = 'altrincham')
 where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');
update public.profiles set home_studio_id = (select id from public.studios where slug = 'bolton')
 where id = '33333333-3333-4333-8333-333333333333';

insert into public.user_roles (user_id, role, studio_id) values
  ('44444444-4444-4444-8444-444444444444', 'studio_manager', (select id from public.studios where slug = 'altrincham')),
  ('55555555-5555-4555-8555-555555555555', 'studio_manager', (select id from public.studios where slug = 'bolton')),
  ('66666666-6666-4666-8666-666666666666', 'admin', null),
  ('77777777-7777-4777-8777-777777777777', 'super_admin', null);

insert into public.onboarding_answers (user_id, goals, experience) values
  ('11111111-1111-4111-8111-111111111111', '{core}', 'beginner'),
  ('22222222-2222-4222-8222-222222222222', '{strength}', 'intermediate');
insert into public.consent_records (user_id, purpose, version, granted) values
  ('22222222-2222-4222-8222-222222222222', 'wellness_data', 'v1', true);
insert into public.wellness_preferences (user_id, interests) values
  ('22222222-2222-4222-8222-222222222222', '{perimenopause}');

-- Member A ----------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', false);
set role authenticated;

select public._t_ok('member reads own profile', (select count(*) = 1 from public.profiles where id = auth.uid()));
select public._t_ok('member cannot read another member profile', (select count(*) = 0 from public.profiles where id = '22222222-2222-4222-8222-222222222222'));
do $$ declare n int; begin
  update public.profiles set first_name = 'Hacked' where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics n = row_count; perform public._t_ok('member cannot update another profile', n = 0);
end $$;
update public.profiles set email = 'changed@evil.invalid', first_name = 'Amelia' where id = auth.uid();
select public._t_ok('member cannot change own email', (select email = 'rls-a@bayse.invalid' from public.profiles where id = auth.uid()));
select public._t_ok('member can change own name', (select first_name = 'Amelia' from public.profiles where id = auth.uid()));
do $$ begin
  begin insert into public.user_roles (user_id, role) values (auth.uid(), 'admin'); perform public._t_ok('member cannot grant self admin', false);
  exception when others then perform public._t_ok('member cannot grant self admin', true); end;
end $$;
do $$ begin
  begin insert into public.entitlements (user_id, entitlement_key, source) values (auth.uid(), 'live_classes', 'manual'); perform public._t_ok('member cannot write entitlements', false);
  exception when others then perform public._t_ok('member cannot write entitlements', true); end;
end $$;
do $$ begin
  begin insert into public.subscriptions (user_id, stripe_subscription_id, status) values (auth.uid(), 'sub_fake', 'active'); perform public._t_ok('member cannot write subscriptions', false);
  exception when others then perform public._t_ok('member cannot write subscriptions', true); end;
end $$;
-- Asking for 'verified' is quietly downgraded to 'pending' by the guard trigger.
insert into public.studio_memberships (user_id, studio_id, tier, status) values (auth.uid(), (select id from public.studios where slug='altrincham'), 'studio_148', 'verified');
select public._t_ok('member cannot self-verify studio link', (select status = 'pending' and verified_by is null from public.studio_memberships where user_id = auth.uid()));
select public._t_ok('member can request a studio link', (select count(*) = 1 from public.studio_memberships where user_id = auth.uid() and status = 'pending'));
do $$ declare n int; begin
  update public.studio_memberships set status = 'verified' where user_id = auth.uid();
  get diagnostics n = row_count; perform public._t_ok('member cannot verify own studio link', n = 0);
end $$;
select public._t_ok('pending link grants nothing', not public.has_entitlement('live_classes'));
do $$ begin
  begin insert into public.wellness_preferences (user_id, interests) values (auth.uid(), '{menopause}'); perform public._t_ok('wellness data blocked without consent', false);
  exception when others then perform public._t_ok('wellness data blocked without consent', true); end;
end $$;
insert into public.consent_records (user_id, purpose, version, granted) values (auth.uid(), 'wellness_data', 'v1', true);
insert into public.wellness_preferences (user_id, interests) values (auth.uid(), '{menopause}');
select public._t_ok('wellness data saved after consent', (select count(*) = 1 from public.wellness_preferences where user_id = auth.uid()));
select public._t_ok('member cannot read another member wellness', (select count(*) = 0 from public.wellness_preferences where user_id = '22222222-2222-4222-8222-222222222222'));
select public._t_ok('member cannot read another member onboarding', (select count(*) = 0 from public.onboarding_answers where user_id = '22222222-2222-4222-8222-222222222222'));
select public._t_ok('member cannot read audit log', (select count(*) = 0 from public.audit_log));
do $$ declare n int; begin
  update public.consent_records set granted = false where user_id = auth.uid();
  get diagnostics n = row_count; perform public._t_ok('consent records cannot be edited', n = 0);
end $$;
do $$ begin
  begin insert into public.consent_records (user_id, purpose, version, granted) values ('22222222-2222-4222-8222-222222222222', 'marketing_email', 'v1', true); perform public._t_ok('member cannot consent for someone else', false);
  exception when others then perform public._t_ok('member cannot consent for someone else', true); end;
end $$;
do $$ begin
  begin insert into public.programmes (key, name, summary, level) values ('hack', 'Hack', 'x', 'all'); perform public._t_ok('member cannot create programmes', false);
  exception when others then perform public._t_ok('member cannot create programmes', true); end;
end $$;
select public._t_ok('member sees published programmes', (select count(*) >= 7 from public.programmes));
select public._t_ok('export returns own data', (select (public.export_my_data() -> 'profile' ->> 'id') = '11111111-1111-4111-8111-111111111111'));
select public._t_ok('export includes own wellness', (select jsonb_typeof(public.export_my_data() -> 'wellness_preferences') = 'object'));
reset role;

-- Studio manager M (Altrincham) ----------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('manager sees own studio member profile', (select count(*) = 1 from public.profiles where id = '11111111-1111-4111-8111-111111111111'));
select public._t_ok('manager cannot see other studio member profile', (select count(*) = 0 from public.profiles where id = '33333333-3333-4333-8333-333333333333'));
select public._t_ok('manager cannot read member wellness', (select count(*) = 0 from public.wellness_preferences));
select public._t_ok('manager cannot read member onboarding', (select count(*) = 0 from public.onboarding_answers));
do $$ declare n int; begin
  update public.studio_memberships set status = 'verified' where user_id = '11111111-1111-4111-8111-111111111111';
  get diagnostics n = row_count; perform public._t_ok('manager verifies own studio link', n = 1);
end $$;
do $$ begin
  begin insert into public.user_roles (user_id, role) values ('22222222-2222-4222-8222-222222222222', 'instructor'); perform public._t_ok('manager cannot grant roles', false);
  exception when others then perform public._t_ok('manager cannot grant roles', true); end;
end $$;
reset role;

select public._t_ok('verification stamped with manager', (select verified_by = '44444444-4444-4444-8444-444444444444' and verified_at is not null from public.studio_memberships where user_id = '11111111-1111-4111-8111-111111111111'));

-- Member A again: verified £148 link unlocks live classes ----------------------------
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('verified studio link grants Foundation (on demand)', public.has_entitlement('on_demand'));
select public._t_ok('verified studio link grants community', public.has_entitlement('community'));
select public._t_ok('verified studio link grants challenges', public.has_entitlement('challenges'));
select public._t_ok('verified studio link does not grant live classes', not public.has_entitlement('live_classes'));
select public._t_ok('verified studio member can pay the studio price', public.studio_price_eligible());
select public._t_ok('verified link has a re-check date', (select verified_until = current_date + 90 from public.studio_memberships where user_id = auth.uid()));
select public._t_ok('verified studio link does not grant 1:1 coaching', not public.has_entitlement('individual_coaching'));
reset role;

-- Studio manager N (Bolton) cannot touch Altrincham ------------------------------------
select set_config('request.jwt.claims', '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('other studio manager cannot see link', (select count(*) = 0 from public.studio_memberships where user_id = '11111111-1111-4111-8111-111111111111'));
do $$ declare n int; begin
  update public.studio_memberships set status = 'rejected' where user_id = '11111111-1111-4111-8111-111111111111';
  get diagnostics n = row_count; perform public._t_ok('other studio manager cannot change link', n = 0);
end $$;
select public._t_ok('bolton manager sees bolton member', (select count(*) = 1 from public.profiles where id = '33333333-3333-4333-8333-333333333333'));
reset role;

-- Admin D --------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('admin reads all test profiles', (select count(*) = 7 from public.profiles where email like 'rls-%@bayse.invalid'));
select public._t_ok('admin reads audit log', (select count(*) > 0 from public.audit_log where entity = 'user_roles'));
select public._t_ok('admin cannot read special-category wellness data', (select count(*) = 0 from public.wellness_preferences));
insert into public.user_roles (user_id, role) values ('22222222-2222-4222-8222-222222222222', 'instructor');
select public._t_ok('admin grants instructor', (select count(*) = 1 from public.user_roles where user_id = '22222222-2222-4222-8222-222222222222' and role = 'instructor'));
select public._t_ok('grant stamped with admin', (select granted_by = '66666666-6666-4666-8666-666666666666' from public.user_roles where user_id = '22222222-2222-4222-8222-222222222222' and role = 'instructor'));
do $$ begin
  begin insert into public.user_roles (user_id, role) values ('22222222-2222-4222-8222-222222222222', 'admin'); perform public._t_ok('admin cannot grant admin', false);
  exception when others then perform public._t_ok('admin cannot grant admin', true); end;
end $$;
reset role;

-- Super admin S --------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}', false);
set role authenticated;
insert into public.user_roles (user_id, role) values ('33333333-3333-4333-8333-333333333333', 'admin');
select public._t_ok('super admin grants admin', (select count(*) = 1 from public.user_roles where user_id = '33333333-3333-4333-8333-333333333333' and role = 'admin'));
reset role;

-- Server (service role) writes a subscription as the Stripe webhook would -------------
insert into public.subscriptions (user_id, stripe_subscription_id, plan_id, status, current_period_end)
values ('22222222-2222-4222-8222-222222222222', 'sub_rls_test_b', (select id from public.plans where key = 'club'), 'trialing', now() + interval '7 days');

select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('trial subscription grants live classes', public.has_entitlement('live_classes'));
select public._t_ok('member sees own subscription', (select count(*) = 1 from public.subscriptions));
reset role;

update public.subscriptions set status = 'past_due', current_period_end = now() - interval '10 days' where stripe_subscription_id = 'sub_rls_test_b';
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('past due beyond 7-day grace removes access', not public.has_entitlement('live_classes'));
reset role;

update public.subscriptions set status = 'past_due', current_period_end = now() where stripe_subscription_id = 'sub_rls_test_b';
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('past due within grace keeps access', public.has_entitlement('live_classes'));
reset role;

update public.subscriptions set status = 'canceled' where stripe_subscription_id = 'sub_rls_test_b';
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('cancellation removes access', not public.has_entitlement('live_classes'));
reset role;

-- Consent withdrawal deletes the data it covered ------------------------------------
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', false);
set role authenticated;
insert into public.consent_records (user_id, purpose, version, granted) values (auth.uid(), 'wellness_data', 'v1', false);
select public._t_ok('withdrawing consent deletes wellness data', (select count(*) = 0 from public.wellness_preferences where user_id = auth.uid()));
reset role;

-- Programme recommendation: member may only accept --------------------------------
insert into public.programme_recommendations (user_id, programme_id, weeks, sessions_per_week, engine_version)
values ('11111111-1111-4111-8111-111111111111', (select id from public.programmes where key = 'foundations'), 6, 3, 'test');
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', false);
set role authenticated;
update public.programme_recommendations set accepted_at = now() where user_id = auth.uid();
select public._t_ok('member accepts recommendation', (select accepted_at is not null from public.programme_recommendations where user_id = auth.uid()));
do $$ begin
  begin update public.programme_recommendations set weeks = 12 where user_id = auth.uid(); perform public._t_ok('member cannot alter recommendation', false);
  exception when others then perform public._t_ok('member cannot alter recommendation', true); end;
end $$;
reset role;

-- Studio membership ends: 28 days' notice, then included access stops ----------------------
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('member without a studio link cannot pay the studio price', not public.studio_price_eligible());
reset role;
select set_config('request.jwt.claims', '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}', false);
set role authenticated;
update public.studio_memberships set status = 'ended' where user_id = '11111111-1111-4111-8111-111111111111';
reset role;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('ended studio link keeps included access during notice', public.has_entitlement('on_demand'));
select public._t_ok('ended studio link cannot pay the studio price', not public.studio_price_eligible());
select public._t_ok('included access ends 28 days after the studio membership', (select count(*) > 0 and bool_and(ends_at between now() + interval '27 days' and now() + interval '29 days') from public.entitlements where user_id = auth.uid() and source = 'studio'));
reset role;

-- Anonymous visitor ------------------------------------------------------------------
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
select public._t_ok('visitor sees no profiles', (select count(*) = 0 from public.profiles));
select public._t_ok('visitor sees plans and studios', (select count(*) >= 3 from public.plans) and (select count(*) >= 7 from public.studios));
select public._t_ok('visitor sees no subscriptions', (select count(*) = 0 from public.subscriptions));
do $$ begin
  begin insert into public.onboarding_answers (user_id) values ('11111111-1111-4111-8111-111111111111'); perform public._t_ok('visitor cannot write onboarding', false);
  exception when others then perform public._t_ok('visitor cannot write onboarding', true); end;
end $$;
reset role;
select set_config('request.jwt.claims', '', false);

select name, ok from public._t_results order by n;
