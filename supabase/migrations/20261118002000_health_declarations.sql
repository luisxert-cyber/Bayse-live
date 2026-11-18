-- Health check (PAR-Q) and health and safety agreement. Health answers are special-category data:
-- stored only with explicit consent, visible to the member and BAYSE admins only (never instructors or other members).
create table public.health_declarations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  parq_version       text not null,
  answers            jsonb not null,
  any_yes            boolean not null,
  clearance_confirmed boolean not null default false,
  agreement_version  text not null,
  signed_name        text not null check (char_length(btrim(signed_name)) between 2 and 100),
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null default now() + interval '12 months',
  check (not any_yes or clearance_confirmed)
);
create index health_declarations_user on public.health_declarations (user_id, created_at desc);
alter table public.health_declarations enable row level security;
create policy health_own_read on public.health_declarations for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy health_own_insert on public.health_declarations for insert to authenticated
  with check (user_id = auth.uid() and public.has_consent(auth.uid(), 'health_screening'));
-- No updates or deletes from the app: each confirmation is a new, dated record (deleting the account removes them).

create or replace function public.has_health_declaration(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.health_declarations h where h.user_id = p_user and h.expires_at > now()
    and (p_user = auth.uid() or public.is_admin()));
$$;
revoke all on function public.has_health_declaration(uuid) from public, anon;
grant execute on function public.has_health_declaration(uuid) to authenticated;
