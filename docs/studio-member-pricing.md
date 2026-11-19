# Studio member pricing

Owner brief, 19 November 2026. All paid plans bill every 28 days.

| Plan | Standard | Verified £99 / £148 studio member |
| --- | --- | --- |
| On-demand classes and community | part of every plan | Included free |
| BAYSE Foundation | £19.99 (7-day trial) | Not sold: Inner Circle costs the same |
| BAYSE Inner Circle | £39.99 (7-day trial) | £19.99, no trial |
| BAYSE Black | £79.99 (7-day trial) | £39.99, no trial |

Foundation stays at £19.99 (owner decision 19 Nov; the written brief said £14.99).

## How it works

- **What a studio membership includes (owner decision 19 Nov, later the same day).** On-demand classes and the community only, not the whole of Foundation. Recipes and the food plan, challenges, live classes and 1-to-1s come with the half-price upgrades. Set in `studio_tier_entitlements` (migration `20261119000600`).
- **Community for everyone.** Every plan and every verified studio membership includes the community.
- **Verification.** A member asks to link their studio in You → Membership. The request is always saved as pending. A studio manager (`/studio`) or admin (Admin → Studio member checks) confirms it against the booking system. A matching email or a tick box is never enough.
- **Re-check.** A verified link must be re-confirmed every 90 days. If it is not, included access stops 28 days after the re-check date.
- **Prices.** Studio prices are separate rows in `public.prices` (`audience = 'studio'`), each with its own Stripe price. They are not coupons. Checkout asks the database (`studio_price_eligible()`) on the server; it refuses a studio price for anyone else, never sells Foundation to an eligible member, and never charges an eligible member the standard price. Promotion codes are off on studio prices.
- **Studio membership ends.** Staff press "Membership ended". Included Foundation runs for 28 more days. A half-price membership is set to finish at the end of the period already paid; it is never moved to the standard price automatically. The member can choose a standard plan.
- **Black private session.** One credit per paid invoice, as before. Free Foundation members get none.

## Before launch

1. Map the two studio Stripe prices. They were created on 19 Nov 2026 in the live Bayse Education & Hot Mat account (GBP, every 4 weeks, no trial, on the existing products):
   - BAYSE Inner Circle, studio member, £19.99: `price_1UdRHPApzDz2qzTe1sJ1JoqL`
   - BAYSE Black, studio member, £39.99: `price_1UdRHXApzDz2qzTeFJIyQAxa`

   Paste each id onto its studio row in Admin → Plans and prices **only after this code is deployed**. The previous version of the join page has no studio check: it would offer a mapped studio price to everyone. Until they are mapped the studio upgrades show "Available soon".
2. Apply migration `20261119000100_studio_member_pricing.sql` to the database, together with the deploy (the previous join page would list the new studio rows to everyone).
3. Switch off the `test_mode` flag (anyone can currently give themselves full access).
4. Set up the email provider: the 28-day notice when a studio membership ends is only shown in the app until emails are on.
5. Done 19 Nov: the studio list holds the 9 open studios members can link to (the Mega Reformer studios in Stockton Heath and Liverpool are the same membership as their reformer studio) and the three opening soon (migration `20261119000200_studio_list_update.sql`).
6. A scheduled job to flag overdue re-checks is not built; the admin screen lists them.
