-- TEMPORARY (18 Nov 2026): the "Test mode · skip payment" button on the membership screen.
-- While the test_mode flag is on, a signed-in account can give ITSELF every entitlement for 7 days,
-- with no card and no payment. Switch the flag off in Admin → Feature flags before real members are invited.
insert into public.feature_flags (key, enabled, description) values
  ('test_mode', true, 'TEMPORARY: shows "Test mode · skip payment" on the membership screen. Anyone can skip paying while this is on.')
on conflict (key) do nothing;

create or replace function public.start_test_access()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  until_ts timestamptz := now() + interval '7 days';
begin
  if me is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then return false; end if;
  if not exists (select 1 from public.feature_flags f where f.key = 'test_mode' and f.enabled) then return false; end if;
  -- Renew earlier test access. Access BAYSE gave by hand with no end date is left alone.
  update public.entitlements e set ends_at = until_ts
    where e.user_id = me and e.source = 'manual' and e.source_id is null and e.ends_at is not null;
  insert into public.entitlements (user_id, entitlement_key, source, ends_at)
  select me, k.key, 'manual', until_ts from public.entitlement_keys k
    where not exists (select 1 from public.entitlements e where e.user_id = me and e.entitlement_key = k.key and e.source = 'manual' and e.source_id is null);
  return true;
end;
$$;
revoke all on function public.start_test_access() from public, anon;
grant execute on function public.start_test_access() to authenticated;
