-- BAYSE Live · Phase 1 · Onboarding, preferences, consent, sensitive data, programmes, flags
-- Ordinary preferences and special-category data live in separate tables.
-- Special-category tables (wellness, dietary needs) are readable by their owner only:
-- not admins, not coaches, unless the member later shares with a named coach.

-- Onboarding (non-sensitive answers) -------------------------------------------
create table public.onboarding_answers (
  user_id              uuid primary key references public.profiles (id) on delete cascade,
  current_step         text,
  goals                text[] not null default '{}',
  experience           text check (experience in ('new', 'beginner', 'intermediate', 'advanced')),
  preferred_training   text[] not null default '{}',
  equipment            text[] not null default '{}',
  sessions_per_week    int check (sessions_per_week between 1 and 7),
  session_length       text check (session_length in ('10-15', '20-30', '30-45', '45-60', 'flexible')),
  coaching_style       text[] not null default '{}',
  community_interests  text[] not null default '{}',
  completed_at         timestamptz,
  updated_at           timestamptz not null default now()
);
create trigger onboarding_updated before update on public.onboarding_answers
  for each row execute function public.set_updated_at();

-- Nutrition preferences (not health data: allergies live in dietary_needs) ------
create table public.nutrition_preferences (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  goals            text[] not null default '{}',
  dietary_pattern  text check (char_length(dietary_pattern) <= 40),
  foods_to_avoid   text[] not null default '{}',
  budget           text check (budget in ('tight', 'moderate', 'flexible')),
  household_size   int check (household_size between 1 and 12),
  cooking_time     text check (cooking_time in ('15', '30', '45', '60+')),
  updated_at       timestamptz not null default now()
);
create trigger nutrition_prefs_updated before update on public.nutrition_preferences
  for each row execute function public.set_updated_at();

-- Consent records: append-only. Withdrawing = a new row with granted = false. ----
create table public.consent_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  purpose     text not null check (purpose in (
                'wellness_data', 'dietary_needs', 'health_screening',
                'share_wellness_with_coach', 'marketing_email', 'celebrations')),
  version     text not null,
  granted     boolean not null,
  created_at  timestamptz not null default now()
);
create index consent_user_purpose_idx on public.consent_records (user_id, purpose, created_at desc);

create or replace function public.has_consent(p_user uuid, p_purpose text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((
    select c.granted from public.consent_records c
     where c.user_id = p_user and c.purpose = p_purpose
     order by c.created_at desc, c.id desc
     limit 1), false);
$$;

-- Special category: women's wellness interests ---------------------------------
create table public.wellness_preferences (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  interests   text[] not null default '{}' check (interests <@ array[
                'general', 'stress_sleep', 'menstrual_health', 'perimenopause', 'menopause',
                'pregnancy_postpartum', 'mobility_recovery']::text[]),
  updated_at  timestamptz not null default now()
);
create trigger wellness_prefs_updated before update on public.wellness_preferences
  for each row execute function public.set_updated_at();

-- Special category: allergies and intolerances --------------------------------
create table public.dietary_needs (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  allergies      text[] not null default '{}',
  intolerances   text[] not null default '{}',
  updated_at     timestamptz not null default now()
);
create trigger dietary_needs_updated before update on public.dietary_needs
  for each row execute function public.set_updated_at();

-- No special-category row can be written without current explicit consent.
create or replace function public.require_consent()
returns trigger language plpgsql security definer set search_path = '' as $$
declare purpose text := tg_argv[0];
begin
  if not public.has_consent(new.user_id, purpose) then
    raise exception 'consent required for %', purpose using errcode = '42501';
  end if;
  return new;
end $$;
create trigger wellness_prefs_consent before insert or update on public.wellness_preferences
  for each row execute function public.require_consent('wellness_data');
create trigger dietary_needs_consent before insert or update on public.dietary_needs
  for each row execute function public.require_consent('dietary_needs');

-- Withdrawing consent deletes the data it covered.
create or replace function public.consent_withdrawn()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not new.granted then
    if new.purpose = 'wellness_data' then
      delete from public.wellness_preferences where user_id = new.user_id;
    elsif new.purpose = 'dietary_needs' then
      delete from public.dietary_needs where user_id = new.user_id;
    end if;
  end if;
  return null;
end $$;
create trigger consent_withdrawn after insert on public.consent_records
  for each row execute function public.consent_withdrawn();

-- Programmes catalogue + recommendation ------------------------------------------
create table public.programmes (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique check (key ~ '^[a-z_]+$'),
  name          text not null,
  summary       text not null,
  level         text not null check (level in ('new', 'beginner', 'intermediate', 'advanced', 'all')),
  focus         text[] not null default '{}',
  needs_equipment text[] not null default '{}',
  weeks_options int[] not null default '{4,6,8}',
  published     boolean not null default false,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger programmes_updated before update on public.programmes
  for each row execute function public.set_updated_at();

create table public.programme_recommendations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  programme_id   uuid not null references public.programmes (id) on delete cascade,
  weeks          int not null check (weeks in (4, 6, 8, 12)),
  sessions_per_week int not null check (sessions_per_week between 1 and 7),
  reasons        text[] not null default '{}',
  engine_version text not null,
  accepted_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index programme_recs_user_idx on public.programme_recommendations (user_id, created_at desc);

-- Feature flags -------------------------------------------------------------------
create table public.feature_flags (
  key          text primary key check (key ~ '^[a-z_]+$'),
  enabled      boolean not null default false,
  description  text,
  updated_at   timestamptz not null default now()
);
create trigger feature_flags_updated before update on public.feature_flags
  for each row execute function public.set_updated_at();
create trigger feature_flags_audit after insert or update or delete on public.feature_flags
  for each row execute function public.audit_row_change();

-- Data rights: a member can download everything held about them. ------------------
create or replace function public.export_my_data()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'roles', (select coalesce(jsonb_agg(to_jsonb(r)), '[]') from public.user_roles r where r.user_id = auth.uid()),
    'onboarding', (select to_jsonb(o) from public.onboarding_answers o where o.user_id = auth.uid()),
    'nutrition_preferences', (select to_jsonb(n) from public.nutrition_preferences n where n.user_id = auth.uid()),
    'wellness_preferences', (select to_jsonb(w) from public.wellness_preferences w where w.user_id = auth.uid()),
    'dietary_needs', (select to_jsonb(d) from public.dietary_needs d where d.user_id = auth.uid()),
    'consents', (select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at), '[]') from public.consent_records c where c.user_id = auth.uid()),
    'studio_memberships', (select coalesce(jsonb_agg(to_jsonb(m)), '[]') from public.studio_memberships m where m.user_id = auth.uid()),
    'subscriptions', (select coalesce(jsonb_agg(to_jsonb(s)), '[]') from public.subscriptions s where s.user_id = auth.uid()),
    'entitlements', (select coalesce(jsonb_agg(to_jsonb(e)), '[]') from public.entitlements e where e.user_id = auth.uid()),
    'programme_recommendations', (select coalesce(jsonb_agg(to_jsonb(pr)), '[]') from public.programme_recommendations pr where pr.user_id = auth.uid())
  );
$$;

-- RLS ---------------------------------------------------------------------------
alter table public.onboarding_answers         enable row level security;
alter table public.nutrition_preferences      enable row level security;
alter table public.consent_records            enable row level security;
alter table public.wellness_preferences       enable row level security;
alter table public.dietary_needs              enable row level security;
alter table public.programmes                 enable row level security;
alter table public.programme_recommendations  enable row level security;
alter table public.feature_flags              enable row level security;

-- Ordinary preferences: owner reads and writes; admins read (support).
create policy onboarding_own on public.onboarding_answers for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy onboarding_admin_read on public.onboarding_answers for select to authenticated
  using (public.is_admin());

create policy nutrition_prefs_own on public.nutrition_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy nutrition_prefs_admin_read on public.nutrition_preferences for select to authenticated
  using (public.is_admin());

-- Consent: owner inserts and reads; nobody edits or deletes. Admins read for compliance.
create policy consent_insert_own on public.consent_records for insert to authenticated
  with check (user_id = auth.uid());
create policy consent_read on public.consent_records for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Special category: owner only. No admin policy on purpose.
create policy wellness_own on public.wellness_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy dietary_needs_own on public.dietary_needs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Programmes: published ones are public; admins manage.
create policy programmes_read on public.programmes for select to anon, authenticated
  using (published or public.is_admin());
create policy programmes_admin on public.programmes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Recommendations: written by the server; member reads and accepts their own.
create policy programme_recs_read on public.programme_recommendations for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy programme_recs_accept on public.programme_recommendations for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Flags: signed-in users read (to show or hide features); admins write.
create policy flags_read on public.feature_flags for select to authenticated using (true);
create policy flags_admin on public.feature_flags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Members can only change accepted_at on a recommendation.
revoke update on public.programme_recommendations from authenticated;
grant update (accepted_at) on public.programme_recommendations to authenticated;
