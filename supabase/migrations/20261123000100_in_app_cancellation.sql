-- Members cancel inside the app. The date a membership will end is stored so the app can show it,
-- and a cancellation the payment system could not apply straight away is kept for BAYSE to finish by hand.
alter table public.subscriptions add column if not exists cancel_at timestamptz;

create table if not exists public.cancellation_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  stripe_subscription_id text not null,
  requested_at  timestamptz not null default now(),
  ends_at       timestamptz,
  final_payment boolean not null default false,
  status        text not null default 'pending' check (status in ('pending', 'done')),
  done_by       uuid references public.profiles (id) on delete set null,
  done_at       timestamptz
);
create unique index if not exists cancellation_requests_open on public.cancellation_requests (stripe_subscription_id) where status = 'pending';
alter table public.cancellation_requests enable row level security;
create policy cancellation_requests_read on public.cancellation_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy cancellation_requests_admin on public.cancellation_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
