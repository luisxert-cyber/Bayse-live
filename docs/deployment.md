# Deployment

## First deploy (staging)

1. Create a new Supabase project `bayse-live` (London). In SQL editor, or with the CLI: `supabase link` then `supabase db push`, then run `supabase/seed.sql`.
2. Supabase Auth settings: Site URL = the Netlify URL; redirect URL `https://<site>/auth/callback`; enable anonymous sign-ins; enable leaked-password protection; minimum password length 10.
3. Netlify: "Import from Git", choose `bayse-live`. Netlify detects Next.js. Add environment variables from `.env.example` (the service role key and Stripe secret are server-only).
4. Stripe (test mode): create a monthly price for Essential, Club and Coaching with a 7-day trial, paste the price ids in Admin → Plans and prices. Add a webhook to `https://<site>/api/stripe/webhook` for the events in `docs/integrations.md`, and copy its signing secret to `STRIPE_WEBHOOK_SECRET`.
5. Make yourself super admin once, in the Supabase SQL editor:
   `insert into public.user_roles (user_id, role) select id, 'super_admin' from auth.users where email = '<your email>';`

## Going live (needs Luis's explicit approval)

- Run the Phase 7 checklist: payments, booking and video end to end; security and privacy review; DPIA for health data; legal pages reviewed.
- Switch Stripe to live keys, then switch on `live_billing` in Admin → Feature flags (typed confirmation).
- Remove `robots: noindex` in `app/layout.tsx`.
- Switch on `member_emails` only when templates are approved.
