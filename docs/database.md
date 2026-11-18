# Database and permissions

Migrations: `supabase/migrations/` (plain SQL, applied in order). Seed: `supabase/seed.sql` (reference data only, no members).

## Phase 1 tables

| Area | Tables |
| --- | --- |
| Identity | `profiles` (1:1 with `auth.users`), `user_roles`, `studios`, `audit_log` |
| Billing | `plans`, `prices`, `plan_entitlements`, `stripe_customers`, `subscriptions`, `stripe_events`, `entitlement_keys`, `entitlements` |
| Studio links | `studio_memberships`, `studio_tier_entitlements` |
| Onboarding | `onboarding_answers`, `nutrition_preferences`, `programmes`, `programme_recommendations` |
| Special category | `wellness_preferences`, `dietary_needs`, `consent_records` |
| Operations | `feature_flags` |

## Helper functions (used by policies)

`has_role(role)`, `has_role_at(role, studio)`, `is_admin()`, `is_super_admin()`, `manages_studio(studio)`, `has_entitlement(key)`, `has_consent(user, purpose)`. All are `SECURITY DEFINER` with an empty `search_path`.

## Who can do what (Phase 1)

| Data | Member | Studio manager | Admin | Super admin |
| --- | --- | --- | --- | --- |
| Own profile | read, edit (not email) | | | |
| Other profiles | no | home-studio members only (read) | read, edit | read, edit |
| Roles | read own | no | grant/revoke non-admin roles | everything |
| Studio link | request (always pending), withdraw while pending | verify/reject for own studio | all | all |
| Subscriptions, entitlements | read own | no | read | read |
| Onboarding, nutrition prefs | own | no | read | read |
| Wellness, allergies | own only, after consent | **no** | **no** | **no** |
| Consent records | add own, read own (append-only) | no | read | read |
| Audit log | no | no | read | read |
| Plans, prices, programmes, flags | read published | read published | manage | manage |

## Automatic behaviour

- New auth user → profile row.
- Subscription or studio link change → entitlements rebuilt for that member.
- `past_due` keeps access for 7 days after the period end, then stops.
- Plan or tier mapping change → everyone affected is rebuilt.
- Withdrawing wellness or allergy consent deletes that data.
- Role, studio link and flag changes → audit log.

## Tests

`supabase/tests/rls_test.sql`: 56 checks signing in as a member, two studio managers, an admin, a super admin and an anonymous visitor. Last run: 56/56 passed on 18 November 2026 against Postgres 17 (Supabase, London) in an isolated schema.
