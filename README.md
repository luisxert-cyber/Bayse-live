# BAYSE Live

Personalised Pilates programmes, live classes, nutrition, coaching and community for BAYSE members, online and in the studios.

**Your programme. Your coach. Your people.**

This repository holds the whole platform: the Next.js web app, the Supabase database (schema, row-level security, seed data), server routes for Stripe, the tests, and the docs.

## Status

Phase 1 (foundation) is in progress. See [`docs/status.md`](docs/status.md) for an honest, feature-by-feature status using four labels: Complete and tested, Built not tested, Mocked, Not started.

Nothing here is live. Billing is Stripe **test mode**, member emails are switched off, and search engines are blocked until launch is approved.

## Stack

| Part | Choice |
| --- | --- |
| App | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Data and accounts | Supabase (Postgres 17, Auth, RLS), London region |
| Payments | Stripe Billing (Checkout, Customer Portal, webhooks) |
| Video (Phase 2) | Mux, signed playback |
| Live (Phase 3) | Zoom Meeting SDK |
| Email (Phase 3) | Resend or Postmark |
| Hosting | Netlify |

## Run it locally

```bash
cp .env.example .env.local      # fill in the Supabase anon key and a Stripe TEST key
npm install
supabase start                  # local Postgres + Auth; applies migrations and seed
npm run dev                     # http://localhost:3000
```

## Tests

```bash
npm run test:unit   # plan engine, onboarding validation, Stripe mapping (node:test)
npm run test:rls    # role-by-role permission tests against a throwaway database
npm run test:e2e    # Playwright smoke tests (needs the app running)
```

CI (`.github/workflows/ci.yml`) runs type checks, lint, unit tests, a production build, the RLS tests against a local Supabase, and a secret scan on every pull request.

## Docs

- [Architecture](docs/architecture.md)
- [Database and permissions](docs/database.md)
- [Integrations](docs/integrations.md)
- [Milestones](docs/milestones.md)
- [Status](docs/status.md)
- [Known issues and decisions waiting](docs/known-issues.md)
- [Deployment](docs/deployment.md)
- Requirements: [master spec v2](docs/requirements/master-spec-v2.md), [community and retention brief](docs/requirements/community-retention-brief.md)

## Rules

- Never commit secrets. `.env*` files are ignored; production values live in Netlify and Supabase.
- Permissions are enforced in the database (RLS). Screens only reflect them.
- Special-category data (wellness, allergies) is owner-only and needs explicit consent.
- Feature branches and pull requests; `main` stays deployable.
