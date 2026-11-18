-- Live classes: the weekly timetable (public to signed-in members) and the Zoom join links
-- (only for members whose plan includes live classes, or admins). Join links contain passcodes,
-- so they live only in the database and are never committed to the repository.
create table public.live_classes (
  id          uuid primary key default gen_random_uuid(),
  weekday     int  not null check (weekday between 1 and 7),   -- ISO: 1 = Monday … 7 = Sunday
  starts_at   time not null,                                    -- UK local time
  name        text not null,
  minutes     int  not null default 45 check (minutes between 10 and 120),
  active      boolean not null default true,
  unique (weekday, starts_at)
);

create table public.live_class_links (
  class_id        uuid primary key references public.live_classes (id) on delete cascade,
  zoom_meeting_id text not null,
  join_url        text not null
);

alter table public.live_classes enable row level security;
alter table public.live_class_links enable row level security;

create policy live_classes_read on public.live_classes for select to authenticated using (true);
create policy live_classes_admin on public.live_classes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy live_links_read on public.live_class_links for select to authenticated
  using (public.has_entitlement('live_classes') or public.is_admin());
create policy live_links_admin on public.live_class_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.live_classes (weekday, starts_at, name) values
  (1,'07:00','Wake-up Flow'),(1,'09:00','Mat Pilates'),(1,'19:00','Signature Sculpt'),
  (2,'07:00','Wake-up Flow'),(2,'12:00','Lunchtime Core & Glutes'),(2,'19:00','Signature Sculpt'),
  (3,'07:00','Wake-up Flow'),(3,'09:00','Mat Pilates'),(3,'19:00','Signature Sculpt'),
  (4,'07:00','Wake-up Flow'),(4,'12:00','Lunchtime Core & Glutes'),(4,'19:00','Signature Sculpt'),
  (5,'07:00','Wake-up Flow'),(5,'09:00','Mat Pilates'),(5,'19:00','Stretch & Restore'),
  (6,'09:00','Full Body Sculpt'),
  (7,'09:00','Slow Flow & Mobility')
on conflict (weekday, starts_at) do nothing;
