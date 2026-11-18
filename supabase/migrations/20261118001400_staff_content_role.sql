-- Staff back office: instructors can manage class content (move videos and voice cues) without being admins.
create or replace function public.is_content_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('instructor', 'admin', 'super_admin'));
$$;
grant execute on function public.is_content_editor() to authenticated;

do $$
declare b text;
begin
  if to_regclass('storage.buckets') is null then return; end if;
  foreach b in array array['move-clips', 'move-voice'] loop
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', ' ') || ': admins upload');
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', ' ') || ': admins replace');
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', ' ') || ': admins remove');
    execute format('drop policy if exists %I on storage.objects', b || ': editors upload');
    execute format('drop policy if exists %I on storage.objects', b || ': editors replace');
    execute format('drop policy if exists %I on storage.objects', b || ': editors remove');
    execute format('create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_content_editor())', b || ': editors upload', b);
    execute format('create policy %I on storage.objects for update to authenticated using (bucket_id = %L and public.is_content_editor()) with check (bucket_id = %L and public.is_content_editor())', b || ': editors replace', b, b);
    execute format('create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and public.is_content_editor())', b || ': editors remove', b);
  end loop;
end $$;
