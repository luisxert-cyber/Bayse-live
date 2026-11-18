-- BAYSE Live · Nourish, Rewards and Together.
-- Daily and Progress are worked out from workout_completions (no new tables).

-- Nourish: saved recipes, a shopping list and private recipe filters. Only the member can see their own.
create table if not exists public.nourish_saved (
  user_id    uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  recipe_key text not null check (recipe_key ~ '^[a-z0-9-]{2,60}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_key)
);
create table if not exists public.shopping_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  item       text not null check (char_length(item) between 1 and 120),
  recipe_key text check (recipe_key ~ '^[a-z0-9-]{2,60}$'),
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shopping_items_user_idx on public.shopping_items (user_id, done, created_at);
-- "Hide recipes containing…" filters. Private to the member (can describe allergies), never shown to staff.
create table if not exists public.nourish_filters (
  user_id        uuid primary key references public.profiles (id) on delete cascade default auth.uid(),
  hide_allergens text[] not null default '{}' check (hide_allergens <@ array['gluten','dairy','egg','nuts','peanuts','fish','shellfish','soy','sesame']::text[]),
  updated_at     timestamptz not null default now()
);
alter table public.nourish_saved enable row level security;
alter table public.shopping_items enable row level security;
alter table public.nourish_filters enable row level security;
drop policy if exists nourish_saved_own on public.nourish_saved;
create policy nourish_saved_own on public.nourish_saved for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists shopping_own on public.shopping_items;
create policy shopping_own on public.shopping_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and (select count(*) from public.shopping_items s where s.user_id = auth.uid()) < 300);
drop policy if exists nourish_filters_own on public.nourish_filters;
create policy nourish_filters_own on public.nourish_filters for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Rewards: offers set up by BAYSE admins, unlocked by finishing classes. Cost control: every offer has a
-- claim limit and dates, and the code is only revealed by the server once a member qualifies.
create table if not exists public.reward_offers (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 2 and 80),
  description  text not null check (char_length(description) between 2 and 500),
  partner      text check (char_length(partner) <= 80),
  min_classes  int not null default 10 check (min_classes between 1 and 1000),
  code         text check (char_length(code) <= 80),          -- never readable by members directly
  how_to_use   text check (char_length(how_to_use) <= 300),
  max_claims   int not null default 50 check (max_claims between 1 and 100000),
  active       boolean not null default false,
  starts_at    timestamptz not null default now(),
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);
create table if not exists public.reward_claims (
  offer_id   uuid not null references public.reward_offers (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (offer_id, user_id)
);
alter table public.reward_offers enable row level security;
alter table public.reward_claims enable row level security;
drop policy if exists offers_admin on public.reward_offers;
create policy offers_admin on public.reward_offers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists claims_read on public.reward_claims;
create policy claims_read on public.reward_claims for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- What a member sees: live offers, how many classes they need, whether claimed and places left. No codes.
create or replace function public.my_rewards()
returns table (id uuid, title text, description text, partner text, min_classes int, claimed boolean, places_left int, my_classes int)
language sql stable security definer set search_path = '' as $$
  with me as (select count(*)::int n from public.workout_completions where user_id = auth.uid())
  select o.id, o.title, o.description, o.partner, o.min_classes,
         exists (select 1 from public.reward_claims c where c.offer_id = o.id and c.user_id = auth.uid()),
         greatest(o.max_claims - (select count(*)::int from public.reward_claims c where c.offer_id = o.id), 0),
         (select n from me)
    from public.reward_offers o
   where auth.uid() is not null and o.active and o.starts_at <= now() and (o.ends_at is null or o.ends_at > now())
   order by o.min_classes;
$$;
grant execute on function public.my_rewards() to authenticated;

-- Claim: checked on the server (enough classes, places left, not already claimed). Returns the code.
create or replace function public.claim_reward(p_offer uuid)
returns table (code text, how_to_use text) language plpgsql security definer set search_path = '' as $$
declare o public.reward_offers%rowtype; n int;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'Sign in to claim rewards' using errcode = '42501'; end if;
  select * into o from public.reward_offers where id = p_offer for update;
  if not found or not o.active or o.starts_at > now() or (o.ends_at is not null and o.ends_at <= now()) then raise exception 'This reward is not available' using errcode = '22023'; end if;
  if not exists (select 1 from public.reward_claims where offer_id = p_offer and user_id = auth.uid()) then
    select count(*) into n from public.workout_completions where user_id = auth.uid();
    if n < o.min_classes then raise exception 'Finish % classes to unlock this reward', o.min_classes using errcode = '22023'; end if;
    if (select count(*) from public.reward_claims where offer_id = p_offer) >= o.max_claims then raise exception 'All of these rewards have been claimed' using errcode = '22023'; end if;
    insert into public.reward_claims (offer_id, user_id) values (p_offer, auth.uid());
  end if;
  return query select o.code, o.how_to_use;
end $$;
grant execute on function public.claim_reward(uuid) to authenticated;

-- Together: members who chose to be findable and share at least one interest with you. Names and shared
-- interests only. Nobody appears unless they switched "Let other members find me" on.
create or replace function public.suggest_members()
returns table (id uuid, display_name text, shared text[])
language sql stable security definer set search_path = '' as $$
  with mine as (select coalesce(interests, '{}') i from public.discovery_prefs where user_id = auth.uid())
  select p.id, p.display_name, array(select unnest(d.interests) intersect select unnest((select i from mine)))
    from public.profiles p
    join public.discovery_prefs d on d.user_id = p.id and d.discoverable
   where public.can_participate() and p.id <> auth.uid() and p.display_name is not null
     and d.interests && (select i from mine)
     and not public.is_blocked_between(p.id)
   order by cardinality(array(select unnest(d.interests) intersect select unnest((select i from mine)))) desc, p.display_name
   limit 30;
$$;
grant execute on function public.suggest_members() to authenticated;
