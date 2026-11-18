-- Virtual assistants help run the platform day to day: members, live classes, the video library and community reports.
-- They cannot see health declarations, onboarding answers, payments data in Stripe tables, instructor pay, staff, plans, flags or the audit log.
create or replace function public.is_support()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('virtual_assistant', 'admin', 'super_admin'));
$$;
revoke all on function public.is_support() from public;
grant execute on function public.is_support() to authenticated;

create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('moderator', 'virtual_assistant', 'admin', 'super_admin'));
$$;

create or replace function public.is_content_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('instructor', 'virtual_assistant', 'admin', 'super_admin'));
$$;

create or replace function public.staff_ids(p_ids uuid[])
returns setof uuid language sql stable security definer set search_path = '' as $$
  select distinct ur.user_id from public.user_roles ur
   where public.can_participate() and ur.user_id = any (p_ids)
     and ur.role in ('instructor', 'moderator', 'virtual_assistant', 'admin', 'super_admin');
$$;

-- Members: look people up and see what membership and access they have (read only).
create policy profiles_read_support on public.profiles for select to authenticated using (public.is_support());
create policy studio_links_read_support on public.studio_memberships for select to authenticated using (public.is_support());
create policy subscriptions_read_support on public.subscriptions for select to authenticated using (public.is_support());
create policy entitlements_read_support on public.entitlements for select to authenticated using (public.is_support());

-- Live classes: timetable, Zoom links and who teaches.
create policy live_classes_support on public.live_classes for all to authenticated using (public.is_support()) with check (public.is_support());
create policy live_links_support on public.live_class_links for all to authenticated using (public.is_support()) with check (public.is_support());
create policy lci_support on public.live_class_instructors for all to authenticated using (public.is_support()) with check (public.is_support());
create policy instructors_read_support on public.instructors for select to authenticated using (public.is_support());

-- On-demand library: add, edit, publish and hide classes.
create policy video_classes_support on public.video_classes for all to authenticated using (public.is_support()) with check (public.is_support());
