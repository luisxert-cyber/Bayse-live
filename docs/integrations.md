# Integrations

## Stripe (built, test mode)

- Checkout: `startCheckout` server action. Subscription mode, the price's trial days, `allow_promotion_codes` (studio-member 100%-off codes still work), `client_reference_id` and `metadata.bayse_user_id` set to the BAYSE user id.
- Webhook: `POST /api/stripe/webhook`. Verifies the signature, stores each event id once (`stripe_events`), and upserts `subscriptions`. Handles `checkout.session.completed`, `customer.subscription.created|updated|deleted|paused|resumed` and `invoice.payment_failed`. Failures return 500 so Stripe retries; the error is saved on the event row.
- Customer Portal: `openBillingPortal` for card changes, invoices and cancellation. Cancellation is never blocked.
- To connect: create TEST prices in Stripe for each plan, paste their ids in Admin → Plans and prices, set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Netlify, and point a Stripe webhook at `https://<site>/api/stripe/webhook` with the events above.
- Live mode is refused in code until the `live_billing` flag is switched on.

## Supabase Auth (built)

- Email and password, magic links, password reset, email confirmation.
- **Anonymous sign-ins must be switched on** (Authentication → Sign In / Providers → Anonymous) for onboarding to save answers before an account exists.
- Redirect URLs to allow: `https://<site>/auth/callback`, and `http://localhost:3000/auth/callback` for development.
- Apple and Google sign-in: parked, as agreed.

## Mux (Phase 2, not started)

Needs a Mux account in BAYSE's name, an access token and a signing key. Videos will play only with short-lived signed tokens issued to entitled members.

## Zoom (Phase 3, not started)

Embedding classes inside BAYSE needs a Zoom Meeting SDK app in BAYSE's Zoom account. The join token will be released by a server route only to members with a booking and the `live_classes` entitlement.

## Email (Phase 3, not started)

Resend or Postmark. Off until the `member_emails` flag is switched on.

## Studio booking system (Phase 6, not started)

The provider's API has not been checked yet. Until it is, studio managers verify links by hand in `/studio`.
