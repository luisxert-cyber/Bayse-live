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
  if (!userId) {
    // The Stripe account is shared with other BAYSE products (courses and their payment plans), so events
    // arrive for subscriptions that are nothing to do with The BAYSE Club. Those are acknowledged and left
    // alone. Only a BAYSE Club price with no member behind it is a real problem.
    const { data: ours } = row.stripe_price_id
      ? await admin.from('prices').select('id').eq('stripe_price_id', row.stripe_price_id).maybeSingle()
      : { data: null };
    if (!ours) return;
    throw new Error(`No BAYSE user for customer ${row.stripe_customer_id}`);
  }

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
    cancel_at: row.cancel_at,
  }, { onConflict: 'stripe_subscription_id' });
  if (error) throw error;
}

type InvoiceLike = {
  id?: string | null;
  amount_paid?: number | null;
  lines?: { data?: { period?: { end?: number | null } | null; price?: { id?: string } | string | null; pricing?: { price_details?: { price?: string | { id?: string } | null } | null } | null }[] | null } | null;
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
 * BAYSE Black includes one 40-minute private Zoom session per paid billing period (every 28 days), with no carry-over. Each paid invoice
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

  // No carry-over (master brief): the session must be used within the paid 28-day period it came with.
  const now = new Date();
  const expires = row.current_period_end ? new Date(row.current_period_end) : new Date(now.getTime() + 28 * 864e5);
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

/**
 * The same credit, worked out from what BAYSE already holds about the membership, without asking Stripe.
 * Used first, so a paid BAYSE Black period gives its session even if the Stripe key cannot read subscriptions.
 * Returns 'unknown' when the membership has not been recorded yet (events can arrive out of order): the caller
 * then asks Stripe, or lets Stripe retry the event.
 */
export async function grantCreditFromRecord(admin: Admin, inv: InvoiceLike, stripeSubscriptionId: string): Promise<'granted' | 'none' | 'unknown'> {
  if (!inv.id) return 'none';
  const { data: sub } = await admin.from('subscriptions').select('user_id, plan_id, status, current_period_end').eq('stripe_subscription_id', stripeSubscriptionId).maybeSingle();
  if (!sub?.user_id || !sub.plan_id) return 'unknown';
  const { data: coaching } = await admin.from('plan_entitlements').select('plan_id').eq('plan_id', sub.plan_id).eq('entitlement_key', 'individual_coaching').maybeSingle();
  if (!coaching) return 'none';
  // A free-trial invoice (nothing paid) gives no session: it starts with the first payment.
  if (!((inv.amount_paid ?? 0) > 0)) return 'none';

  const now = new Date();
  // The paid period ends where the invoice line says. The saved membership can still show the old period
  // for a moment at renewal, so it is only trusted when it is in the future.
  const lineEnd = Math.max(0, ...(inv.lines?.data ?? []).map((l) => l.period?.end ?? 0));
  const saved = sub.current_period_end ? new Date(sub.current_period_end as string) : null;
  const expires = lineEnd * 1000 > now.getTime() + 864e5 ? new Date(lineEnd * 1000)
    : saved && saved.getTime() > now.getTime() + 864e5 ? saved
    : new Date(now.getTime() + 28 * 864e5);
  const { error } = await admin.from('coaching_credits').upsert({
    user_id: sub.user_id,
    period_start: now.toISOString().slice(0, 10),
    expires_at: expires.toISOString(),
    source: 'subscription',
    source_ref: inv.id,
    note: 'Included with BAYSE Black',
  }, { onConflict: 'source_ref', ignoreDuplicates: true });
  if (error) throw error;
  return 'granted';
}

/**
 * True when an invoice is for a BAYSE Club price, false when it is clearly for something else sold from the
 * same Stripe account (courses and their payment plans), and null when the invoice does not say.
 */
export async function invoiceIsBayseClub(admin: Admin, inv: InvoiceLike): Promise<boolean | null> {
  const ids = (inv.lines?.data ?? []).map((l) => {
    const a = l.pricing?.price_details?.price, b = l.price;
    return (typeof a === 'string' ? a : a?.id) ?? (typeof b === 'string' ? b : b?.id) ?? null;
  }).filter((x): x is string => Boolean(x));
  if (!ids.length) return null;
  const { data } = await admin.from('prices').select('id').in('stripe_price_id', ids).limit(1);
  return (data ?? []).length > 0;
}
