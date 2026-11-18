# Architecture

One Next.js web app on Netlify talks to five managed services. Secrets live only on the server.

```
Members, instructors, studio managers, admin (phone or desktop browser)
        │  HTTPS, Supabase session cookie
        ▼
Next.js app (Netlify)
  pages:  / (site) · /start (onboarding) · /today /train /live /community /you · /studio · /admin
  server: server actions · /api/stripe/webhook · /api/me/export · /auth/*
        │
        ├── Supabase: Auth, Postgres + RLS (every table), London
        ├── Stripe: Checkout, Customer Portal, webhooks (test mode until launch)
        ├── Mux (Phase 2): signed playback tokens from a server route
        ├── Zoom (Phase 3): join tokens released only to booked, entitled members
        └── Email (Phase 3): reminders and receipts via a notifications table
```

## Key decisions

- **Database-enforced permissions.** The app uses the member's own Supabase session for almost everything, so RLS decides what each person can read or change. The service-role key is used only in three server-side places: the Stripe webhook, saving programme recommendations, and account deletion.
- **Roles versus entitlements.** Roles (`user_roles`) say who someone is to BAYSE. Entitlements (`entitlements`) say what they can use. Entitlements are derived by database triggers from subscriptions and verified studio links, and are never written by the browser.
- **Anonymous onboarding.** The first onboarding screen starts an anonymous Supabase session, so answers are saved from screen one and survive a closed tab. Creating an account converts the same user, keeping every answer.
- **Safety rails.** Live Stripe keys are refused unless the `live_billing` flag is on, and switching on `live_billing` or `member_emails` needs a typed confirmation in admin.
- **Mobile first.** One column, 44px minimum tap targets, safe-area padding, bottom navigation with five tabs (Today, Train, Live, Community, You).

## Environments

| Environment | App | Database | Payments |
| --- | --- | --- | --- |
| Local | `npm run dev` | `supabase start` | Stripe test |
| Staging | Netlify deploy previews | staging Supabase project | Stripe test |
| Production | live subdomain | production Supabase | Stripe live, only after approval |
