-- BAYSE Live · Community starter content. Real, honest starting points so the community never feels empty:
-- pinned notes and prompts from the BAYSE team, and official Circles members can join.
-- No invented members or posts.

create table if not exists public.community_pins (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  label       text not null check (char_length(label) between 2 and 40),     -- e.g. "From the BAYSE team", "This week"
  title       text not null check (char_length(title) between 2 and 120),
  body        text not null check (char_length(body) between 2 and 1500),
  position    int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists community_pins_group_idx on public.community_pins (group_id, position);
alter table public.community_pins enable row level security;
drop policy if exists pins_read on public.community_pins;
create policy pins_read on public.community_pins for select to authenticated
  using (active and (public.can_participate() or public.is_moderator()));
drop policy if exists pins_admin on public.community_pins;
create policy pins_admin on public.community_pins for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Which of these people are BAYSE staff (shown as a "BAYSE team" badge). Nothing else is revealed.
create or replace function public.staff_ids(p_ids uuid[])
returns setof uuid language sql stable security definer set search_path = '' as $$
  select distinct ur.user_id from public.user_roles ur
   where public.can_participate() and ur.user_id = any (p_ids)
     and ur.role in ('instructor', 'moderator', 'admin', 'super_admin');
$$;
grant execute on function public.staff_ids(uuid[]) to authenticated;

-- Pinned notes
insert into public.community_pins (group_id, label, title, body, position)
select g.id, p.label, p.title, p.body, p.position
  from public.groups g
  join (values
    ('bayse-global', 'From the BAYSE team', 'Welcome to the BAYSE community',
     'This is your space to share wins, ask questions and cheer each other on. Introduce yourself below, join a Circle that fits your week, and look out for padel games, walks and socials in Clubs. Be kind, keep meet-ups to public places, and never share anyone else''s health details.', 0),
    ('bayse-global', 'This week', 'Share your win',
     'Big or small: your first plank hold, three classes in a week, or just showing up on a tired day. Post it and give someone else a clap.', 1),
    ('new-to-bayse', 'Start here', 'Introduce yourself',
     'Tell us your first name, where you are, and what brought you to Pilates. Not sure where to begin? Try the free Wake-up Flow, then follow the Pilates Foundations plan.', 0),
    ('new-to-bayse', 'Ask anything', 'No question is too small',
     'Which class should I start with? What does "neutral spine" mean? Ask here and our instructors and members will help.', 1),
    ('nutrition-healthy-habits', 'Recipe swap', 'Your go-to quick breakfast',
     'Share a breakfast you actually make on busy mornings: what''s in it and how long it takes. No crash diets, no calorie shaming.', 0)
  ) as p(slug, label, title, body, position) on p.slug = g.slug
 where not exists (select 1 from public.community_pins x where x.group_id = g.id and x.title = p.title);

-- Official Circles: open groups anyone with community access can join.
insert into public.groups (kind, slug, name, description, max_members)
select 'circle', c.slug, c.name, c.description, 20
  from (values
    ('circle-early-birds', 'Early Birds', 'For anyone who trains before work: the 7am live classes and quick morning sessions. Share your morning wins and keep each other getting up.'),
    ('circle-beginners-together', 'Beginners Together', 'New to Pilates or coming back after a break? Learn the basics together, ask the "silly" questions and celebrate the firsts.'),
    ('circle-lunchtime-movers', 'Lunchtime Movers', 'Short sessions in the middle of the working day. Swap your favourite 10 and 15-minute classes.'),
    ('circle-evening-unwind', 'Evening Unwind', 'Stretch, slow flow and the 7pm live classes. A calm way to end the day, together.'),
    ('circle-strong-and-sculpt', 'Strong & Sculpt Squad', 'Building strength with weights and bands. Share progress, form tips and your favourite sculpt classes.'),
    ('circle-mums-on-the-move', 'Mums on the Move', 'Fitting Pilates around family life. Short sessions, flexible times and people who get it. Check with your doctor first if you are postnatal.')
  ) as c(slug, name, description)
 where not exists (select 1 from public.groups g where g.slug = c.slug);

-- Circles list now says which Circles are official BAYSE ones.
drop function if exists public.list_circles();
create function public.list_circles()
returns table (id uuid, name text, description text, max_members int, member_count int, is_member boolean, official boolean)
language sql stable security definer set search_path = '' as $$
  select g.id, g.name, g.description, g.max_members,
         (select count(*)::int from public.group_members m where m.group_id = g.id),
         exists (select 1 from public.group_members m where m.group_id = g.id and m.user_id = auth.uid()),
         g.created_by is null
    from public.groups g
   where public.can_participate() and g.kind = 'circle' and not g.archived
   order by 6 desc, 7 desc, g.created_at desc
   limit 200;
$$;
grant execute on function public.list_circles() to authenticated;
