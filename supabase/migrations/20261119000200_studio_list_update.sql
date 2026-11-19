-- Owner's studio list, 19 Nov 2026: Chester and Harrogate are open, the mat studio is now
-- Mega Reformer (Stockton Heath and Liverpool), and three studios are opening soon.
-- The two Mega Reformer studios are the same membership as their reformer studio (Liverpool: same
-- building; Stockton Heath: round the corner at 19a London Road), so members link to BAYSE Liverpool
-- or BAYSE Stockton Heath. They are locations on the website, not separate studios here.
update public.studios set status = 'open' where slug in ('chester', 'harrogate') and status = 'opening';

insert into public.studios (slug, name, town, status) values
  ('manchester-northern-quarter',  'BAYSE Manchester Northern Quarter',  'Manchester',     'opening'),
  ('leeds',                        'BAYSE Leeds',                        'Leeds',          'opening'),
  ('cheltenham',                   'BAYSE Cheltenham',                   'Cheltenham',     'opening')
on conflict (slug) do nothing;

-- Every studio has its own community group.
insert into public.groups (kind, slug, name, studio_id, description)
select 'studio', s.slug, s.name, s.id, 'Members of ' || s.name || '.' from public.studios s where s.status <> 'closed'
on conflict (slug) do nothing;
