-- The size limits on the shopping list and the food diary counted rows from inside the table's own
-- security policy, which Postgres rejects ("infinite recursion detected in policy"). Every insert failed,
-- so "Add ingredients to my list" never saved. Count through a small function instead.
create or replace function public.my_shopping_count()
returns int language sql stable security definer set search_path to '' as $$
  select count(*)::int from public.shopping_items s where s.user_id = auth.uid();
$$;
create or replace function public.my_diary_count(p_day date)
returns int language sql stable security definer set search_path to '' as $$
  select count(*)::int from public.food_diary d where d.user_id = auth.uid() and d.day = p_day;
$$;
revoke all on function public.my_shopping_count() from public, anon;
revoke all on function public.my_diary_count(date) from public, anon;
grant execute on function public.my_shopping_count() to authenticated;
grant execute on function public.my_diary_count(date) to authenticated;

-- The limit only applies to adding rows, so ticking or removing an item always works, even on a full list.
drop policy if exists shopping_own on public.shopping_items;
drop policy if exists shopping_add on public.shopping_items;
create policy shopping_own on public.shopping_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy shopping_add on public.shopping_items as restrictive for insert to authenticated with check (public.my_shopping_count() < 300);

drop policy if exists food_diary_own on public.food_diary;
drop policy if exists food_diary_add on public.food_diary;
create policy food_diary_own on public.food_diary for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy food_diary_add on public.food_diary as restrictive for insert to authenticated with check (public.my_diary_count(day) < 40);
