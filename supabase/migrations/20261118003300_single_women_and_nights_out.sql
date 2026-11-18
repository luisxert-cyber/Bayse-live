-- Two new official circles. Official BAYSE circles can be bigger than the 20 a member-made circle is limited to.
do $$
declare c text;
begin
  for c in select conname from pg_constraint where conrelid = 'public.groups'::regclass and contype = 'c'
            and pg_get_constraintdef(oid) ilike '%circle%' and pg_get_constraintdef(oid) ilike '%max_members%' loop
    execute format('alter table public.groups drop constraint %I', c);
  end loop;
end $$;
alter table public.groups add constraint groups_circle_size_check
  check (kind <> 'circle' or max_members between 10 and 20 or (created_by is null and max_members between 10 and 500));

insert into public.groups (kind, slug, name, description, max_members) values
  ('circle', 'circle-single-women', 'Single Women', 'For single women in the BAYSE Club. Friendship, plans, honest chat and people to do things with.', 300),
  ('circle', 'circle-girls-night-out', 'Girls’ Night Out', 'Find BAYSE women near you for dinners, drinks and nights out. Say where you are based and what you fancy, then set the plan up in Clubs.', 300)
on conflict (slug) do nothing;
