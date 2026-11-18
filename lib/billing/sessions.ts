import 'server-only';
import { getStripe } from '@/lib/billing/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteOrigin } from '@/lib/supabase/link';

/**
 * Stripe Checkout for one unpaid 1-to-1 (one-off payment). Returns the Checkout URL,
 * or null when card payments are not switched on yet (no Stripe keys).
 * Payment is only recorded by the signed webhook, never by the redirect back.
 */
export async function sessionCheckoutUrl(sessionId: string, userId: string, email: string | undefined): Promise<string | null> {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  const admin = createAdminClient();
  const { data: s } = await admin.from('private_sessions').select('id, member_id, price_pence, payment, status, starts_at, instructors(display_name)').eq('id', sessionId).maybeSingle();
  if (!s || s.member_id !== userId || s.payment !== 'unpaid' || s.status !== 'requested' || s.price_pence <= 0) return null;
  const { data: cust } = await admin.from('stripe_customers').select('stripe_customer_id').eq('user_id', userId).maybeSingle();
  const stripe = await getStripe();
  const base = await siteOrigin();
  const who = (s.instructors as unknown as { display_name: string } | null)?.display_name ?? 'BAYSE';
  const when = new Date(s.starts_at).toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: 'gbp', unit_amount: s.price_pence, product_data: { name: `BAYSE 1-to-1 Zoom session · 45 min`, description: `${who} · ${when}` } } }],
    client_reference_id: userId,
    ...(cust ? { customer: cust.stripe_customer_id } : { customer_email: email, customer_creation: 'always' as const }),
    metadata: { bayse_user_id: userId, private_session_id: s.id },
    payment_intent_data: { metadata: { bayse_user_id: userId, private_session_id: s.id } },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${base}/you/sessions?paid=1`,
    cancel_url: `${base}/you/sessions?pay=cancelled`,
  });
  await admin.from('private_sessions').update({ stripe_checkout_id: checkout.id }).eq('id', s.id);
  return checkout.url;
}
