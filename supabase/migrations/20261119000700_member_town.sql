-- The BAYSE Club is for members anywhere in the UK, not only near a studio. A member can add their town
-- or city (optional) so others nearby can find them: a walking group in Birmingham, a coffee in Leeds.
-- The town is only ever shown to other members when "Let other members find me" is switched on.
alter table public.discovery_prefs add column if not exists town text check (char_length(town) between 2 and 60);

drop function if exists public.suggest_members();
create function public.suggest_members()
returns table (id uuid, display_name text, shared text[], near boolean)
language sql stable security definer set search_path = '' as $$
  with mine as (
    select coalesce(interests, '{}') i, nullif(lower(btrim(town)), '') t from public.discovery_prefs where user_id = auth.uid()
  )
  select p.id, p.display_name,
         array(select unnest(d.interests) intersect select unnest((select i from mine))),
         coalesce(lower(btrim(d.town)) = (select t from mine), false)
    from public.profiles p
    join public.discovery_prefs d on d.user_id = p.id and d.discoverable
   where public.can_participate() and p.id <> auth.uid() and p.display_name is not null
     and (d.interests && (select i from mine) or lower(btrim(d.town)) = (select t from mine))
     and not public.is_blocked_between(p.id)
   order by coalesce(lower(btrim(d.town)) = (select t from mine), false) desc,
            cardinality(array(select unnest(d.interests) intersect select unnest((select i from mine)))) desc, p.display_name
   limit 30;
$$;
revoke all on function public.suggest_members() from public, anon;
grant execute on function public.suggest_members() to authenticated;
