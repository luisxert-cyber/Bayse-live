# Implementation status

Updated 18 November 2026. Labels: **Complete and tested** · **Built not tested** · **Mocked** · **Not started**.

"Built not tested" here means the code is written and passes syntax and import checks, but it has not yet been run through `npm install && npm run build` or exercised in a browser against the real services. The workspace it was written in had no npm access.

## Phase 1: Foundation

| Feature | Status | Evidence / what is missing |
| --- | --- | --- |
| Database schema (identity, roles, studios, billing, studio links, onboarding, consent, programmes, flags, audit) | Complete and tested | Applied cleanly to Postgres 17 on Supabase in an isolated schema |
| Row-level security and role permissions | Complete and tested | 56/56 checks in `supabase/tests/rls_test.sql` |
| Profile email follows the account email (migration 0400) | Complete and tested | Passed on 18 November 2026 |
| Entitlements from subscriptions and studio links (incl. 7-day past-due grace, cancellation) | Complete and tested | Covered by RLS tests |
| Consent-gated special-category data, withdrawal deletes data | Complete and tested | Covered by RLS tests |
| Data export (`export_my_data`) | Complete and tested (database) · Built not tested (download route) | |
| Programme recommendation engine | Complete and tested | 12 unit tests; strict type check clean |
| Onboarding definition and answer validation (19 screens) | Complete and tested | Unit tests |
| Stripe subscription mapping | Complete and tested | Unit test |
| Onboarding screens and server actions | Built not tested | Needs anonymous sign-ins switched on in Supabase |
| Sign in, magic link, password reset, sign out | Built not tested | Needs Supabase redirect URLs set |
| Stripe Checkout, webhook, Customer Portal | Built not tested | Needs TEST price ids, secrets and webhook endpoint |
| Today, You, Membership, Privacy, Delete account | Built not tested | |
| Admin: overview, members, roles, studio links, plans, flags, audit log | Built not tested | |
| Studio manager view (verify studio links) | Built not tested | |
| Design system (tokens, light and dark, components) | Built not tested | Rendered and screenshotted at phone width from the real components: no overflow, both themes checked. Not yet seen inside a running Next.js build |
| Public site, pricing, legal drafts | Built not tested | Legal pages are drafts for review |
| CI (types, lint, unit, build, RLS, secret scan) | Built not tested | Runs on the first push to GitHub |
| Playwright smoke tests | Built not tested | |

## Later phases

| Phase | Status |
| --- | --- |
| 2 On-demand (Mux) | Not started · placeholder screen says "Coming soon" |
| 3 Live and coaching | Not started in this repo · designs exist in the clickable prototype (Mocked) |
| 4 Nutrition and wellness hub | Not started · preferences captured in onboarding |
| 5 Community and Clubs: data layer (groups, studio communities, Circles with size cap, posts, comments, reactions, Padel/Walk/Social activities, automatic places and waiting lists, activity chat, notifications, reminders, blocking, discovery opt-in, reports, moderation, account restrictions) | Complete and tested · 48 checks in `supabase/tests/community_test.sql`, all passing |
| 5 Community and Clubs: screens | Not started · prototype screens exist (Mocked) |
| 6 Studio links and recognition | Studio link verification built; the rest not started |
| 7 Launch readiness | Not started |
