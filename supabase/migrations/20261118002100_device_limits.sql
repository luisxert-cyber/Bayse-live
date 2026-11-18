-- Stop membership sharing: each member can use BAYSE on a limited number of devices (default 2).
-- A new device beyond the limit is turned away until the member removes one. Staff are not limited.
create table public.site_settings (
  id          boolean primary key default true check (id),
  max_devices int not null default 2 check (max_devices between 1 and 10),
  updated_at  timestamptz not null default now()
);
insert into public.site_settings default values;
alter table public.site_settings enable row level security;
create policy site_settings_read on public.site_settings for select to authenticated using (true);
create policy site_settings_admin on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.user_devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  device_id   text not null check (char_length(device_id) between 16 and 64),
  label       text not null default 'Unknown device' check (char_length(label) <= 80),
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  unique (user_id, device_id)
);
create index user_devices_user on public.user_devices (user_id, last_seen desc);
alter table public.user_devices enable row level security;
create policy devices_own_read on public.user_devices for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy devices_own_delete on public.user_devices for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- Each time a member is turned away by the limit (a sign of sharing), for the back office.
create table public.device_limit_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  label      text,
  created_at timestamptz not null default now()
);
create index device_limit_events_user on public.device_limit_events (user_id, created_at desc);
alter table public.device_limit_events enable row level security;
create policy device_limit_events_admin on public.device_limit_events for select to authenticated using (public.is_admin());

-- Called on each visit to the member app. Returns 'ok' or 'limit'. Devices unused for 30 days drop off.
create or replace function public.register_device(p_device text, p_label text) returns text
language plpgsql security definer set search_path to '' as $$
declare uid uuid := auth.uid(); lim int; n int;
begin
  if uid is null or p_device is null or char_length(p_device) < 16 then return 'ok'; end if;
  if exists (select 1 from public.user_roles where user_id = uid) then return 'ok'; end if;  -- staff
  update public.user_devices set last_seen = now(), label = left(coalesce(p_label, label), 80) where user_id = uid and device_id = p_device;
  if found then return 'ok'; end if;
  delete from public.user_devices where user_id = uid and last_seen < now() - interval '30 days';
  select max_devices into lim from public.site_settings;
  select count(*) into n from public.user_devices where user_id = uid;
  if n < lim then
    insert into public.user_devices (user_id, device_id, label) values (uid, left(p_device, 64), left(coalesce(p_label, 'Unknown device'), 80)) on conflict do nothing;
    return 'ok';
  end if;
  insert into public.device_limit_events (user_id, label) values (uid, left(p_label, 80));
  return 'limit';
end $$;
revoke all on function public.register_device(text, text) from public, anon;
grant execute on function public.register_device(text, text) to authenticated;

-- Back office: members who keep hitting the limit.
create or replace function public.device_sharing_signals()
returns table (user_id uuid, email text, name text, devices int, blocked_30d int, last_blocked timestamptz)
language sql stable security definer set search_path to '' as $$
  select p.id, p.email, coalesce(p.display_name, p.first_name),
    (select count(*)::int from public.user_devices d where d.user_id = p.id),
    count(e.*)::int, max(e.created_at)
  from public.device_limit_events e join public.profiles p on p.id = e.user_id
  where public.is_admin() and e.created_at > now() - interval '30 days'
  group by p.id, p.email, p.display_name, p.first_name
  order by 5 desc;
$$;
revoke all on function public.device_sharing_signals() from public, anon;
grant execute on function public.device_sharing_signals() to authenticated;
