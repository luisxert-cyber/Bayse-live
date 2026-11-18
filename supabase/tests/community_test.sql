-- BAYSE Live · Community and Clubs tests (Phase 5 data layer)
-- Same harness as rls_test.sql: results in public._t_results, every row must be ok.

create table if not exists public._t_results (n serial, name text, ok boolean);
create or replace function public._t_ok(p_name text, p_ok boolean) returns void
language sql as $$ insert into public._t_results (name, ok) values (p_name, coalesce(p_ok, false)); $$;
grant insert, select on public._t_results to anon, authenticated;
grant usage on sequence public._t_results_n_seq to anon, authenticated;
grant execute on function public._t_ok(text, boolean) to anon, authenticated;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-a@bayse.invalid', '{}', now(), now()),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-b@bayse.invalid', '{}', now(), now()),
  ('c0000000-0000-4000-8000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-c@bayse.invalid', '{}', now(), now()),
  ('d0000000-0000-4000-8000-00000000000d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-d@bayse.invalid', '{}', now(), now()),
  ('e0000000-0000-4000-8000-00000000000e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-mod@bayse.invalid', '{}', now(), now());

update public.profiles p set adult_confirmed = true, display_name = v.dn, home_studio_id = (select id from public.studios where slug = 'altrincham')
  from (values ('a0000000-0000-4000-8000-00000000000a'::uuid, 'Amy'), ('b0000000-0000-4000-8000-00000000000b'::uuid, 'Bea'),
               ('c0000000-0000-4000-8000-00000000000c'::uuid, 'Cat'), ('d0000000-0000-4000-8000-00000000000d'::uuid, 'Dee'),
               ('e0000000-0000-4000-8000-00000000000e'::uuid, 'Mod')) as v(id, dn)
 where p.id = v.id;

-- A, B, D are verified £99 Altrincham members (community included). C has no entitlement.
insert into public.studio_memberships (user_id, studio_id, tier, status)
select u, (select id from public.studios where slug = 'altrincham'), 'studio_99', 'verified'
  from unnest(array['a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b', 'd0000000-0000-4000-8000-00000000000d']::uuid[]) as u;
insert into public.user_roles (user_id, role) values ('e0000000-0000-4000-8000-00000000000e', 'moderator');
insert into public.discovery_prefs (user_id, discoverable, interests) values
  ('b0000000-0000-4000-8000-00000000000b', true, '{padel,walk}'),
  ('d0000000-0000-4000-8000-00000000000d', false, '{social}');

insert into public.groups (kind, slug, name, studio_id) values
  ('global', 't-global', 'BAYSE Global', null),
  ('studio', 't-altrincham', 'BAYSE Altrincham', (select id from public.studios where slug = 'altrincham')),
  ('studio', 't-bolton', 'BAYSE Bolton', (select id from public.studios where slug = 'bolton'));
insert into public.groups (kind, slug, name, max_members) values ('circle', 't-circle', 'Altrincham Morning Pilates', 10);

-- C: no community entitlement ------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-00000000000c","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('non-member cannot participate', not public.can_participate());
do $$ begin
  begin insert into public.activities (kind, title, venue_name, starts_at, host_id) values ('walk', 'Sneaky walk', 'Dunham Massey car park', now() + interval '2 days', auth.uid()); perform public._t_ok('non-member cannot create activity', false);
  exception when others then perform public._t_ok('non-member cannot create activity', true); end;
end $$;
select public._t_ok('non-member sees no activities or groups', (select count(*) = 0 from public.activities) and (select count(*) = 0 from public.groups));
reset role;

-- A hosts a padel game for 3 (A + 2) ---------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('member can participate', public.can_participate());
do $$ begin
  begin insert into public.activities (kind, title, venue_name, starts_at, host_id) values ('padel', 'Too soon', 'Padel Club', now() + interval '5 minutes', auth.uid()); perform public._t_ok('activities must start in the future', false);
  exception when others then perform public._t_ok('activities must start in the future', true); end;
end $$;
do $$ begin
  begin insert into public.activities (kind, title, venue_name, starts_at, host_id) values ('padel', 'Forged host', 'Padel Club', now() + interval '2 days', 'b0000000-0000-4000-8000-00000000000b'); perform public._t_ok('cannot host as someone else', false);
  exception when others then perform public._t_ok('cannot host as someone else', true); end;
end $$;
insert into public.activities (kind, title, venue_name, venue_area, starts_at, capacity, level, padel_format, host_id, studio_id)
values ('padel', 'Saturday Padel', 'Altrincham Padel Centre', 'Altrincham', now() + interval '20 hours', 3, 'beginner', 'doubles', auth.uid(), (select id from public.studios where slug = 'altrincham'));
select public._t_ok('host gets a place automatically', (select count(*) = 1 from public.activity_rsvps r join public.activities x on x.id = r.activity_id where x.title = 'Saturday Padel' and r.user_id = auth.uid() and r.status = 'going'));
reset role;

select public._t_ok('interested member at same studio is notified', (select count(*) = 1 from public.notifications where user_id = 'b0000000-0000-4000-8000-00000000000b' and kind = 'activity_new'));
select public._t_ok('uninterested member is not notified', (select count(*) = 0 from public.notifications where user_id = 'd0000000-0000-4000-8000-00000000000d' and kind = 'activity_new'));

-- B joins (going), D joins (going), then C cannot, and a 4th goes to the waiting list ---------
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('member sees the activity', (select count(*) = 1 from public.activities where title = 'Saturday Padel'));
select public._t_ok('chat hidden before joining', (select count(*) = 0 from public.activity_messages));
select public._t_ok('first joiner gets a place', public.join_activity((select id from public.activities where title = 'Saturday Padel')) = 'going');
select public._t_ok('joining twice is harmless', public.join_activity((select id from public.activities where title = 'Saturday Padel')) = 'going');
insert into public.activity_messages (activity_id, author_id, body) values ((select id from public.activities where title = 'Saturday Padel'), auth.uid(), 'Who is bringing balls?');
select public._t_ok('participant can chat', (select count(*) = 1 from public.activity_messages));
do $$ begin
  begin insert into public.activity_rsvps (activity_id, user_id, status) values ((select id from public.activities where title = 'Saturday Padel'), auth.uid(), 'going'); perform public._t_ok('RSVPs cannot be written directly', false);
  exception when others then perform public._t_ok('RSVPs cannot be written directly', true); end;
end $$;
reset role;

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-00000000000d","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('second joiner fills the last place', public.join_activity((select id from public.activities where title = 'Saturday Padel')) = 'going');
reset role;

select set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-00000000000e","role":"authenticated"}', false);
set role authenticated;
-- The moderator has no community entitlement, so cannot join: proves can_participate is enforced in the function.
do $$ begin
  begin perform public.join_activity((select id from public.activities where title = 'Saturday Padel')); perform public._t_ok('join requires community access', false);
  exception when others then perform public._t_ok('join requires community access', true); end;
end $$;
reset role;

-- Give C community access via a verified link (as the server, so clear the signed-in user first).
select set_config('request.jwt.claims', '', false);
insert into public.studio_memberships (user_id, studio_id, tier, status) values ('c0000000-0000-4000-8000-00000000000c', (select id from public.studios where slug = 'altrincham'), 'studio_99', 'verified');
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-00000000000c","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('full activity puts next person on waiting list', public.join_activity((select id from public.activities where title = 'Saturday Padel')) = 'waitlist');
select public._t_ok('waiting list member can read the chat', (select count(*) = 1 from public.activity_messages));
reset role;

-- B leaves: C is promoted and told.
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', false);
set role authenticated;
select public.leave_activity((select id from public.activities where title = 'Saturday Padel'));
select public._t_ok('leaver loses chat access', (select count(*) = 0 from public.activity_messages));
reset role;
select public._t_ok('first on waiting list is promoted', (select status = 'going' from public.activity_rsvps where user_id = 'c0000000-0000-4000-8000-00000000000c' and activity_id = (select id from public.activities where title = 'Saturday Padel')));
select public._t_ok('promoted member is notified', (select count(*) = 1 from public.notifications where user_id = 'c0000000-0000-4000-8000-00000000000c' and kind = 'activity_promoted'));
select public._t_ok('places never exceed capacity', (select count(*) = 3 from public.activity_rsvps where status = 'going' and activity_id = (select id from public.activities where title = 'Saturday Padel')));

-- Host cannot shrink capacity below people going; cannot leave (cancels instead).
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', false);
set role authenticated;
do $$ begin
  begin update public.activities set capacity = 2 where title = 'Saturday Padel'; perform public._t_ok('capacity cannot drop below people going', false);
  exception when others then perform public._t_ok('capacity cannot drop below people going', true); end;
end $$;
do $$ begin
  begin perform public.leave_activity((select id from public.activities where title = 'Saturday Padel')); perform public._t_ok('host cannot leave own activity', false);
  exception when others then perform public._t_ok('host cannot leave own activity', true); end;
end $$;
reset role;

-- Reminders: the activity starts within 24h, so going members get one reminder, once.
select public._t_ok('reminders queued for people going', public.queue_activity_reminders() = 3);
select public._t_ok('reminders are not sent twice', public.queue_activity_reminders() = 0);

-- Blocking: D blocks A. D can no longer see A's activities or join them.
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-00000000000d","role":"authenticated"}', false);
set role authenticated;
insert into public.blocks (blocker_id, blocked_id) values (auth.uid(), 'a0000000-0000-4000-8000-00000000000a');
select public._t_ok('blocked host activities are hidden', (select count(*) = 0 from public.activities where host_id = 'a0000000-0000-4000-8000-00000000000a'));
select public._t_ok('blocked host name hidden', (select count(*) = 0 from public.public_names(array['a0000000-0000-4000-8000-00000000000a']::uuid[])));
reset role;

-- Host cancels: everyone else still on it is told.
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', false);
set role authenticated;
update public.activities set status = 'cancelled' where title = 'Saturday Padel';
do $$ declare n int; begin
  update public.activities set status = 'open' where title = 'Saturday Padel';
  perform public._t_ok('host cannot reopen a cancelled activity', (select status = 'cancelled' from public.activities where title = 'Saturday Padel'));
end $$;
reset role;
select public._t_ok('cancellation notifies participants', (select count(*) = 2 from public.notifications where kind = 'activity_cancelled'));

-- Groups and posts -----------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', false);
set role authenticated;
insert into public.group_members (group_id, user_id) values ((select id from public.groups where slug = 't-altrincham'), auth.uid());
select public._t_ok('verified member joins own studio community', (select count(*) = 1 from public.group_members where user_id = auth.uid()));
do $$ begin
  begin insert into public.group_members (group_id, user_id) values ((select id from public.groups where slug = 't-bolton'), auth.uid()); perform public._t_ok('cannot join another studio community', false);
  exception when others then perform public._t_ok('cannot join another studio community', true); end;
end $$;
do $$ begin
  begin insert into public.group_members (group_id, user_id, role) values ((select id from public.groups where slug = 't-global'), auth.uid(), 'host'); perform public._t_ok('cannot make self a group host', false);
  exception when others then perform public._t_ok('cannot make self a group host', true); end;
end $$;
insert into public.posts (group_id, author_id, body) values ((select id from public.groups where slug = 't-altrincham'), auth.uid(), 'First week done! Who is in on Thursday?');
reset role;

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-00000000000d","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('non-member of group cannot read its posts', (select count(*) = 0 from public.posts));
do $$ begin
  begin insert into public.posts (group_id, author_id, body) values ((select id from public.groups where slug = 't-altrincham'), auth.uid(), 'drive-by'); perform public._t_ok('cannot post in a group you have not joined', false);
  exception when others then perform public._t_ok('cannot post in a group you have not joined', true); end;
end $$;
insert into public.group_members (group_id, user_id) values ((select id from public.groups where slug = 't-altrincham'), auth.uid());
select public._t_ok('group member reads posts', (select count(*) = 1 from public.posts));
insert into public.reports (reporter_id, target_type, target_id, reason, status) values (auth.uid(), 'post', (select id from public.posts limit 1), 'spam', 'actioned');
select public._t_ok('report always starts open', (select status = 'open' from public.reports where reporter_id = auth.uid()));
update public.posts set hidden_at = now() where author_id = 'b0000000-0000-4000-8000-00000000000b';
reset role;
select public._t_ok('members cannot hide others posts', (select hidden_at is null from public.posts limit 1));

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('reported member cannot see the report', (select count(*) = 0 from public.reports));
reset role;

select set_config('request.jwt.claims', '{"sub":"e0000000-0000-4000-8000-00000000000e","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('moderator sees open reports', (select count(*) = 1 from public.reports where status = 'open'));
update public.posts set hidden_at = now() where id = (select target_id from public.reports limit 1);
update public.reports set status = 'actioned', resolution_note = 'Hidden as spam' where status = 'open';
select public._t_ok('moderator resolution is stamped', (select resolved_by = auth.uid() and resolved_at is not null from public.reports limit 1));
insert into public.account_restrictions (user_id, reason, until) values ('b0000000-0000-4000-8000-00000000000b', 'Repeated spam', now() + interval '7 days');
reset role;
select public._t_ok('reporter is told the outcome', (select count(*) = 1 from public.notifications where kind = 'report_update' and user_id = 'd0000000-0000-4000-8000-00000000000d'));

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-4000-8000-00000000000d","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('hidden post disappears for members', (select count(*) = 0 from public.posts));
reset role;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}', false);
set role authenticated;
select public._t_ok('author still sees own hidden post', (select count(*) = 1 from public.posts));
do $$ begin
  begin insert into public.posts (group_id, author_id, body) values ((select id from public.groups where slug = 't-altrincham'), auth.uid(), 'more spam'); perform public._t_ok('restricted member cannot post', false);
  exception when others then perform public._t_ok('restricted member cannot post', true); end;
end $$;
reset role;

-- Circles cap at their size.
update public.groups set max_members = 10 where slug = 't-circle';
insert into public.group_members (group_id, user_id)
select (select id from public.groups where slug = 't-circle'), u.id from auth.users u where u.email like 'club-%@bayse.invalid' and u.email <> 'club-a@bayse.invalid';
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
select gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club-filler-' || g || '@bayse.invalid', now(), now() from generate_series(1, 6) g;
insert into public.group_members (group_id, user_id)
select (select id from public.groups where slug = 't-circle'), u.id from auth.users u where u.email like 'club-filler-%@bayse.invalid';
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}', false);
set role authenticated;
do $$ begin
  begin insert into public.group_members (group_id, user_id) values ((select id from public.groups where slug = 't-circle'), auth.uid()); perform public._t_ok('full circle cannot be joined', false);
  exception when others then perform public._t_ok('full circle cannot be joined', true); end;
end $$;
select public._t_ok('discovery shows only opted-in members, no emails', (select count(*) = 1 and bool_and(display_name = 'Bea') from public.discover_members()));
reset role;
select set_config('request.jwt.claims', '', false);

select name, ok from public._t_results order by n;
