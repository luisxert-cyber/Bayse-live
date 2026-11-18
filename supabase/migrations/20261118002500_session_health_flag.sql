-- Owner decision (18 Nov 2026): the instructor of a 1-to-1 can see whether the member has told BAYSE about a
-- health condition (yes/no only, never the answers), so they can ask about it before the session.
drop function if exists public.session_people(uuid);
create function public.session_people(p_id uuid)
returns table (member_name text, instructor_name text, health_flag boolean)
language sql stable security definer set search_path to '' as $$
  select coalesce(p.display_name, p.first_name, 'Member'), i.display_name,
    coalesce((select h.any_yes from public.health_declarations h where h.user_id = s.member_id and h.expires_at > now() order by h.created_at desc limit 1), false)
  from public.private_sessions s join public.profiles p on p.id = s.member_id join public.instructors i on i.id = s.instructor_id
  where s.id = p_id and (s.member_id = auth.uid() or s.instructor_id = public.my_instructor_id() or public.is_admin());
$$;
revoke all on function public.session_people(uuid) from public, anon;
grant execute on function public.session_people(uuid) to authenticated;
