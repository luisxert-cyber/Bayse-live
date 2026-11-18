-- Recorded voice cues: one short audio file per move (<move>.mp3 / .m4a), plus a few shared phrases
-- (_rest.mp3, _start.mp3, _done.mp3). Public to listen to, only admins can upload.
do $$
begin
  if to_regclass('storage.buckets') is null then return; end if;
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('move-voice', 'move-voice', true, 2097152, array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav'])
  on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  execute 'drop policy if exists "move voice: anyone can list" on storage.objects';
  execute 'create policy "move voice: anyone can list" on storage.objects for select to anon, authenticated using (bucket_id = ''move-voice'')';
  execute 'drop policy if exists "move voice: admins upload" on storage.objects';
  execute 'create policy "move voice: admins upload" on storage.objects for insert to authenticated with check (bucket_id = ''move-voice'' and public.is_admin())';
  execute 'drop policy if exists "move voice: admins replace" on storage.objects';
  execute 'create policy "move voice: admins replace" on storage.objects for update to authenticated using (bucket_id = ''move-voice'' and public.is_admin()) with check (bucket_id = ''move-voice'' and public.is_admin())';
  execute 'drop policy if exists "move voice: admins remove" on storage.objects';
  execute 'create policy "move voice: admins remove" on storage.objects for delete to authenticated using (bucket_id = ''move-voice'' and public.is_admin())';
end $$;
