-- BAYSE Live · Phase 1 · Keep profiles.email in step with auth.users.
-- Onboarding starts as an anonymous user (no email). When the member creates an
-- account and confirms the address, Supabase Auth updates auth.users.email; this
-- trigger copies it to the profile so staff screens and exports show it.

create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;

create trigger bayse_on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();
