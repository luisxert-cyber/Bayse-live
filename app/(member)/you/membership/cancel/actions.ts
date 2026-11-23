'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/billing/stripe';
import { cancelPlan } from '@/lib/billing/cancel';

/**
 * A member cancels their membership from inside the app. Cancelling is never blocked: if the payment
 * system cannot be told straight away, the request is saved, the member is told it has been received,
 * and BAYSE finishes it by hand (it shows under "Needs you" in the back office).
 */
export async function cancelMembership() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/you/membership/cancel');
  const admin = createAdminClient();
  const { data: sub } = await admin.from('subscriptions')
    .select('id, stripe_subscription_id, status, trial_end, current_period_end, cancel_at_period_end, cancel_at')
    .eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!sub) redirect('/you/membership?cancel=none');
  if (sub.cancel_at_period_end || sub.cancel_at) redirect('/you/membership?cancel=already');

  const plan = cancelPlan(sub.status as string, sub.current_period_end as string | null, sub.trial_end as string | null);
  let applied = false;
  try {
    const stripe = await getStripe();
    await stripe.subscriptions.update(sub.stripe_subscription_id as string, plan.finalPayment
      ? { cancel_at: Math.floor(new Date(plan.endsAt).getTime() / 1000), metadata: { bayse_end_reason: 'member_cancelled' } }
      : { cancel_at_period_end: true, metadata: { bayse_end_reason: 'member_cancelled' } });
    applied = true;
  } catch (e) {
    console.error('[cancel] could not update the subscription in Stripe:', e instanceof Error ? e.message.slice(0, 200) : e);
  }

  if (applied) {
    // Shown straight away; Stripe's own confirmation follows through the webhook.
    await admin.from('subscriptions').update({ cancel_at_period_end: !plan.finalPayment, cancel_at: plan.endsAt }).eq('id', sub.id);
  } else {
    await admin.from('cancellation_requests').upsert({
      user_id: user.id, stripe_subscription_id: sub.stripe_subscription_id, ends_at: plan.endsAt, final_payment: plan.finalPayment, status: 'pending',
    }, { onConflict: 'stripe_subscription_id', ignoreDuplicates: true });
  }
  await admin.from('audit_log').insert({ actor_id: user.id, action: applied ? 'membership.cancelled' : 'membership.cancel_requested', entity: 'subscriptions', entity_id: sub.id, detail: { ends_at: plan.endsAt, final_payment: plan.finalPayment } });
  revalidatePath('/you/membership');
  redirect(`/you/membership?cancel=${applied ? 'done' : 'received'}`);
}
