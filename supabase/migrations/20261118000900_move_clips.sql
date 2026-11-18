-- Video clips for moves. One file per move, named <move key>.mp4 (or .webm), in a public bucket.
-- Anyone can watch and list them (they are class content, no personal data).
-- Only BAYSE admins can upload, replace or remove them.
-- Guarded so local test databases started without the storage service still migrate.
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'storage not available, skipping move-clips bucket';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('move-clips', 'move-clips', true, 8388608, array['video/mp4', 'video/webm'])
  on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

  execute 'drop policy if exists "move clips: anyone can list" on storage.objects';
  execute 'create policy "move clips: anyone can list" on storage.objects for select to anon, authenticated using (bucket_id = ''move-clips'')';

  execute 'drop policy if exists "move clips: admins upload" on storage.objects';
  execute 'create policy "move clips: admins upload" on storage.objects for insert to authenticated with check (bucket_id = ''move-clips'' and public.is_admin())';

  execute 'drop policy if exists "move clips: admins replace" on storage.objects';
  execute 'create policy "move clips: admins replace" on storage.objects for update to authenticated using (bucket_id = ''move-clips'' and public.is_admin()) with check (bucket_id = ''move-clips'' and public.is_admin())';

  execute 'drop policy if exists "move clips: admins remove" on storage.objects';
  execute 'create policy "move clips: admins remove" on storage.objects for delete to authenticated using (bucket_id = ''move-clips'' and public.is_admin())';
end $$;
