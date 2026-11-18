#!/usr/bin/env python3
"""Builds an isolated copy of the migrations + seed + RLS tests in schema bayse_t,
so they can be run against an existing Supabase project without touching public.
Output: three files in .rls-remote/: 1-setup.sql, 2-tests.sql, 3-cleanup.sql"""
import glob, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, '.rls-remote'); os.makedirs(out, exist_ok=True)
S = 'bayse_t'
def iso(sql):
    sql = sql.replace('public.', S + '.')
    sql = sql.replace('bayse_on_auth_user_created', S + '_on_auth_user_created')
    sql = re.sub(r'^\s*--.*$', '', sql, flags=re.M)          # drop comment lines
    sql = re.sub(r'\n\s*\n+', '\n', sql)
    return sql.strip() + '\n'
prelude = f"""create schema {S};
grant usage on schema {S} to anon, authenticated, service_role;
alter default privileges in schema {S} grant all on tables to anon, authenticated, service_role;
alter default privileges in schema {S} grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema {S} grant execute on functions to anon, authenticated, service_role;
"""
mig = ''.join(open(f).read() for f in sorted(glob.glob(os.path.join(root, 'supabase/migrations/*.sql'))))
open(os.path.join(out, '1-setup.sql'), 'w').write(prelude + iso(mig) + iso(open(os.path.join(root, 'supabase/seed.sql')).read()))
open(os.path.join(out, '2-tests.sql'), 'w').write(iso(open(os.path.join(root, 'supabase/tests/rls_test.sql')).read()))
open(os.path.join(out, '3-cleanup.sql'), 'w').write(f"""delete from auth.users where email like 'rls-%@bayse.invalid';
drop trigger if exists {S}_on_auth_user_created on auth.users;
drop schema {S} cascade;
""")
for f in sorted(os.listdir(out)): print(f, os.path.getsize(os.path.join(out, f)))
