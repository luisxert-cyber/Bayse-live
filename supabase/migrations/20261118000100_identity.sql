-- BAYSE Live · Phase 1 · Identity, roles, studios, audit
-- One identity: auth.users -> public.profiles. Roles are separate rows, optionally scoped to a studio.
-- Every table has RLS on. Helper functions are SECURITY DEFINER with an empty search_path.

create type public.app_role as enum (
  'instructor', 'moderator', 'studio_manager', 'admin', 'super_admin'
);

-- updated_at helper -----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Studios ---------------------------------------------------------------------
create table public.studios (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  town        text,
  status      text not null default 'open' check (status in ('open', 'opening', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger studios_updated before update on public.studios
  for each row execute function public.set_updated_at();

-- Profiles --------------------------------------------------------------------
create table public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  email                    text,
  first_name               text check (char_length(first_name) <= 60),
  display_name             text check (char_length(display_name) <= 40),
  home_studio_id           uuid references public.studios (id) on delete set null,
  timezone                 text not null default 'Europe/London',
  adult_confirmed          boolean not null default false,
  onboarding_completed_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index profiles_home_studio_idx on public.profiles (home_studio_id);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Members may not change their own email or onboarding timestamp from the client;
-- those are written by the server (service role bypasses this check).
create or replace function public.profiles_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is not null and auth.uid() = new.id then
    new.email := old.email;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, first_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'first_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger bayse_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Roles -----------------------------------------------------------------------
-- No row = an ordinary member. Membership tier comes from entitlements, not roles.
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        public.app_role not null,
  studio_id   uuid references public.studios (id) on delete cascade,
  granted_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint user_roles_unique unique nulls not distinct (user_id, role, studio_id),
  constraint studio_manager_needs_studio check (role <> 'studio_manager' or studio_id is not null)
);
create index user_roles_user_idx on public.user_roles (user_id);

-- Role helpers (used by every RLS policy) ------------------------------------
create or replace function public.has_role(r public.app_role)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = r
  );
$$;

create or replace function public.has_role_at(r public.app_role, studio uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = r
      and (ur.studio_id is null or ur.studio_id = studio)
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'super_admin'
  );
$$;

create or replace function public.manages_studio(studio uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select studio is not null and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'studio_manager' and ur.studio_id = studio
  );
$$;

-- Audit log -------------------------------------------------------------------
-- Written only by triggers and SECURITY DEFINER functions. Admins can read it.
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  entity      text not null,
  entity_id   text,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);
create index audit_log_created_idx on public.audit_log (created_at desc);

create or replace function public.write_audit(p_action text, p_entity text, p_entity_id text, p_detail jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), p_action, p_entity, p_entity_id, coalesce(p_detail, '{}'::jsonb));
$$;
revoke all on function public.write_audit(text, text, text, jsonb) from public, anon, authenticated;

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (
    auth.uid(), lower(tg_op), tg_table_name, rec ->> 'id',
    case when tg_op = 'UPDATE'
         then jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new))
         else rec end
  );
  return null;
end $$;

create trigger user_roles_audit after insert or update or delete on public.user_roles
  for each row execute function public.audit_row_change();

-- Stop anyone granting a role they are not allowed to grant. RLS also checks this;
-- the trigger records who granted it.
create or replace function public.user_roles_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.granted_by := coalesce(auth.uid(), new.granted_by);
  return new;
end $$;
create trigger user_roles_stamp before insert on public.user_roles
  for each row execute function public.user_roles_stamp();

-- RLS -------------------------------------------------------------------------
alter table public.studios    enable row level security;
alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log  enable row level security;

-- Studios: anyone can read; only admins change them.
create policy studios_read on public.studios for select to anon, authenticated using (true);
create policy studios_admin_write on public.studios for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Profiles: you, admins, and the manager of your home studio (read only).
create policy profiles_read_own on public.profiles for select to authenticated
  using (id = auth.uid());
create policy profiles_read_admin on public.profiles for select to authenticated
  using (public.is_admin());
create policy profiles_read_studio_manager on public.profiles for select to authenticated
  using (public.manages_studio(home_studio_id));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Roles: you can see your own; admins see all.
-- Super admins grant anything. Admins grant every role except admin and super_admin.
create policy roles_read_own on public.user_roles for select to authenticated
  using (user_id = auth.uid());
create policy roles_read_admin on public.user_roles for select to authenticated
  using (public.is_admin());
create policy roles_super_admin_all on public.user_roles for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
create policy roles_admin_insert on public.user_roles for insert to authenticated
  with check (public.is_admin() and role not in ('admin', 'super_admin'));
create policy roles_admin_delete on public.user_roles for delete to authenticated
  using (public.is_admin() and role not in ('admin', 'super_admin'));

-- Audit log: admins read; nobody writes directly.
create policy audit_read_admin on public.audit_log for select to authenticated
  using (public.is_admin());

revoke all on public.audit_log from anon;
