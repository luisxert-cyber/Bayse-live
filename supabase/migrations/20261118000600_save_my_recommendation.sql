-- Onboarding saves the member's programme recommendation without needing the service key.
-- The plan engine runs on the server; this function only accepts a published programme and
-- valid numbers, and always writes for the signed-in user. Members still cannot update
-- anything but accepted_at, and cannot write for anyone else.
create or replace function public.save_my_recommendation(
  p_programme uuid, p_weeks int, p_sessions int, p_reasons text[], p_engine text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if not exists (select 1 from public.programmes where id = p_programme and published) then
    raise exception 'unknown programme' using errcode = '22023';
  end if;
  insert into public.programme_recommendations (user_id, programme_id, weeks, sessions_per_week, reasons, engine_version)
  values (auth.uid(), p_programme, p_weeks, p_sessions, coalesce(p_reasons[1:10], '{}'), left(p_engine, 40))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.save_my_recommendation(uuid, int, int, text[], text) from public, anon;
grant execute on function public.save_my_recommendation(uuid, int, int, text[], text) to authenticated;
