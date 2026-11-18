-- Members now get the Zoom link through join_live_class (from 15 minutes before a class), not by reading the table.
drop policy if exists live_links_read on public.live_class_links;
create policy live_links_read on public.live_class_links for select to authenticated using (public.is_support());
