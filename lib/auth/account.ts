// Has this visitor saved an account yet?
// An anonymous onboarding session becomes an account when they add an email and password.
// If email confirmation is switched on in Supabase, the email waits in `new_email` until they
// click the link. They can carry on meanwhile, so that counts as having an account too.
type MaybeUser = { is_anonymous?: boolean | null; email?: string | null; new_email?: string | null };

export function hasAccount(user: MaybeUser | null | undefined): boolean {
  if (!user) return false;
  return !user.is_anonymous || Boolean(user.email || user.new_email);
}
