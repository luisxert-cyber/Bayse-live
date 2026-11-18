import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import { stripeEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { HANDLED_EVENTS, isUuid, type StripeSubscriptionLike } from '@/lib/billing/stripe-map';
import { upsertSubscription, grantCreditForInvoice, invoiceSubscriptionId } from '@/lib/billing/sync';

// Stripe -> BAYSE. Every event is verified with the webhook signing secret, recorded once
// (idempotent on event id), then turned into subscription rows. Entitlements follow
// automatically through database triggers. Returning 500 makes Stripe retry.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let stripe: Stripe;
  let secret: string;
  try {
    stripe = await getStripe();
    secret = stripeEnv().webhookSecret;
  } catch (e) {
    console.error('[stripe] not configured:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: first writer wins. A replay of a processed event is acknowledged and skipped.
  const { data: seen } = await admin.from('stripe_events').select('processed_at').eq('id', event.id).maybeSingle();
  if (seen?.processed_at) return NextResponse.json({ received: true, duplicate: true });
  if (!seen) await admin.from('stripe_events').insert({ id: event.id, type: event.type });

  if (!HANDLED_EVENTS.has(event.type)) {
    await admin.from('stripe_events').update({ processed_at: new Date().toISOString() }).eq('id', event.id);
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.bayse_user_id ?? null;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        if (isUuid(userId) && customerId) {
          await admin.from('stripe_customers').upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
        }
        // One-off 1-to-1 payment: only a paid Checkout marks the session paid. If the session was
        // cancelled or declined while the member was paying, the money is flagged for refund.
        const privateId = session.metadata?.private_session_id;
        if (session.mode === 'payment' && isUuid(privateId) && session.payment_status === 'paid') {
          const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
          const { data: ps } = await admin.from('private_sessions').select('id, status, payment, member_id').eq('id', privateId).maybeSingle();
          if (ps && ps.member_id === userId && ps.payment === 'unpaid') {
            const live = ['requested', 'confirmed'].includes(ps.status);
            await admin.from('private_sessions').update({ payment: live ? 'paid' : 'refund_due', stripe_payment_intent: pi, stripe_checkout_id: session.id }).eq('id', ps.id).eq('payment', 'unpaid');
          }
          break;
        }
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(admin, sub as unknown as StripeSubscriptionLike);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await upsertSubscription(admin, event.data.object as unknown as StripeSubscriptionLike);
        break;
      case 'charge.refunded': {
        // A refund made in Stripe for a 1-to-1 marks it refunded (once; repeats change nothing).
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) await admin.from('private_sessions').update({ payment: 'refunded' }).eq('stripe_payment_intent', pi).in('payment', ['paid', 'refund_due']);
        break;
      }
      case 'invoice.paid': {
        // BAYSE Black: one private-session credit for each paid billing month.
        const invoice = event.data.object as unknown as Parameters<typeof grantCreditForInvoice>[1];
        const subId = invoiceSubscriptionId(invoice);
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await grantCreditForInvoice(admin, invoice, sub as unknown as StripeSubscriptionLike);
        }
        break;
      }
      case 'invoice.payment_failed':
        // Status moves to past_due through customer.subscription.updated. A reminder email is added with the email provider (Phase 3).
        break;
    }
    await admin.from('stripe_events').update({ processed_at: new Date().toISOString(), error: null }).eq('id', event.id);
    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[stripe] ${event.type} ${event.id} failed:`, message);
    await admin.from('stripe_events').update({ error: message.slice(0, 500) }).eq('id', event.id);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
