-- Filmed on-demand classes, uploaded from the back office (or linked from Vimeo/YouTube/Mux).
-- Members with on-demand access (membership or free trial) can watch; classes marked free are open to every signed-in member.
create table public.video_classes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title         text not null check (char_length(title) between 2 and 80),
  description   text check (char_length(description) <= 800),
  style         text not null default 'mat' check (style in ('mat', 'sculpt', 'stretch', 'prenatal', 'beginner', 'reformer')),
  level         text not null default 'Steady' check (level in ('Gentle', 'Steady', 'Strong')),
  minutes       int  not null check (minutes between 1 and 180),
  equipment     text[] not null default '{}',
  instructor_id uuid references public.instructors (id) on delete set null,
  video_path    text,                              -- file in the private class-videos bucket
  video_url     text check (video_url is null or video_url ~ '^https://'),
  cover_path    text,                              -- file in the public class-covers bucket
  free          boolean not null default false,
  status        text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  sort          int not null default 100,
  created_by    uuid references public.profiles (id) default auth.uid(),
  created_at    timestamptz not null default now(),
  published_at  timestamptz,
  check (video_path is not null or video_url is not null or status = 'draft')
);
create index video_classes_status on public.video_classes (status, sort);
alter table public.video_classes enable row level security;

-- Anyone can see what is published (titles and covers for the website). Watching is controlled by the video storage policy.
create policy video_classes_read on public.video_classes for select using (status = 'published' or public.is_content_editor());
create policy video_classes_admin on public.video_classes for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Instructors can upload drafts of their own classes; only admins publish.
create policy video_classes_instructor_insert on public.video_classes for insert to authenticated
  with check (instructor_id = public.my_instructor_id() and status = 'draft');
create policy video_classes_instructor_update on public.video_classes for update to authenticated
  using (instructor_id = public.my_instructor_id() and status = 'draft')
  with check (instructor_id = public.my_instructor_id() and status = 'draft');

create or replace function public.video_classes_stamp() returns trigger
language plpgsql set search_path to '' as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then new.published_at := now(); end if;
  return new;
end $$;
create trigger video_classes_stamp before insert or update on public.video_classes for each row execute function public.video_classes_stamp();

-- Can this member watch this class?
create or replace function public.can_watch_video(p_path text) returns boolean
language sql stable security definer set search_path to '' as $$
  select public.is_content_editor() or exists (
    select 1 from public.video_classes v where v.video_path = p_path and v.status = 'published'
      and (v.free or public.has_entitlement('on_demand')));
$$;
grant execute on function public.can_watch_video(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-videos', 'class-videos', false, null, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-covers', 'class-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "class-videos: members with access watch" on storage.objects for select to authenticated
  using (bucket_id = 'class-videos' and public.can_watch_video(name));
create policy "class-videos: editors upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'class-videos' and public.is_content_editor());
create policy "class-videos: admins remove" on storage.objects for delete to authenticated
  using (bucket_id = 'class-videos' and public.is_admin());
create policy "class-covers: editors upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'class-covers' and public.is_content_editor());
create policy "class-covers: admins remove" on storage.objects for delete to authenticated
  using (bucket_id = 'class-covers' and public.is_admin());
