-- BAYSE Black coaching (master brief): each Black member has a named instructor ("coach").
--  * Priority Q&A: the member asks, the coach replies (aim: within 2 working days).
--  * Progress review: once per paid 28-day period the member sends a short review; the coach replies with feedback
--    and the focus for the next period (personalised programming notes).
-- Support is deliberately bounded so it stays sustainable: messages, one review per period, and the included 1-to-1.
create table public.black_coaches (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id),
  assigned_by   uuid references public.profiles (id) default auth.uid(),
  assigned_at   timestamptz not null default now()
);
alter table public.black_coaches enable row level security;
create policy black_coaches_read on public.black_coaches for select to authenticated
  using (user_id = auth.uid() or instructor_id = public.my_instructor_id() or public.is_admin());
create policy black_coaches_admin on public.black_coaches for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.coaching_messages (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  kind        text not null check (kind in ('question', 'reply', 'review', 'feedback')),
  body        text not null check (char_length(btrim(body)) between 1 and 2000),
  focus       text check (char_length(focus) <= 600),            -- coach feedback: the focus for the next period
  rating      int check (rating between 1 and 5),                -- member review: how the period went
  created_at  timestamptz not null default now()
);
create index coaching_messages_member on public.coaching_messages (member_id, created_at);
alter table public.coaching_messages enable row level security;

create or replace function public.is_my_black_member(p_member uuid) returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.black_coaches b where b.user_id = p_member and b.instructor_id = public.my_instructor_id());
$$;
grant execute on function public.is_my_black_member(uuid) to authenticated;

create policy coaching_read on public.coaching_messages for select to authenticated
  using (member_id = auth.uid() or public.is_my_black_member(member_id) or public.is_admin());
-- Members ask questions and send reviews while they have Black; coaches (and admins) reply and give feedback.
create policy coaching_member_write on public.coaching_messages for insert to authenticated
  with check (member_id = auth.uid() and author_id = auth.uid() and kind in ('question', 'review')
    and public.has_entitlement('individual_coaching') and (kind <> 'review' or rating is not null));
create policy coaching_coach_write on public.coaching_messages for insert to authenticated
  with check (author_id = auth.uid() and kind in ('reply', 'feedback') and (public.is_my_black_member(member_id) or public.is_admin()));

-- Instructor/admin view: Black members with their latest activity and whether they are waiting for a reply.
create or replace function public.black_members()
returns table (user_id uuid, name text, instructor_id uuid, instructor_name text, last_at timestamptz, waiting boolean, waiting_since timestamptz, reviews int)
language sql stable security definer set search_path to '' as $$
  with members as (
    select distinct e.user_id from public.entitlements e
    where e.entitlement_key = 'individual_coaching' and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  ),
  last as (
    select m.member_id, max(m.created_at) as last_at,
      (array_agg(m.kind order by m.created_at desc))[1] as last_kind,
      max(m.created_at) filter (where m.kind in ('question', 'review')) as last_member_at,
      max(m.created_at) filter (where m.kind in ('reply', 'feedback')) as last_coach_at,
      count(*) filter (where m.kind = 'review')::int as reviews
    from public.coaching_messages m group by m.member_id
  )
  select mb.user_id, coalesce(p.display_name, p.first_name, p.email), b.instructor_id, i.display_name, l.last_at,
    coalesce(l.last_kind in ('question', 'review'), false),
    case when l.last_kind in ('question', 'review') then l.last_member_at end,
    coalesce(l.reviews, 0)
  from members mb join public.profiles p on p.id = mb.user_id
  left join public.black_coaches b on b.user_id = mb.user_id
  left join public.instructors i on i.id = b.instructor_id
  left join last l on l.member_id = mb.user_id
  where public.is_admin() or b.instructor_id = public.my_instructor_id()
  order by 6 desc, 7 nulls last, 2;
$$;
revoke all on function public.black_members() from public, anon;
grant execute on function public.black_members() to authenticated;
