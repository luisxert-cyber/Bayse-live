-- Master brief (19 Nov 2026), owner decisions: adopt the 27-class week. The 17 classes running now move to the
-- nearest planned slot and stay LIVE (07:00 -> 06:00, 09/12/19 unchanged, weekends 09:00 -> 10:00); the other 10 are
-- COMING SOON: visible, not bookable, no Zoom, not paid, with "Notify me". Every live group class is 40 minutes
-- (5 warm-up, 30 main, 5 cool-down). Rows are updated in place so bookings, instructors and Zoom links stay attached.

alter table public.live_classes add column if not exists status text not null default 'live' check (status in ('live', 'coming_soon'));
alter table public.live_classes add column if not exists level text check (level in ('All levels', 'Beginner', 'Intermediate', 'Advanced', 'Gentle', 'Specialist'));
alter table public.live_classes add column if not exists equipment text not null default 'mat' check (equipment in ('none', 'mat', 'optional', 'required'));
alter table public.live_classes add column if not exists equipment_detail text check (char_length(equipment_detail) <= 120);
alter table public.live_classes add column if not exists class_type text check (class_type in ('Pilates', 'Strength', 'Mobility', 'Beginner', '50+', 'Prenatal', 'Postnatal'));
alter table public.live_classes add column if not exists description text check (char_length(description) <= 400);
alter table public.live_classes add column if not exists activated_at timestamptz;

-- The weekly slot index must not let a coming-soon class and a live class share a slot either (it already covers all active weekly rows).

create temporary table plan (weekday int, old_time time, new_time time, name text, level text, equipment text, detail text, class_type text, status text, description text) on commit drop;
insert into plan values
  (1, '07:00', '06:00', 'Morning Energise',        'All levels',   'none',     null, 'Mobility',  'live', 'Wake the body up: breathing, mobility and light flowing Pilates to start the week.'),
  (1, '09:00', '09:00', 'Full Body Pilates',       'All levels',   'mat',      null, 'Pilates',   'live', 'Classic mat Pilates for the whole body: core, legs, back and arms.'),
  (1, null,    '12:00', 'Pilates Sculpt',          'Intermediate', 'optional', 'Mat. Light dumbbells or a band optional', 'Strength', 'coming_soon', 'Pilates with added resistance for tone and definition.'),
  (1, null,    '15:00', 'Gentle Pilates 50+',      'Gentle',       'mat',      null, '50+',       'coming_soon', 'Strength, balance and posture at a gentle pace, for women 50 and over.'),
  (1, '19:00', '19:00', 'Strength & Sculpt',       'Intermediate', 'required', 'Mat + light 1–2 kg dumbbells', 'Strength', 'live', 'Pilates-based strength work with light weights for full-body tone.'),
  (2, '07:00', '06:00', 'Wake Up & Stretch',       'All levels',   'none',     null, 'Mobility',  'live', 'An easy start: stretching, mobility and breath to loosen up.'),
  (2, null,    '09:00', 'Beginner Pilates',        'Beginner',     'mat',      null, 'Beginner',  'coming_soon', 'The foundations of Pilates, step by step, with plenty of options.'),
  (2, '12:00', '12:00', 'Core & Glutes',           'All levels',   'optional', 'Mat. A band optional', 'Pilates', 'live', 'Focused work for a strong centre and strong glutes.'),
  (2, null,    '15:00', 'Postnatal Pilates',       'Specialist',   'mat',      null, 'Postnatal', 'coming_soon', 'Gentle, progressive rebuilding after birth. Check with your GP or midwife before starting.'),
  (2, '19:00', '19:00', 'Power Pilates',           'Advanced',     'mat',      null, 'Pilates',   'live', 'A dynamic, challenging mat class for experienced members.'),
  (3, '07:00', '06:00', 'Morning Core',            'All levels',   'mat',      null, 'Pilates',   'live', 'Deep core work to switch on your centre for the day.'),
  (3, '09:00', '09:00', 'Pilates Flow',            'All levels',   'mat',      null, 'Pilates',   'live', 'Smooth, flowing mat Pilates linking movement and breath.'),
  (3, null,    '12:00', 'Strength & Tone',         'Intermediate', 'required', 'Mat + light 1–2 kg dumbbells', 'Strength', 'coming_soon', 'Lunchtime strength and toning with light weights.'),
  (3, null,    '15:00', 'Healthy Ageing Pilates',  'Gentle',       'mat',      null, '50+',       'coming_soon', 'Mobility, balance and bone-friendly strength for healthy ageing.'),
  (3, '19:00', '19:00', 'Deep Stretch & Mobility', 'All levels',   'none',     null, 'Mobility',  'live', 'Slow, deep stretching to release tension and improve range of movement.'),
  (4, '07:00', '06:00', 'Express Sculpt',          'All levels',   'optional', 'Mat. Light dumbbells optional', 'Strength', 'live', 'A quick, effective sculpt to start the day.'),
  (4, null,    '09:00', 'Full Body Pilates',       'All levels',   'mat',      null, 'Pilates',   'coming_soon', 'Classic mat Pilates for the whole body.'),
  (4, '12:00', '12:00', 'Waist, Core & Posture',   'All levels',   'mat',      null, 'Pilates',   'live', 'Core strength and posture work to help you stand taller.'),
  (4, null,    '15:00', 'Prenatal Pilates',        'Specialist',   'mat',      null, 'Prenatal',  'coming_soon', 'Safe, adapted Pilates for pregnancy. Check with your GP or midwife before starting.'),
  (4, '19:00', '19:00', 'Pilates Strength',        'Intermediate', 'required', 'Mat + light 1–2 kg dumbbells', 'Strength', 'live', 'Strength-focused Pilates with light weights.'),
  (5, '07:00', '06:00', 'Morning Mobility',        'All levels',   'none',     null, 'Mobility',  'live', 'Joint-friendly mobility to ease into the day.'),
  (5, '09:00', '09:00', 'Feel-Good Pilates',       'All levels',   'mat',      null, 'Pilates',   'live', 'An uplifting mat class to finish the working week.'),
  (5, null,    '12:00', 'Full Body Sculpt',        'Intermediate', 'optional', 'Mat. Light dumbbells or a band optional', 'Strength', 'coming_soon', 'Full-body sculpting with optional light resistance.'),
  (5, null,    '15:00', 'Balance & Mobility 50+',  'Gentle',       'mat',      null, '50+',       'coming_soon', 'Balance, steadiness and mobility for women 50 and over.'),
  (5, '19:00', '19:00', 'Reset & Restore',         'Gentle',       'none',     null, 'Mobility',  'live', 'Gentle, restorative movement and relaxation to unwind.'),
  (6, '09:00', '10:00', 'Weekend Full Body Burn',  'All levels',   'required', 'Mat + light 1–2 kg dumbbells', 'Strength', 'live', 'An energising full-body weekend class with light weights.'),
  (7, '09:00', '10:00', 'Sunday Pilates & Stretch', 'All levels',  'mat',      null, 'Pilates',   'live', 'Mat Pilates and a long stretch to set you up for the week.');

-- 1. Move and rename the 17 running classes (same rows, so bookings, instructors, Zoom links and pay history stay attached).
--    Moved classes are updated in two steps so the slot index never sees two classes in one slot.
update public.live_classes c set starts_at = c.starts_at + interval '1 minute'
  from plan p where p.old_time is not null and c.weekday = p.weekday and c.starts_at = p.old_time and c.one_off_date is null and c.active;
update public.live_classes c set starts_at = p.new_time, name = p.name, minutes = 40, level = p.level, equipment = p.equipment,
    equipment_detail = p.detail, class_type = p.class_type, description = p.description, status = 'live'
  from plan p where p.old_time is not null and c.weekday = p.weekday and c.starts_at = p.old_time + interval '1 minute' and c.one_off_date is null and c.active;

-- 2. Add the 10 coming-soon classes.
insert into public.live_classes (weekday, starts_at, name, minutes, active, level, equipment, equipment_detail, class_type, description, status)
select p.weekday, p.new_time, p.name, 40, true, p.level, p.equipment, p.detail, p.class_type, p.description, 'coming_soon'
from plan p where p.old_time is null
  and not exists (select 1 from public.live_classes c where c.weekday = p.weekday and c.starts_at = p.new_time and c.one_off_date is null and c.active);

-- 3. Coming-soon classes never run: not bookable, not joinable, not in members' schedules, not paid.
create or replace function public.live_class_runs(p_class uuid, p_date date) returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.live_classes c where c.id = p_class and c.active and c.status = 'live'
      and c.weekday = extract(isodow from p_date)::int and (c.one_off_date is null or c.one_off_date = p_date))
    and not exists (select 1 from public.live_class_cancellations x where x.class_id = p_class and x.class_date = p_date);
$$;

do $$
declare d text;
begin
  -- live_schedule and record_live_classes: add "and c.status = 'live'" to their class join.
  select pg_get_functiondef('public.live_schedule(int)'::regprocedure) into d;
  d := replace(d, 'join public.live_classes c on c.active and', 'join public.live_classes c on c.active and c.status = ''live'' and');
  execute d;
  select pg_get_functiondef('public.record_live_classes()'::regprocedure) into d;
  d := replace(d, 'join public.live_classes c on c.active and', 'join public.live_classes c on c.active and c.status = ''live'' and');
  execute d;
end $$;

-- 4. The public timetable (website, no sign-in): what runs, when, level, equipment and confirmed instructors. No Zoom links.
create or replace function public.public_timetable()
returns table (id uuid, weekday int, starts_at time, name text, minutes int, status text, level text, equipment text, equipment_detail text, class_type text, description text, instructors text[])
language sql stable security definer set search_path to '' as $$
  select c.id, c.weekday, c.starts_at, c.name, c.minutes, c.status, c.level, c.equipment, c.equipment_detail, c.class_type, c.description,
    coalesce((select array_agg(i.display_name order by l.lead desc) from public.live_class_instructors l join public.instructors i on i.id = l.instructor_id
              where l.class_id = c.id and i.status = 'published' and i.active), '{}')
  from public.live_classes c
  where c.active and c.one_off_date is null
  order by c.weekday, c.starts_at;
$$;
grant execute on function public.public_timetable() to anon, authenticated;

-- 5. "Notify me when this class launches".
create table public.live_class_interest (
  class_id    uuid not null references public.live_classes (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  created_at  timestamptz not null default now(),
  notified_at timestamptz,
  primary key (class_id, user_id)
);
alter table public.live_class_interest enable row level security;
create policy interest_own_read on public.live_class_interest for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy interest_own_add on public.live_class_interest for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.live_classes c where c.id = class_id and c.status = 'coming_soon' and c.active));
create policy interest_own_remove on public.live_class_interest for delete to authenticated using (user_id = auth.uid());

-- 6. Admin: launch a coming-soon class once it has an instructor and a Zoom link. Interested members get an in-app notice.
create or replace function public.activate_live_class(p_class uuid) returns int
language plpgsql security definer set search_path to '' as $$
declare c record; n int := 0; missing text[] := '{}';
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into c from public.live_classes where id = p_class for update;
  if c.id is null or c.status <> 'coming_soon' then raise exception 'This class is not waiting to launch.'; end if;
  if not exists (select 1 from public.live_class_instructors where class_id = p_class) then missing := missing || 'an instructor'::text; end if;
  if not exists (select 1 from public.live_class_links where class_id = p_class) then missing := missing || 'a Zoom link'::text; end if;
  if c.level is null then missing := missing || 'a level'::text; end if;
  if c.description is null then missing := missing || 'a description'::text; end if;
  if array_length(missing, 1) > 0 then raise exception 'Before launching, add %.', array_to_string(missing, ' and '); end if;
  update public.live_classes set status = 'live', activated_at = now() where id = p_class;
  insert into public.notifications (user_id, kind, payload)
  select i.user_id, 'class_launched', jsonb_build_object('class_id', c.id, 'name', c.name, 'weekday', c.weekday, 'starts_at', to_char(c.starts_at, 'HH24:MI'))
  from public.live_class_interest i where i.class_id = p_class and i.notified_at is null;
  get diagnostics n = row_count;
  update public.live_class_interest set notified_at = now() where class_id = p_class and notified_at is null;
  insert into public.audit_log (actor_id, action, entity, entity_id, detail) values (auth.uid(), 'live_class.activated', 'live_class', p_class::text, jsonb_build_object('notified', n));
  return n;
end $$;
revoke all on function public.activate_live_class(uuid) from public, anon;
grant execute on function public.activate_live_class(uuid) to authenticated;

-- 7. Admin: demand for coming-soon classes, and how many interested members booked after launch.
create or replace function public.class_interest_report()
returns table (class_id uuid, name text, weekday int, starts_at time, status text, interested int, booked_after_launch int)
language sql stable security definer set search_path to '' as $$
  select c.id, c.name, c.weekday, c.starts_at, c.status, count(i.user_id)::int,
    count(i.user_id) filter (where exists (select 1 from public.live_class_bookings b where b.class_id = c.id and b.user_id = i.user_id and b.created_at >= coalesce(c.activated_at, now())))::int
  from public.live_classes c left join public.live_class_interest i on i.class_id = c.id
  where public.is_admin() and c.active and (c.status = 'coming_soon' or c.activated_at is not null)
  group by c.id
  order by 6 desc, c.weekday, c.starts_at;
$$;
revoke all on function public.class_interest_report() from public, anon;
grant execute on function public.class_interest_report() to authenticated;
