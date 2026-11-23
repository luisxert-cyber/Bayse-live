// Pure helpers that turn Stripe objects into BAYSE database rows.
// Kept free of the Stripe SDK so they can be unit-tested without network access.

export const SUBSCRIPTION_STATUSES = [
  'trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'paused',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Statuses that grant access. past_due keeps access for a 7-day grace window (enforced in SQL). */
export const ENTITLED_STATUSES: readonly SubscriptionStatus[] = ['trialing', 'active', 'past_due'];

export type StripeSubscriptionLike = {
  id: string;
  status: string;
  customer: string | { id: string };
  cancel_at_period_end?: boolean | null;
  cancel_at?: number | null;
  trial_end?: number | null;
  current_period_end?: number | null;
  metadata?: Record<string, string> | null;
  items?: { data: Array<{ price: { id: string }; current_period_end?: number | null }> };
};

export type SubscriptionRow = {
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string | null;
  user_id_hint: string | null;
  status: SubscriptionStatus;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  /** When the membership will end, if the member (or BAYSE) has cancelled it. */
  cancel_at: string | null;
};

const toIso = (s?: number | null) => (typeof s === 'number' ? new Date(s * 1000).toISOString() : null);

export function normaliseStatus(s: string): SubscriptionStatus {
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(s) ? (s as SubscriptionStatus) : 'incomplete';
}

export function mapSubscription(sub: StripeSubscriptionLike): SubscriptionRow {
  const item = sub.items?.data?.[0];
  // Newer Stripe API versions moved current_period_end onto the subscription item.
  const periodEnd = sub.current_period_end ?? item?.current_period_end ?? null;
  return {
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    stripe_price_id: item?.price?.id ?? null,
    user_id_hint: sub.metadata?.bayse_user_id ?? null,
    status: normaliseStatus(sub.status),
    trial_end: toIso(sub.trial_end),
    current_period_end: toIso(periodEnd),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    cancel_at: toIso(sub.cancel_at) ?? (sub.cancel_at_period_end ? toIso(periodEnd) : null),
  };
}

/** The webhook events BAYSE acts on. Everything else is recorded and ignored. */
export const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.payment_failed',
  'invoice.paid',
  'charge.refunded',
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}
