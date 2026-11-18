-- BAYSE Live · Community screens: helpers the member app needs on top of the Phase 5 data layer.
-- Studios are kept separate from the online platform, so studio groups are archived.

update public.groups set archived = true where kind = 'studio';

-- Can the caller take part, and if not, why (shown to the member, nothing sensitive).
create or replace function public.community_status()
returns text language sql stable security definer set search_path = '' as $$
  select case
    when auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then 'sign_in'
    when exists (select 1 from public.account_restrictions r where r.user_id = auth.uid() and (r.until is null or r.until > now())) then 'restricted'
    when not public.has_entitlement('community') then 'membership'
    when not exists (select 1 from public.profiles p where p.id = auth.uid() and p.adult_confirmed and p.display_name is not null) then 'profile'
    else 'ok' end;
$$;
grant execute on function public.community_status() to authenticated;

-- Join the everyone feed and the topic groups (idempotent). Returns how many were joined.
create or replace function public.join_default_groups()
returns int language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not public.can_participate() then return 0; end if;
  insert into public.group_members (group_id, user_id)
  select g.id, auth.uid() from public.groups g where g.kind in ('global', 'topic') and not g.archived
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function public.join_default_groups() to authenticated;

-- Circles: browse open ones (members are only visible to fellow Circle members, so counts come from here).
create or replace function public.list_circles()
returns table (id uuid, name text, description text, max_members int, member_count int, is_member boolean)
language sql stable security definer set search_path = '' as $$
  select g.id, g.name, g.description, g.max_members,
         (select count(*)::int from public.group_members m where m.group_id = g.id),
         exists (select 1 from public.group_members m where m.group_id = g.id and m.user_id = auth.uid())
    from public.groups g
   where public.can_participate() and g.kind = 'circle' and not g.archived
   order by 6 desc, g.created_at desc
   limit 200;
$$;
grant execute on function public.list_circles() to authenticated;

-- Start a Circle. The creator hosts it. Up to two Circles hosted per member.
create or replace function public.create_circle(p_name text, p_description text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare gid uuid; base text; s text; i int := 0;
begin
  if not public.can_participate() then raise exception 'Not allowed to start a Circle' using errcode = '42501'; end if;
  if char_length(coalesce(trim(p_name), '')) not between 2 and 80 then raise exception 'Give your Circle a name (2 to 80 characters)' using errcode = '22023'; end if;
  if (select count(*) from public.group_members m join public.groups g on g.id = m.group_id
       where m.user_id = auth.uid() and m.role = 'host' and g.kind = 'circle' and not g.archived) >= 2 then
    raise exception 'You can host up to two Circles' using errcode = '22023';
  end if;
  base := 'circle-' || trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if base = 'circle-' then base := 'circle'; end if;
  s := left(base, 60);
  while exists (select 1 from public.groups where slug = s) loop
    i := i + 1; s := left(base, 55) || '-' || i;
  end loop;
  insert into public.groups (kind, slug, name, description, max_members, created_by)
  values ('circle', s, trim(p_name), nullif(trim(coalesce(p_description, '')), ''), 12, auth.uid())
  returning id into gid;
  insert into public.group_members (group_id, user_id, role) values (gid, auth.uid(), 'host');
  return gid;
end $$;
grant execute on function public.create_circle(text, text) to authenticated;

-- Read one group's details if the caller may see it (Circles: members only).
create or replace function public.group_info(g uuid)
returns table (id uuid, kind text, name text, description text, max_members int, member_count int, is_member boolean, is_host boolean)
language sql stable security definer set search_path = '' as $$
  select gr.id, gr.kind, gr.name, gr.description, gr.max_members,
         (select count(*)::int from public.group_members m where m.group_id = gr.id),
         exists (select 1 from public.group_members m where m.group_id = gr.id and m.user_id = auth.uid()),
         exists (select 1 from public.group_members m where m.group_id = gr.id and m.user_id = auth.uid() and m.role = 'host')
    from public.groups gr
   where gr.id = g and not gr.archived and public.can_participate();
$$;
grant execute on function public.group_info(uuid) to authenticated;

-- Going and waiting counts for activities the caller can see (RSVP rows are private to participants).
create or replace function public.activity_counts(p_ids uuid[])
returns table (activity_id uuid, going int, waiting int)
language sql stable security definer set search_path = '' as $$
  select a.id,
         (select count(*)::int from public.activity_rsvps r where r.activity_id = a.id and r.status = 'going'),
         (select count(*)::int from public.activity_rsvps r where r.activity_id = a.id and r.status = 'waitlist')
    from public.activities a
   where a.id = any (p_ids) and public.can_participate() and a.status <> 'removed' and not public.is_blocked_between(a.host_id);
$$;
grant execute on function public.activity_counts(uuid[]) to authenticated;
