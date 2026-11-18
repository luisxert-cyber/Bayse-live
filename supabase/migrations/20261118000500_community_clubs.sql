-- BAYSE Live · Phase 5 (data layer) · Community, Circles and member-run Clubs
-- Member-led by design: members create Padel, Walk and Social activities; the database
-- manages places, waiting lists, promotion, chat access, notifications and reminders,
-- so no studio manager has to organise or approve ordinary activities.
-- Safety: adults only, community entitlement required, public venues only (free text,
-- never a home address), blocking, reporting, moderator tools and account restrictions.

-- Who may take part --------------------------------------------------------------
create table public.account_restrictions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (char_length(reason) <= 500),
  until       timestamptz,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index account_restrictions_user_idx on public.account_restrictions (user_id);

create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('moderator', 'admin', 'super_admin'));
$$;

create or replace function public.can_participate()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
     and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
     and public.has_entitlement('community')
     and exists (select 1 from public.profiles p where p.id = auth.uid() and p.adult_confirmed and p.display_name is not null)
     and not exists (select 1 from public.account_restrictions r
                     where r.user_id = auth.uid() and (r.until is null or r.until > now()));
$$;

-- Blocking -----------------------------------------------------------------------
create table public.blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- True if either person has blocked the other.
create or replace function public.is_blocked_between(other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = other)
       or (b.blocker_id = other and b.blocked_id = auth.uid()));
$$;

-- Discovery and privacy settings ---------------------------------------------------
create table public.discovery_prefs (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  discoverable    boolean not null default false,   -- appear in "find local members"
  allow_messages  boolean not null default false,   -- others can start a conversation
  interests       text[] not null default '{}' check (interests <@ array['padel', 'walk', 'social', 'pilates_friends', 'accountability']::text[]),
  notify_new_activities boolean not null default true,
  updated_at      timestamptz not null default now()
);
create trigger discovery_prefs_updated before update on public.discovery_prefs
  for each row execute function public.set_updated_at();

-- Display names only, for people the caller can already see in context.
create or replace function public.public_names(p_ids uuid[])
returns table (id uuid, display_name text) language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name from public.profiles p
   where public.can_participate() and p.id = any (p_ids) and not public.is_blocked_between(p.id);
$$;

-- Members who opted in to discovery at the caller's home studio. No contact details.
create or replace function public.discover_members()
returns table (id uuid, display_name text, interests text[]) language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, d.interests
    from public.profiles p
    join public.discovery_prefs d on d.user_id = p.id and d.discoverable
   where public.can_participate()
     and p.id <> auth.uid()
     and p.home_studio_id = (select home_studio_id from public.profiles where id = auth.uid())
     and not public.is_blocked_between(p.id)
   order by p.display_name
   limit 200;
$$;

-- Groups: global, studio, programme, circle ---------------------------------------
create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('global', 'studio', 'programme', 'circle', 'topic')),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null check (char_length(name) between 2 and 80),
  description  text check (char_length(description) <= 500),
  studio_id    uuid references public.studios (id) on delete cascade,
  programme_id uuid references public.programmes (id) on delete cascade,
  max_members  int check (max_members between 2 and 100000),
  created_by   uuid references public.profiles (id) on delete set null,
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  check (kind <> 'studio' or studio_id is not null),
  check (kind <> 'circle' or max_members between 10 and 20)
);

create table public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null default 'member' check (role in ('member', 'host')),
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on public.group_members (user_id);

create or replace function public.is_group_member(g uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members m where m.group_id = g and m.user_id = auth.uid());
$$;

-- Joining rules: studio groups need a verified link to that studio; circles have a size cap.
create or replace function public.can_join_group(g uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.can_participate() and exists (
    select 1 from public.groups gr where gr.id = g and not gr.archived and (
      gr.kind in ('global', 'topic', 'circle')
      or (gr.kind = 'studio' and exists (select 1 from public.studio_memberships sm
            where sm.user_id = auth.uid() and sm.studio_id = gr.studio_id and sm.status = 'verified'))
      or (gr.kind = 'programme' and public.has_entitlement('programmes'))
    ) and (gr.max_members is null or (select count(*) from public.group_members m where m.group_id = g) < gr.max_members)
  );
$$;

-- Posts, comments, reactions --------------------------------------------------------
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 2000),
  photo_path  text check (photo_path ~ '^[a-z0-9/_.-]+$'),
  hidden_at   timestamptz,
  hidden_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz
);
create index posts_group_idx on public.posts (group_id, created_at desc);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  hidden_at   timestamptz,
  hidden_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.reactions (
  post_id     uuid not null references public.posts (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        text not null default 'clap' check (kind in ('clap', 'heart', 'strong', 'fire')),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Members cannot hide or unhide content; only moderators can (stamped here).
create or replace function public.content_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.author_id := old.author_id;
    new.created_at := old.created_at;
    if (new.hidden_at is distinct from old.hidden_at) then
      if not public.is_moderator() then
        new.hidden_at := old.hidden_at;
        new.hidden_by := old.hidden_by;
      else
        new.hidden_by := case when new.hidden_at is null then null else auth.uid() end;
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger posts_guard before update on public.posts for each row execute function public.content_guard();
create trigger comments_guard before update on public.comments for each row execute function public.content_guard();

-- Club activities -----------------------------------------------------------------
create table public.activities (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('padel', 'walk', 'social')),
  title         text not null check (char_length(title) between 3 and 80),
  description   text check (char_length(description) <= 1000),
  studio_id     uuid references public.studios (id) on delete set null,
  venue_name    text not null check (char_length(venue_name) between 2 and 120),  -- a public place
  venue_area    text check (char_length(venue_area) <= 80),                        -- town or area, shown on cards
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  capacity      int check (capacity between 2 and 200),                            -- null = no limit
  level         text check (level in ('beginner', 'intermediate', 'advanced', 'all')),
  padel_format  text check (padel_format in ('doubles', 'singles', 'americano', 'other')),
  distance_km   numeric(4,1) check (distance_km between 0.5 and 50),
  pace          text check (pace in ('easy', 'steady', 'brisk')),
  host_id       uuid not null references public.profiles (id) on delete cascade,
  repeats_weekly boolean not null default false,
  series_id     uuid,
  status        text not null default 'open' check (status in ('open', 'cancelled', 'completed', 'removed')),
  reminded_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at),
  check (kind = 'padel' or padel_format is null),
  check (kind = 'walk' or (distance_km is null and pace is null))
);
create index activities_upcoming_idx on public.activities (status, starts_at);
create index activities_studio_idx on public.activities (studio_id, starts_at);
create trigger activities_updated before update on public.activities for each row execute function public.set_updated_at();

create table public.activity_rsvps (
  activity_id  uuid not null references public.activities (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  status       text not null check (status in ('going', 'waitlist', 'left')),
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  primary key (activity_id, user_id)
);
create index activity_rsvps_waitlist_idx on public.activity_rsvps (activity_id, status, updated_at);

create table public.activity_messages (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 1000),
  hidden_at    timestamptz,
  created_at   timestamptz not null default now()
);
create index activity_messages_idx on public.activity_messages (activity_id, created_at);

create or replace function public.is_activity_participant(a uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.activities x where x.id = a and x.host_id = auth.uid())
      or exists (select 1 from public.activity_rsvps r where r.activity_id = a and r.user_id = auth.uid() and r.status in ('going', 'waitlist'));
$$;

-- Notifications (email first, push later; sending is done by a server job) -----------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('activity_new', 'activity_promoted', 'activity_cancelled', 'activity_reminder', 'activity_space', 'report_update', 'group_post')),
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  read_at     timestamptz,
  sent_at     timestamptz
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- New activity checks: future start, host may take part, host gets a place automatically.
create or replace function public.activities_before_insert()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.starts_at <= now() + interval '15 minutes' then
    raise exception 'Activities must start at least 15 minutes from now' using errcode = '22023';
  end if;
  new.status := 'open';
  new.reminded_at := null;
  return new;
end $$;
create trigger activities_before_insert before insert on public.activities
  for each row execute function public.activities_before_insert();

create or replace function public.activities_after_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_rsvps (activity_id, user_id, status) values (new.id, new.host_id, 'going');
  -- Tell interested members at the same studio (not the host, not anyone blocked either way).
  insert into public.notifications (user_id, kind, payload)
  select d.user_id, 'activity_new', jsonb_build_object('activity_id', new.id, 'kind', new.kind, 'title', new.title, 'starts_at', new.starts_at)
    from public.discovery_prefs d
    join public.profiles p on p.id = d.user_id
   where d.notify_new_activities and new.kind = any (d.interests)
     and p.home_studio_id is not distinct from new.studio_id
     and d.user_id <> new.host_id
     and not exists (select 1 from public.blocks b where (b.blocker_id = d.user_id and b.blocked_id = new.host_id) or (b.blocker_id = new.host_id and b.blocked_id = d.user_id));
  return null;
end $$;
create trigger activities_after_insert after insert on public.activities
  for each row execute function public.activities_after_insert();

-- Hosts may edit details or cancel; they cannot move the host, shrink below current places, or un-cancel.
create or replace function public.activities_before_update()
returns trigger language plpgsql set search_path = '' as $$
declare going int;
begin
  new.host_id := old.host_id;
  new.created_at := old.created_at;
  if old.status in ('cancelled', 'removed', 'completed') and new.status = 'open' and not public.is_moderator() then
    new.status := old.status;
  end if;
  if new.status = 'removed' and old.status <> 'removed' and not public.is_moderator() then
    new.status := old.status;
  end if;
  if new.capacity is not null and new.capacity is distinct from old.capacity then
    select count(*) into going from public.activity_rsvps where activity_id = new.id and status = 'going';
    if new.capacity < going then
      raise exception 'Capacity cannot be lower than the % people already going', going using errcode = '22023';
    end if;
  end if;
  return new;
end $$;
create trigger activities_before_update before update on public.activities
  for each row execute function public.activities_before_update();

create or replace function public.activities_after_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status in ('cancelled', 'removed') and old.status = 'open' then
    insert into public.notifications (user_id, kind, payload)
    select r.user_id, 'activity_cancelled', jsonb_build_object('activity_id', new.id, 'title', new.title, 'starts_at', new.starts_at)
      from public.activity_rsvps r
     where r.activity_id = new.id and r.status in ('going', 'waitlist') and r.user_id <> new.host_id;
  end if;
  -- More places: promote from the waiting list in order.
  if new.status = 'open' and (new.capacity is null or new.capacity > coalesce(old.capacity, 0)) then
    perform public.promote_waitlist(new.id);
  end if;
  return null;
end $$;
create trigger activities_after_update after update on public.activities
  for each row execute function public.activities_after_update();

-- Fill free places from the waiting list, oldest first. Called with the activity row locked.
create or replace function public.promote_waitlist(a uuid)
returns int language plpgsql security definer set search_path = '' as $$
declare
  cap int; title text; starts timestamptz; going int; promoted int := 0; nxt uuid;
begin
  select x.capacity, x.title, x.starts_at into cap, title, starts from public.activities x where x.id = a for update;
  loop
    select count(*) into going from public.activity_rsvps where activity_id = a and status = 'going';
    exit when cap is not null and going >= cap;
    select r.user_id into nxt from public.activity_rsvps r
     where r.activity_id = a and r.status = 'waitlist' order by r.updated_at, r.created_at limit 1;
    exit when nxt is null;
    update public.activity_rsvps set status = 'going', updated_at = now() where activity_id = a and user_id = nxt;
    insert into public.notifications (user_id, kind, payload)
    values (nxt, 'activity_promoted', jsonb_build_object('activity_id', a, 'title', title, 'starts_at', starts));
    promoted := promoted + 1;
  end loop;
  return promoted;
end $$;
revoke all on function public.promote_waitlist(uuid) from public, anon, authenticated;

-- Join an activity. Returns 'going' or 'waitlist'. All place-counting happens here, under a row lock.
create or replace function public.join_activity(a uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  act public.activities%rowtype; going int; result text;
begin
  if not public.can_participate() then raise exception 'Not allowed to join activities' using errcode = '42501'; end if;
  select * into act from public.activities where id = a for update;
  if not found or act.status <> 'open' then raise exception 'This activity is not open' using errcode = '22023'; end if;
  if act.starts_at <= now() then raise exception 'This activity has already started' using errcode = '22023'; end if;
  if public.is_blocked_between(act.host_id) then raise exception 'This activity is not available' using errcode = '42501'; end if;
  if exists (select 1 from public.activity_rsvps where activity_id = a and user_id = auth.uid() and status in ('going', 'waitlist')) then
    select status into result from public.activity_rsvps where activity_id = a and user_id = auth.uid();
    return result;
  end if;
  select count(*) into going from public.activity_rsvps where activity_id = a and status = 'going';
  result := case when act.capacity is null or going < act.capacity then 'going' else 'waitlist' end;
  insert into public.activity_rsvps (activity_id, user_id, status) values (a, auth.uid(), result)
  on conflict (activity_id, user_id) do update set status = excluded.status, updated_at = now();
  return result;
end $$;

-- Leave an activity. A freed place goes to the first person waiting. Hosts cancel instead.
create or replace function public.leave_activity(a uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare host uuid; was text;
begin
  select host_id into host from public.activities where id = a for update;
  if host = auth.uid() then raise exception 'Hosts cancel the activity instead of leaving' using errcode = '22023'; end if;
  select status into was from public.activity_rsvps where activity_id = a and user_id = auth.uid();
  if was is null or was = 'left' then return; end if;
  update public.activity_rsvps set status = 'left', updated_at = now() where activity_id = a and user_id = auth.uid();
  if was = 'going' then perform public.promote_waitlist(a); end if;
end $$;

-- Reminders and expiry: run every 15 minutes by a scheduler (pg_cron or a Netlify scheduled function).
create or replace function public.queue_activity_reminders()
returns int language plpgsql security definer set search_path = '' as $$
declare n int := 0;
begin
  with due as (
    update public.activities set reminded_at = now()
     where status = 'open' and reminded_at is null
       and starts_at between now() and now() + interval '24 hours'
    returning id, title, starts_at
  ), ins as (
    insert into public.notifications (user_id, kind, payload)
    select r.user_id, 'activity_reminder', jsonb_build_object('activity_id', d.id, 'title', d.title, 'starts_at', d.starts_at)
      from due d join public.activity_rsvps r on r.activity_id = d.id and r.status = 'going'
    returning 1
  )
  select count(*) into n from ins;
  update public.activities set status = 'completed'
   where status = 'open' and coalesce(ends_at, starts_at + interval '3 hours') < now();
  return n;
end $$;
revoke all on function public.queue_activity_reminders() from public, anon, authenticated;

-- Reports and moderation -------------------------------------------------------------
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  target_type      text not null check (target_type in ('post', 'comment', 'activity', 'activity_message', 'profile')),
  target_id        uuid not null,
  reason           text not null check (reason in ('harassment', 'unsafe', 'spam', 'inappropriate', 'privacy', 'other')),
  details          text check (char_length(details) <= 1000),
  status           text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  resolution_note  text check (char_length(resolution_note) <= 1000),
  resolved_by      uuid references public.profiles (id) on delete set null,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index reports_open_idx on public.reports (status, created_at);

create or replace function public.reports_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'open'; new.resolved_by := null; new.resolved_at := null; new.resolution_note := null;
  else
    new.reporter_id := old.reporter_id; new.target_type := old.target_type; new.target_id := old.target_id;
    new.reason := old.reason; new.details := old.details; new.created_at := old.created_at;
    if new.status is distinct from old.status and new.status <> 'open' then
      new.resolved_by := auth.uid(); new.resolved_at := now();
    end if;
  end if;
  return new;
end $$;
create trigger reports_guard before insert or update on public.reports
  for each row execute function public.reports_guard();

create or replace function public.reports_after_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'open' and old.status = 'open' then
    insert into public.notifications (user_id, kind, payload)
    values (new.reporter_id, 'report_update', jsonb_build_object('report_id', new.id, 'status', new.status));
  end if;
  return null;
end $$;
create trigger reports_after_update after update on public.reports
  for each row execute function public.reports_after_update();

create trigger reports_audit after update on public.reports for each row execute function public.audit_row_change();
create trigger account_restrictions_audit after insert or update or delete on public.account_restrictions
  for each row execute function public.audit_row_change();

-- RLS -----------------------------------------------------------------------------
alter table public.account_restrictions enable row level security;
alter table public.blocks               enable row level security;
alter table public.discovery_prefs      enable row level security;
alter table public.groups               enable row level security;
alter table public.group_members        enable row level security;
alter table public.posts                enable row level security;
alter table public.comments             enable row level security;
alter table public.reactions            enable row level security;
alter table public.activities           enable row level security;
alter table public.activity_rsvps       enable row level security;
alter table public.activity_messages    enable row level security;
alter table public.notifications        enable row level security;
alter table public.reports              enable row level security;

create policy restrictions_read on public.account_restrictions for select to authenticated
  using (user_id = auth.uid() or public.is_moderator());
create policy restrictions_manage on public.account_restrictions for all to authenticated
  using (public.is_moderator()) with check (public.is_moderator() and user_id <> auth.uid());

create policy blocks_own on public.blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy discovery_own on public.discovery_prefs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy groups_read on public.groups for select to authenticated
  using (public.is_moderator() or (public.can_participate() and not archived and (kind in ('global', 'topic', 'programme', 'studio') or public.is_group_member(id))));
create policy groups_admin on public.groups for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy group_members_read on public.group_members for select to authenticated
  using (user_id = auth.uid() or public.is_group_member(group_id) or public.is_moderator());
create policy group_members_join on public.group_members for insert to authenticated
  with check (user_id = auth.uid() and role = 'member' and public.can_join_group(group_id));
create policy group_members_leave on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_moderator());

create policy posts_read on public.posts for select to authenticated
  using (public.is_moderator() or (public.is_group_member(group_id) and (hidden_at is null or author_id = auth.uid()) and not public.is_blocked_between(author_id)));
create policy posts_write on public.posts for insert to authenticated
  with check (author_id = auth.uid() and public.can_participate() and public.is_group_member(group_id) and hidden_at is null);
create policy posts_edit on public.posts for update to authenticated
  using (author_id = auth.uid() or public.is_moderator()) with check (author_id = auth.uid() or public.is_moderator());
create policy posts_delete on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator());

create policy comments_read on public.comments for select to authenticated
  using (public.is_moderator() or (exists (select 1 from public.posts p where p.id = post_id and public.is_group_member(p.group_id) and p.hidden_at is null)
         and (hidden_at is null or author_id = auth.uid()) and not public.is_blocked_between(author_id)));
create policy comments_write on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.can_participate() and hidden_at is null
              and exists (select 1 from public.posts p where p.id = post_id and public.is_group_member(p.group_id) and p.hidden_at is null and not public.is_blocked_between(p.author_id)));
create policy comments_edit on public.comments for update to authenticated
  using (author_id = auth.uid() or public.is_moderator()) with check (author_id = auth.uid() or public.is_moderator());
create policy comments_delete on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator());

create policy reactions_read on public.reactions for select to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and public.is_group_member(p.group_id)));
create policy reactions_own on public.reactions for insert to authenticated
  with check (user_id = auth.uid() and public.can_participate() and exists (select 1 from public.posts p where p.id = post_id and public.is_group_member(p.group_id)));
create policy reactions_remove on public.reactions for delete to authenticated using (user_id = auth.uid());

create policy activities_read on public.activities for select to authenticated
  using (public.is_moderator() or host_id = auth.uid() or (public.can_participate() and status <> 'removed' and not public.is_blocked_between(host_id)));
create policy activities_create on public.activities for insert to authenticated
  with check (host_id = auth.uid() and public.can_participate());
create policy activities_edit on public.activities for update to authenticated
  using (host_id = auth.uid() or public.is_moderator()) with check (host_id = auth.uid() or public.is_moderator());

-- RSVPs change only through join_activity / leave_activity.
create policy rsvps_read on public.activity_rsvps for select to authenticated
  using (user_id = auth.uid() or public.is_activity_participant(activity_id) or public.is_moderator());

create policy activity_messages_read on public.activity_messages for select to authenticated
  using (public.is_moderator() or (public.is_activity_participant(activity_id) and hidden_at is null and not public.is_blocked_between(author_id)));
create policy activity_messages_write on public.activity_messages for insert to authenticated
  with check (author_id = auth.uid() and public.can_participate() and public.is_activity_participant(activity_id) and hidden_at is null);
create policy activity_messages_moderate on public.activity_messages for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_mark_read on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy reports_create on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and public.can_participate());
create policy reports_read on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_moderator());
create policy reports_resolve on public.reports for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
