// Pure rules for studio-member pricing. No imports, so they can be unit-tested without a network.
//
// Verified £99 and £148 studio members get BAYSE Foundation included and pay half price for
// Inner Circle and Black. Whether someone is eligible is decided by the database
// (studio_price_eligible), never by the browser. These helpers only apply that answer.

export type Audience = 'standard' | 'studio';
export type PricedRow = { id: string; plan_id: string; audience?: Audience | null };

/** The plan a qualifying studio membership already includes. It is never sold to an eligible member. */
export const INCLUDED_PLAN_KEY = 'essential';

export type CheckoutRule = 'ok' | 'included' | 'not_eligible' | 'use_studio_price';

/**
 * May this member start checkout for this price?
 * - included: an eligible studio member never pays for Foundation.
 * - not_eligible: a studio price asked for by someone who is not a verified studio member.
 * - use_studio_price: an eligible member must not be charged the standard price by mistake.
 */
export function checkoutRule(planKey: string, audience: Audience | null | undefined, eligible: boolean): CheckoutRule {
  const a: Audience = audience === 'studio' ? 'studio' : 'standard';
  if (eligible && planKey === INCLUDED_PLAN_KEY) return 'included';
  if (a === 'studio' && !eligible) return 'not_eligible';
  if (a === 'standard' && eligible) return 'use_studio_price';
  return 'ok';
}

/** The prices this member is shown: studio prices for eligible studio members, standard prices for everyone else. */
export function pricesFor<T extends PricedRow>(prices: T[], eligible: boolean): T[] {
  const want: Audience = eligible ? 'studio' : 'standard';
  return prices.filter((p) => (p.audience === 'studio' ? 'studio' : 'standard') === want);
}
