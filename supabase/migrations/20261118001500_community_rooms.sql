-- Interest chat rooms: members join the rooms they like (Padel, Walking, Nutrition…), chat, and plan meetups.
-- Rooms are groups of kind 'room'. Messages are only visible to room members, hidden by moderators,
-- and never shown between two people who have blocked each other.

alter table public.groups drop constraint groups_kind_check;
alter table public.groups add constraint groups_kind_check
  check (kind = any (array['global', 'studio', 'programme', 'circle', 'topic', 'room']));

-- Which meetup type a room plans (matches activities.kind).
alter table public.groups add column if not exists meetup_kind text check (meetup_kind in ('padel', 'walk', 'social'));
alter table public.groups add column if not exists sort integer not null default 100;

insert into public.groups (kind, slug, name, description, meetup_kind, sort) values
  ('room', 'padel', 'Padel Club', 'Find a four, book a court, swap tips. All levels welcome.', 'padel', 10),
  ('room', 'walks', 'Walk Club', 'Weekend walks, coastal routes and coffee at the end.', 'walk', 20),
  ('room', 'nutrition', 'Nutrition Club', 'Recipes, food shops and meal prep ideas from BAYSE Nourish.', 'social', 30),
  ('room', 'running', 'Run Club', 'Easy 5ks to longer runs. Find someone at your pace.', 'walk', 40),
  ('room', 'social', 'Social Club', 'Coffee, brunch and getting to know each other off the mat.', 'social', 50),
  ('room', 'mums', 'Mums Club', 'Pilates with little ones around. Buggy walks and play dates.', 'walk', 60)
on conflict (slug) do nothing;

create table public.room_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  hidden_at timestamptz,
  hidden_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index room_messages_group_time on public.room_messages (group_id, created_at desc);
create index room_messages_author on public.room_messages (author_id);
create trigger room_messages_guard before update on public.room_messages for each row execute function public.content_guard();

alter table public.room_messages enable row level security;

create or replace function public.is_room(g uuid) returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.groups gr where gr.id = g and gr.kind = 'room' and not gr.archived);
$$;

create policy room_messages_read on public.room_messages for select to authenticated using (
  public.is_moderator() or (public.is_group_member(group_id) and hidden_at is null and not public.is_blocked_between(author_id)));
create policy room_messages_write on public.room_messages for insert to authenticated with check (
  author_id = auth.uid() and hidden_at is null and public.can_participate() and public.is_room(group_id) and public.is_group_member(group_id));
create policy room_messages_moderate on public.room_messages for update to authenticated using (public.is_moderator()) with check (public.is_moderator());
create policy room_messages_delete_own on public.room_messages for delete to authenticated using (author_id = auth.uid() or public.is_moderator());

-- Rooms are open to every member who can take part in the community.
create or replace function public.can_join_group(g uuid) returns boolean
language sql stable security definer set search_path to '' as $$
  select public.can_participate() and exists (
    select 1 from public.groups gr where gr.id = g and not gr.archived and (
      gr.kind in ('global', 'topic', 'circle', 'room')
      or (gr.kind = 'studio' and exists (select 1 from public.studio_memberships sm
            where sm.user_id = auth.uid() and sm.studio_id = gr.studio_id and sm.status = 'verified'))
      or (gr.kind = 'programme' and public.has_entitlement('programmes'))
    ) and (gr.max_members is null or (select count(*) from public.group_members m where m.group_id = g) < gr.max_members));
$$;

drop policy groups_read on public.groups;
create policy groups_read on public.groups for select using (
  public.is_moderator() or (public.can_participate() and not archived
    and (kind = any (array['global', 'topic', 'programme', 'studio', 'room']) or public.is_group_member(id))));

alter table public.reports drop constraint reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type = any (array['post', 'comment', 'activity', 'activity_message', 'profile', 'room_message']));

-- Room list with counts. Counts only; never who is in a room unless you are in it too.
create or replace function public.list_rooms()
returns table (id uuid, slug text, name text, description text, meetup_kind text, member_count integer, is_member boolean, last_message_at timestamptz)
language sql stable security definer set search_path to '' as $$
  select gr.id, gr.slug, gr.name, gr.description, gr.meetup_kind,
    (select count(*)::int from public.group_members m where m.group_id = gr.id),
    exists (select 1 from public.group_members m where m.group_id = gr.id and m.user_id = auth.uid()),
    (select max(rm.created_at) from public.room_messages rm where rm.group_id = gr.id and rm.hidden_at is null)
  from public.groups gr
  where gr.kind = 'room' and not gr.archived and public.can_participate()
  order by gr.sort, gr.name;
$$;
revoke all on function public.list_rooms() from public, anon;
grant execute on function public.list_rooms() to authenticated;
revoke all on function public.is_room(uuid) from public, anon;
grant execute on function public.is_room(uuid) to authenticated;
