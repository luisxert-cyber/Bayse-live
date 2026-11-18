-- BAYSE Live · Phase 1 · Plans, subscriptions, studio links, entitlements
-- Access is decided by public.entitlements. Rows there are written only by
-- recompute_entitlements(), which runs from triggers on subscriptions and
-- studio_memberships. Subscriptions are written only by the server (Stripe webhook,
-- service role). Nothing in the browser can grant access.

create table public.entitlement_keys (
  key          text primary key check (key ~ '^[a-z_]+$'),
  label        text not null,
  description  text
);

create table public.plans (
  id             uuid primary key default gen_random_uuid(),
  key            text not null unique check (key ~ '^[a-z_]+$'),
  name           text not null,
  description    text,
  sort           int not null default 0,
  active         boolean not null default true,
  -- true until Luis approves the price as a real offer
  is_hypothesis  boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger plans_updated before update on public.plans
  for each row execute function public.set_updated_at();

create table public.plan_entitlements (
  plan_id          uuid not null references public.plans (id) on delete cascade,
  entitlement_key  text not null references public.entitlement_keys (key) on delete cascade,
  primary key (plan_id, entitlement_key)
);

create table public.prices (
  id               uuid primary key default gen_random_uuid(),
  plan_id          uuid not null references public.plans (id) on delete cascade,
  stripe_price_id  text unique,
  billing_interval text not null check (billing_interval in ('month', 'year')),
  amount_pence     int not null check (amount_pence >= 0),
  currency         text not null default 'gbp',
  trial_days       int not null default 0 check (trial_days between 0 and 60),
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index prices_plan_idx on public.prices (plan_id);

create table public.stripe_customers (
  user_id             uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id  text not null unique,
  created_at          timestamptz not null default now()
);

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles (id) on delete cascade,
  stripe_subscription_id  text not null unique,
  price_id                uuid references public.prices (id) on delete set null,
  plan_id                 uuid references public.plans (id) on delete set null,
  status                  text not null check (status in (
                            'trialing', 'active', 'past_due', 'unpaid', 'canceled',
                            'incomplete', 'incomplete_expired', 'paused')),
  trial_end               timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create trigger subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Webhook idempotency: one row per Stripe event id.
create table public.stripe_events (
  id            text primary key,
  type          text not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text
);

-- Studio membership links ------------------------------------------------------
-- A member asks to link; a manager of that studio (or an admin) verifies.
create table public.studio_memberships (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  studio_id     uuid not null references public.studios (id) on delete cascade,
  tier          text not null default 'other' check (tier in ('studio_99', 'studio_148', 'other')),
  member_ref    text check (char_length(member_ref) <= 80),
  status        text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'ended')),
  requested_at  timestamptz not null default now(),
  verified_by   uuid references public.profiles (id) on delete set null,
  verified_at   timestamptz,
  updated_at    timestamptz not null default now(),
  unique (user_id, studio_id)
);
create index studio_memberships_studio_idx on public.studio_memberships (studio_id, status);
create trigger studio_memberships_updated before update on public.studio_memberships
  for each row execute function public.set_updated_at();

-- What each studio tier unlocks digitally. Configurable by admins, so no studio
-- member is charged twice for something their studio agreement already includes.
create table public.studio_tier_entitlements (
  tier             text not null check (tier in ('studio_99', 'studio_148', 'other')),
  entitlement_key  text not null references public.entitlement_keys (key) on delete cascade,
  primary key (tier, entitlement_key)
);

-- Stamp verifier and time; members cannot verify themselves.
create or replace function public.studio_memberships_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null and not public.is_admin() and not public.manages_studio(new.studio_id) then
      new.status := 'pending';
      new.verified_by := null;
      new.verified_at := null;
    end if;
  else
    new.user_id := old.user_id;
    new.requested_at := old.requested_at;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'verified' then
      new.verified_by := auth.uid();
      new.verified_at := now();
    end if;
  end if;
  return new;
end $$;
create trigger studio_memberships_guard before insert or update on public.studio_memberships
  for each row execute function public.studio_memberships_guard();

create trigger studio_memberships_audit after insert or update or delete on public.studio_memberships
  for each row execute function public.audit_row_change();

-- Entitlements -----------------------------------------------------------------
create table public.entitlements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  entitlement_key  text not null references public.entitlement_keys (key) on delete cascade,
  source           text not null check (source in ('subscription', 'studio', 'manual')),
  source_id        uuid,
  starts_at        timestamptz not null default now(),
  ends_at          timestamptz,
  created_at       timestamptz not null default now(),
  unique nulls not distinct (user_id, entitlement_key, source, source_id)
);
create index entitlements_user_idx on public.entitlements (user_id, entitlement_key);

create or replace function public.has_entitlement(k text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid() and e.entitlement_key = k
      and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  );
$$;

-- Rebuild the derived (subscription + studio) entitlements for one member.
-- Manual grants are left alone.
create or replace function public.recompute_entitlements(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.entitlements
   where user_id = p_user and source in ('subscription', 'studio');

  insert into public.entitlements (user_id, entitlement_key, source, source_id, ends_at)
  select s.user_id, pe.entitlement_key, 'subscription', s.id,
         case when s.status = 'past_due' then s.current_period_end + interval '7 days'
              else null end
    from public.subscriptions s
    join public.plan_entitlements pe on pe.plan_id = s.plan_id
   where s.user_id = p_user
     and s.status in ('trialing', 'active', 'past_due')
  on conflict do nothing;

  insert into public.entitlements (user_id, entitlement_key, source, source_id)
  select m.user_id, te.entitlement_key, 'studio', m.id
    from public.studio_memberships m
    join public.studio_tier_entitlements te on te.tier = m.tier
   where m.user_id = p_user and m.status = 'verified'
  on conflict do nothing;
end $$;
revoke all on function public.recompute_entitlements(uuid) from public, anon, authenticated;

create or replace function public.entitlements_on_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.recompute_entitlements(old.user_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.user_id is distinct from old.user_id) then
    perform public.recompute_entitlements(new.user_id);
  end if;
  return null;
end $$;

create trigger subscriptions_entitlements after insert or update or delete on public.subscriptions
  for each row execute function public.entitlements_on_change();
create trigger studio_memberships_entitlements after insert or update or delete on public.studio_memberships
  for each row execute function public.entitlements_on_change();

-- When an admin changes what a plan or tier unlocks, rebuild everyone affected.
create or replace function public.entitlements_on_mapping_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare u uuid;
begin
  for u in
    select distinct user_id from public.subscriptions
    union
    select distinct user_id from public.studio_memberships
  loop
    perform public.recompute_entitlements(u);
  end loop;
  return null;
end $$;
create trigger plan_entitlements_changed after insert or update or delete on public.plan_entitlements
  for each statement execute function public.entitlements_on_mapping_change();
create trigger studio_tier_entitlements_changed after insert or update or delete on public.studio_tier_entitlements
  for each statement execute function public.entitlements_on_mapping_change();

-- RLS -------------------------------------------------------------------------
alter table public.entitlement_keys          enable row level security;
alter table public.plans                     enable row level security;
alter table public.plan_entitlements         enable row level security;
alter table public.prices                    enable row level security;
alter table public.stripe_customers          enable row level security;
alter table public.subscriptions             enable row level security;
alter table public.stripe_events             enable row level security;
alter table public.studio_memberships        enable row level security;
alter table public.studio_tier_entitlements  enable row level security;
alter table public.entitlements              enable row level security;

-- Catalogue: public read of active items; admins write.
create policy entitlement_keys_read on public.entitlement_keys for select to anon, authenticated using (true);
create policy entitlement_keys_admin on public.entitlement_keys for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy plans_read on public.plans for select to anon, authenticated using (active or public.is_admin());
create policy plans_admin on public.plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy plan_entitlements_read on public.plan_entitlements for select to anon, authenticated using (true);
create policy plan_entitlements_admin on public.plan_entitlements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy prices_read on public.prices for select to anon, authenticated using (active or public.is_admin());
create policy prices_admin on public.prices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy studio_tier_read on public.studio_tier_entitlements for select to anon, authenticated using (true);
create policy studio_tier_admin on public.studio_tier_entitlements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Billing records: read your own; admins read all; only the server writes.
create policy stripe_customers_read_own on public.stripe_customers for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy subscriptions_read_own on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy stripe_events_admin on public.stripe_events for select to authenticated
  using (public.is_admin());

-- Studio links: request your own (always pending); manager of that studio or admin verifies.
create policy studio_links_read on public.studio_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_admin() or public.manages_studio(studio_id));
create policy studio_links_request on public.studio_memberships for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy studio_links_staff_insert on public.studio_memberships for insert to authenticated
  with check (public.is_admin() or public.manages_studio(studio_id));
create policy studio_links_verify on public.studio_memberships for update to authenticated
  using (public.is_admin() or public.manages_studio(studio_id))
  with check (public.is_admin() or public.manages_studio(studio_id));
create policy studio_links_withdraw on public.studio_memberships for delete to authenticated
  using (user_id = auth.uid() and status = 'pending');

-- Entitlements: read your own; admins read all; nobody writes from the client.
create policy entitlements_read on public.entitlements for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
