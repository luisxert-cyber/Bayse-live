'use server';

// Every action uses the signed-in user's Supabase client, so the database's RLS
// policies decide what is allowed (admins cannot grant admin; only super admins can).

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import { getRoles, isAdminRole } from '@/lib/auth/session';

const ROLE = z.enum(['instructor', 'moderator', 'studio_manager', 'virtual_assistant', 'admin', 'super_admin']);
const uuid = z.string().uuid();

async function client() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/admin');
  return supabase;
}

export async function grantRole(form: FormData) {
  const userId = uuid.safeParse(form.get('user_id'));
  const role = ROLE.safeParse(form.get('role'));
  const studioRaw = String(form.get('studio_id') ?? '');
  if (!userId.success || !role.success) redirect('/admin/members?error=invalid');
  const studioId = studioRaw ? uuid.safeParse(studioRaw) : null;
  if (role.data === 'studio_manager' && !studioId?.success) redirect(`/admin/members/${userId.data}?error=studio`);
  const supabase = await client();
  const { error } = await supabase.from('user_roles').insert({ user_id: userId.data, role: role.data, studio_id: studioId?.success ? studioId.data : null });
  revalidatePath(`/admin/members/${userId.data}`);
  redirect(`/admin/members/${userId.data}?${error ? 'error=denied' : 'ok=granted'}`);
}

export async function revokeRole(form: FormData) {
  const id = uuid.safeParse(form.get('role_id'));
  const userId = uuid.safeParse(form.get('user_id'));
  if (!id.success || !userId.success) redirect('/admin/members?error=invalid');
  const supabase = await client();
  const { error, count } = await supabase.from('user_roles').delete({ count: 'exact' }).eq('id', id.data);
  revalidatePath(`/admin/members/${userId.data}`);
  redirect(`/admin/members/${userId.data}?${error || !count ? 'error=denied' : 'ok=revoked'}`);
}

/**
 * A studio membership has ended, so the member's half-price Inner Circle or Black membership must not
 * simply carry on, and must never jump to the standard price by itself. It is set to finish at the end
 * of the period already paid for; the member can choose a standard-price plan before or after that.
 * Returns false if a membership could not be updated in Stripe (staff are told to check it).
 */
async function finishStudioPricedMemberships(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: subs } = await admin.from('subscriptions')
    .select('stripe_subscription_id, cancel_at_period_end, prices(audience)')
    .eq('user_id', userId).in('status', ['trialing', 'active', 'past_due']);
  const mine = (subs ?? []).filter((s) => (s.prices as unknown as { audience?: string } | null)?.audience === 'studio' && !s.cancel_at_period_end);
  if (!mine.length) return true;
  try {
    const stripe = await getStripe();
    for (const s of mine) {
      await stripe.subscriptions.update(s.stripe_subscription_id as string, {
        cancel_at_period_end: true,
        metadata: { bayse_end_reason: 'studio_membership_ended' },
      });
    }
    return true;
  } catch (e) {
    console.error('[studio] could not set studio-priced membership to finish:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function setLinkStatus(form: FormData) {
  const id = uuid.safeParse(form.get('link_id'));
  const status = z.enum(['verified', 'rejected', 'ended']).safeParse(form.get('status'));
  const back = String(form.get('back') ?? '/admin/studio-links');
  const safeBack = back === '/studio' ? '/studio' : '/admin/studio-links';
  if (!id.success || !status.success) redirect(`${safeBack}?error=invalid`);
  const supabase = await client();
  // RLS decides: only an admin, or the manager of that studio, changes a row here.
  const { data: changed, error } = await supabase.from('studio_memberships').update({ status: status.data }).eq('id', id.data).select('user_id');
  const userId = changed?.[0]?.user_id as string | undefined;
  let ok: string = status.data;
  if (!error && userId && status.data === 'ended' && !(await finishStudioPricedMemberships(userId))) ok = 'ended_check_billing';
  revalidatePath(safeBack);
  redirect(`${safeBack}?${error || !userId ? 'error=denied' : `ok=${ok}`}`);
}

/** "Still a member": the studio has re-checked an already verified link. Good for another 90 days. */
export async function reconfirmLink(form: FormData) {
  const id = uuid.safeParse(form.get('link_id'));
  const back = String(form.get('back') ?? '/admin/studio-links');
  const safeBack = back === '/studio' ? '/studio' : '/admin/studio-links';
  if (!id.success) redirect(`${safeBack}?error=invalid`);
  const supabase = await client();
  const until = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const { error, count } = await supabase.from('studio_memberships').update({ verified_until: until }, { count: 'exact' }).eq('id', id.data).eq('status', 'verified');
  revalidatePath(safeBack);
  redirect(`${safeBack}?${error || !count ? 'error=denied' : 'ok=reconfirmed'}`);
}

export async function setFlag(form: FormData) {
  const key = z.string().regex(/^[a-z_]+$/).safeParse(form.get('key'));
  const enabled = form.get('enabled') === 'true';
  if (!key.success) redirect('/admin/flags?error=invalid');
  // Two flags control real-world effects; they need an explicit typed confirmation.
  if (enabled && ['live_billing', 'member_emails'].includes(key.data) && form.get('confirm') !== key.data) {
    redirect(`/admin/flags?error=confirm&key=${key.data}`);
  }
  const supabase = await client();
  const { error } = await supabase.from('feature_flags').update({ enabled }).eq('key', key.data);
  revalidatePath('/admin/flags');
  redirect(`/admin/flags?${error ? 'error=denied' : 'ok=1'}`);
}

export async function setStripePrice(form: FormData) {
  const id = uuid.safeParse(form.get('price_id'));
  const stripeId = z.string().regex(/^price_[A-Za-z0-9]+$/).or(z.literal('')).safeParse(String(form.get('stripe_price_id') ?? '').trim());
  if (!id.success || !stripeId.success) redirect('/admin/plans?error=invalid');
  const supabase = await client();
  const { error } = await supabase.from('prices').update({ stripe_price_id: stripeId.data || null }).eq('id', id.data);
  revalidatePath('/admin/plans');
  redirect(`/admin/plans?${error ? 'error=denied' : 'ok=1'}`);
}

const WHEN = z.enum(['period_end', 'now', 'now_refund']);

type InvoicePaymentLike = { status?: string; payment?: { payment_intent?: string | { id: string } | null; charge?: string | { id: string } | null } | null };
const refId = (v: string | { id: string } | null | undefined) => (typeof v === 'string' ? v : v?.id ?? null);

/** Refunds what was paid on one invoice. Returns the pence refunded, or 0 when nothing had been paid. */
async function refundInvoice(stripe: Stripe, invoiceId: string): Promise<number> {
  const inv = await stripe.invoices.retrieve(invoiceId);
  if (!((inv.amount_paid ?? 0) > 0)) return 0;
  const lister = (stripe as unknown as { invoicePayments: { list(p: { invoice: string; limit: number }): Promise<{ data: InvoicePaymentLike[] }> } }).invoicePayments;
  const { data: payments } = await lister.list({ invoice: invoiceId, limit: 10 });
  const paid = payments.find((x) => x.status === 'paid' && (refId(x.payment?.payment_intent) || refId(x.payment?.charge)));
  if (!paid) throw new Error('No card payment found on the invoice');
  const pi = refId(paid.payment?.payment_intent);
  const ch = refId(paid.payment?.charge);
  const refund = await stripe.refunds.create({
    ...(pi ? { payment_intent: pi } : { charge: ch as string }),
    reason: 'requested_by_customer',
    metadata: { bayse_reason: 'membership_cancelled_by_staff' },
  });
  return refund.amount;
}

/**
 * An administrator cancels a member's membership from the member's page in the back office.
 * - period_end: no more payments; the member keeps access until the time already paid for (or the trial) runs out.
 * - now: ends straight away, nothing refunded.
 * - now_refund: ends straight away and the most recent payment goes back to the member's card.
 * Administrators only, because it stops revenue and can move money. Every use is written to the audit log.
 */
export async function staffCancelMembership(form: FormData) {
  const userId = uuid.safeParse(form.get('user_id'));
  if (!userId.success) redirect('/admin/members?error=invalid');
  const back = `/admin/members/${userId.data}`;
  const subId = uuid.safeParse(form.get('subscription_id'));
  const when = WHEN.safeParse(form.get('when'));
  if (!subId.success || !when.success || form.get('sure') !== 'on') redirect(`${back}?error=cancel_confirm`);
  const supabase = await client();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminRole(await getRoles())) redirect(`${back}?error=denied`);

  const admin = createAdminClient();
  const { data: sub } = await admin.from('subscriptions')
    .select('id, stripe_subscription_id, status, trial_end, current_period_end')
    .eq('id', subId.data).eq('user_id', userId.data).maybeSingle();
  if (!sub || !['trialing', 'active', 'past_due', 'unpaid', 'paused'].includes(sub.status as string)) redirect(`${back}?error=cancel_none`);
  const stripeId = sub.stripe_subscription_id as string;

  let outcome: 'cancel_end' | 'cancel_now' | 'cancel_refunded' | 'cancel_norefund' | 'cancel_nopayment' | null = null;
  let refunded = 0;
  let endsAt: string | null = null;
  try {
    const stripe = await getStripe();
    if (when.data === 'period_end') {
      await stripe.subscriptions.update(stripeId, { cancel_at_period_end: true, metadata: { bayse_end_reason: 'staff_cancelled' } });
      endsAt = ((sub.status === 'trialing' ? sub.trial_end : null) ?? sub.current_period_end ?? null) as string | null;
      // Shown straight away; Stripe's own confirmation follows through the webhook.
      await admin.from('subscriptions').update({ cancel_at_period_end: true, cancel_at: endsAt }).eq('id', sub.id);
      outcome = 'cancel_end';
    } else {
      const ended = await stripe.subscriptions.cancel(stripeId, { prorate: false, invoice_now: false, cancellation_details: { comment: 'Cancelled by BAYSE staff in the back office' } });
      // Access stops straight away (entitlements follow the status through database triggers).
      await admin.from('subscriptions').update({ status: 'canceled', cancel_at_period_end: false, cancel_at: null }).eq('id', sub.id);
      outcome = 'cancel_now';
      if (when.data === 'now_refund') {
        outcome = 'cancel_norefund';
        try {
          const invoiceId = refId(ended.latest_invoice as string | { id: string } | null);
          refunded = invoiceId ? await refundInvoice(stripe, invoiceId) : 0;
          outcome = refunded > 0 ? 'cancel_refunded' : 'cancel_nopayment';
        } catch (e) {
          console.error('[staff-cancel] membership ended but the refund failed:', e instanceof Error ? e.message.slice(0, 200) : e);
        }
      }
    }
  } catch (e) {
    console.error('[staff-cancel] could not cancel in Stripe:', e instanceof Error ? e.message.slice(0, 200) : e);
  }
  if (!outcome) redirect(`${back}?error=cancel_failed`);

  await admin.from('cancellation_requests').update({ status: 'done', done_by: user.id, done_at: new Date().toISOString() }).eq('stripe_subscription_id', stripeId).eq('status', 'pending');
  await admin.from('audit_log').insert({ actor_id: user.id, action: 'membership.cancelled_by_staff', entity: 'subscriptions', entity_id: sub.id, detail: { member_id: userId.data, when: when.data, outcome, ends_at: endsAt, refunded_pence: refunded } });
  revalidatePath(back);
  redirect(`${back}?ok=${outcome}${refunded ? `&amount=${refunded}` : ''}`);
}
