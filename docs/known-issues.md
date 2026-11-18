# Known issues and decisions waiting

## Decisions for Luis

1. **Studio members' digital access.** Seeded as Club level (everything except 1:1 coaching) for £99 and £148 members, and community plus progress for others. Change it in the database table `studio_tier_entitlements` (admin editing screen to follow).
2. **Prices.** £19.99 / £39.99 / £79.99 are hypotheses and marked as such in the app.
3. **Reformer content.** You said mat only; the spec lists reformer. The plan engine only recommends Reformer Progression to members who say they own a reformer.
4. **Live class size.** Capacity will be optional per class (blank = unlimited).
5. **Studios.** Seeded: Altrincham, Bolton, Liverpool, Stockton Heath, Stafford, Stoke, Wilmslow, Chester (opening), Harrogate (opening). Your notes mention 11 studio managers, so two may be missing.
6. **Retention thresholds.** Left out, as the community brief instructs.

## Setup needed (only you can do these)

- Connect GitHub to Claude so the repo can be pushed (Settings → Connectors).
- Supabase: switch on anonymous sign-ins; add redirect URLs; switch on leaked-password protection.
- Stripe: create TEST prices; add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Netlify; add the webhook endpoint.
- Netlify: create the site from the GitHub repo and add the environment variables in `.env.example`.

## Technical notes

- The existing Supabase project (`bayse-on-demand`) already has tables from the earlier prototype (`profiles`, `member_plans`, `checkins`). The new migrations also create `profiles`, so they should go into a **fresh project** (recommended: `bayse-live`), not on top of the prototype project.
- The RLS test run left a temporary schema `bayse_t`, 7 fake users (`rls-*@bayse.invalid`) and a trigger `bayse_t_on_auth_user_created` in the prototype project. Cleanup is waiting for your approval of the Supabase prompt. The cleanup SQL is in `scripts/build-remote-rls-test.py` (third file).
- Programme recommendations are rebuilt if onboarding answers change after the last recommendation. Moving between screens also updates the answers' timestamp, so one extra (identical) recommendation row can be created. Harmless; tidy in Phase 2.
- Database types are written by hand in `lib/types.ts`. Switch to `supabase gen types` once the CLI runs in CI.
