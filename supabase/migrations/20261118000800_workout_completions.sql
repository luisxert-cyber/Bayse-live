-- Guided timer workouts a member has finished. Feeds weekly progress on Today.
create table public.workout_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  workout_key  text not null check (workout_key ~ '^[a-z0-9-]{2,40}$'),
  minutes      int  not null check (minutes between 1 and 120),
  completed_at timestamptz not null default now()
);
create index workout_completions_user_idx on public.workout_completions (user_id, completed_at desc);
alter table public.workout_completions enable row level security;
create policy wc_own_read on public.workout_completions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy wc_own_insert on public.workout_completions for insert to authenticated with check (user_id = auth.uid());
create policy wc_own_delete on public.workout_completions for delete to authenticated using (user_id = auth.uid());
