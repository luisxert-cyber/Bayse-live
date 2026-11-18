import 'server-only';
import type { createAdminClient } from '@/lib/supabase/admin';
import { isUuid, mapSubscription, type StripeSubscriptionLike } from '@/lib/billing/stripe-map';

// Writes a Stripe subscription into BAYSE's database. Used by the signed webhook and by the
// in-app payment confirmation page (so access switches on straight away, without waiting for
// the webhook). Entitlements follow automatically through database triggers.

type Admin = ReturnType<typeof createAdminClient>;

export async function resolveUserId(admin: Admin, customerId: string, hint: string | null): Promise<string | null> {
  if (isUuid(hint)) return hint;
  const { data } = await admin.from('stripe_customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

export async function upsertSubscription(admin: Admin, sub: StripeSubscriptionLike) {
  const row = mapSubscription(sub);
  const userId = await resolveUserId(admin, row.stripe_customer_id, row.user_id_hint);
  if (!userId) throw new Error(`No BAYSE user for customer ${row.stripe_customer_id}`);

  await admin.from('stripe_customers').upsert({ user_id: userId, stripe_customer_id: row.stripe_customer_id }, { onConflict: 'user_id' });

  let priceId: string | null = null;
  let planId: string | null = null;
  if (row.stripe_price_id) {
    const { data: price } = await admin.from('prices').select('id, plan_id').eq('stripe_price_id', row.stripe_price_id).maybeSingle();
    priceId = (price?.id as string | undefined) ?? null;
    planId = (price?.plan_id as string | undefined) ?? null;
    if (!price) console.warn(`[stripe] price ${row.stripe_price_id} is not mapped in public.prices; subscription saved without entitlements`);
  }

  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: row.stripe_subscription_id,
    price_id: priceId,
    plan_id: planId,
    status: row.status,
    trial_end: row.trial_end,
    current_period_end: row.current_period_end,
    cancel_at_period_end: row.cancel_at_period_end,
  }, { onConflict: 'stripe_subscription_id' });
  if (error) throw error;
}

type InvoiceLike = {
  id?: string | null;
  amount_paid?: number | null;
  customer?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null;
};

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === 'string' ? v : v?.id ?? null);

/** The subscription an invoice belongs to. Newer Stripe API versions moved it under `parent`. */
export function invoiceSubscriptionId(inv: InvoiceLike): string | null {
  return idOf(inv.subscription) ?? idOf(inv.parent?.subscription_details?.subscription) ?? null;
}

/**
 * BAYSE Black includes one 45-minute private Zoom session per billing period (every 28 days). Each paid invoice
 * for a plan with personal coaching gives the member one credit, keyed on the invoice id so a
 * replayed webhook can never give two. Free-trial invoices (nothing paid, still trialing) give none.
 * Returns true when a credit was added.
 */
export async function grantCreditForInvoice(admin: Admin, inv: InvoiceLike, sub: StripeSubscriptionLike): Promise<boolean> {
  if (!inv.id || sub.status === 'trialing') return false;
  const row = mapSubscription(sub);
  if (!row.stripe_price_id) return false;
  const { data: price } = await admin.from('prices').select('plan_id').eq('stripe_price_id', row.stripe_price_id).maybeSingle();
  if (!price?.plan_id) return false;
  const { data: coaching } = await admin.from('plan_entitlements').select('plan_id').eq('plan_id', price.plan_id).eq('entitlement_key', 'individual_coaching').maybeSingle();
  if (!coaching) return false;
  const userId = await resolveUserId(admin, row.stripe_customer_id, row.user_id_hint);
  if (!userId) throw new Error(`No BAYSE user for customer ${row.stripe_customer_id}`);

  const { data: settings } = await admin.from('booking_settings').select('credit_valid_months').maybeSingle();
  const months = Math.max(1, Number(settings?.credit_valid_months ?? 1));
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + months);
  const { error } = await admin.from('coaching_credits').upsert({
    user_id: userId,
    period_start: now.toISOString().slice(0, 10),
    expires_at: expires.toISOString(),
    source: 'subscription',
    source_ref: inv.id,
    note: 'Included with BAYSE Black',
  }, { onConflict: 'source_ref', ignoreDuplicates: true });
  if (error) throw error;
  return true;
}
