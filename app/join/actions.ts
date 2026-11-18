'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/billing/stripe';
import { isUuid } from '@/lib/billing/stripe-map';
import { trialDaysFor } from '@/lib/billing/trial-math';
import { hasAccount } from '@/lib/auth/account';
import { siteOrigin } from '@/lib/supabase/link';

export type CheckoutStart =
  | { clientSecret: string; error?: undefined }
  | { clientSecret?: undefined; error: 'signin' | 'price' | 'not_connected' | 'already' | 'failed' };

/**
 * Starts the in-app payment form (Stripe embedded Checkout: card, Apple Pay, Google Pay) for one price.
 * - First membership: a 7-day free trial. Card details are saved as the commitment, nothing is taken
 *   today, and the first payment is taken when the trial ends unless they cancel.
 * - Coming back after a previous membership: no second trial, the first payment is taken now.
 * BAYSE codes go in the "Add promotion code" box; a free-membership code means no charge.
 * The membership itself is only ever recorded from Stripe (webhook / verified session), never from the browser.
 */
export async function createMembershipCheckout(priceId: string): Promise<CheckoutStart> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !hasAccount(user)) return { error: 'signin' };
  if (!isUuid(priceId)) return { error: 'price' };

  const [{ data: price }, { data: subs }, { data: customer }] = await Promise.all([
    supabase.from('prices').select('id, stripe_price_id, trial_days').eq('id', priceId).eq('active', true).maybeSingle(),
    supabase.from('subscriptions').select('status').eq('user_id', user.id),
    supabase.from('stripe_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!price?.stripe_price_id) return { error: 'not_connected' };
  if ((subs ?? []).some((s) => ['trialing', 'active', 'past_due'].includes(s.status as string))) return { error: 'already' };

  const trialDays = trialDaysFor((subs ?? []).length > 0, price.trial_days as number);
  const onTrial = trialDays > 0;
  const email = user.email ?? user.new_email ?? undefined;

  let stripe: Awaited<ReturnType<typeof getStripe>>;
  try {
    stripe = await getStripe();
  } catch (e) {
    console.error('[join] payments not configured:', e instanceof Error ? e.message : e);
    return { error: 'not_connected' };
  }

  try {
    const base = await siteOrigin();
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{ price: price.stripe_price_id, quantity: 1 }],
      client_reference_id: user.id,
      ...(customer ? { customer: customer.stripe_customer_id as string } : { customer_email: email }),
      subscription_data: { ...(onTrial ? { trial_period_days: trialDays } : {}), metadata: { bayse_user_id: user.id } },
      metadata: { bayse_user_id: user.id },
      allow_promotion_codes: true,
      // A trial always saves a payment method: that is the commitment, and it lets the membership
      // start when the trial ends. Without a trial, a 100%-off BAYSE code needs no card at all.
      payment_method_collection: onTrial ? 'always' : 'if_required',
      return_url: `${base}/join/done?session_id={CHECKOUT_SESSION_ID}`,
    });
    if (!session.client_secret) return { error: 'failed' };
    return { clientSecret: session.client_secret };
  } catch (e) {
    console.error('[join] could not start checkout:', e instanceof Error ? e.message : e);
    return { error: 'failed' };
  }
}

/**
 * TEMPORARY test-mode button on /join: skips payment and gives the signed-in account every
 * entitlement for 7 days, as a manual grant (the same kind BAYSE gives by hand). The database
 * function does the work and refuses unless the test_mode flag is on, so no service key is needed.
 * No Stripe customer, card or subscription is created.
 */
export async function enterTestMode(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !hasAccount(user)) redirect('/sign-in?next=/join');
  const { data, error } = await supabase.rpc('start_test_access');
  if (error) console.error('[join] test mode could not give access:', error.message);
  redirect(!error && data === true ? '/today' : '/join?test=failed');
}
