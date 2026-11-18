import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/billing/stripe';
import { upsertSubscription } from '@/lib/billing/sync';
import type { StripeSubscriptionLike } from '@/lib/billing/stripe-map';
import { fmtDate } from '@/lib/data/member';
import { Card, Notice, buttonClass } from '@/components/ui';
import { finishOnboarding } from '@/app/start/actions';

export const metadata = { title: 'Welcome to BAYSE' };
export const dynamic = 'force-dynamic';

// Where the in-app payment form lands when it finishes. The Checkout session is fetched from
// Stripe with the server's key and must belong to the signed-in member; only then is the
// membership written, so access is on by the time they tap through. The webhook does the same
// job in the background, so nothing depends on this page being reached.

export default async function JoinDone({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/join');
  const sessionId = sp.session_id;
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) redirect('/join');

  let complete = false;
  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    if (session.client_reference_id === user.id) {
      complete = session.status === 'complete';
      const sub = session.subscription;
      if (complete && sub && typeof sub !== 'string') {
        await upsertSubscription(createAdminClient(), sub as unknown as StripeSubscriptionLike);
      }
    }
  } catch (e) {
    // The webhook will still record the membership; this page only makes it instant.
    console.error('[join] could not confirm session:', e instanceof Error ? e.message : e);
    complete = true;
  }
  if (!complete) redirect('/join?checkout=open');

  const supabase = await createClient();
  const { data: subs } = await supabase.from('subscriptions')
    .select('status, trial_end, current_period_end, plans(name)')
    .eq('user_id', user.id).in('status', ['trialing', 'active']).order('created_at', { ascending: false }).limit(1);
  const s = ((subs ?? [])[0] ?? null) as unknown as null | { status: string; trial_end: string | null; current_period_end: string | null; plans: { name: string } | null };

  return (
    <div className="warm min-h-dvh">
      <main className="page space-y-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
        <h1 className="text-xl font-semibold">You&rsquo;re in</h1>
        {s ? (
          <Card>
            <p className="eyebrow">Membership</p>
            <p className="mt-2 font-medium">{s.plans?.name ?? 'BAYSE membership'}</p>
            <p className="mt-1 text-sm text-muted">
              {s.status === 'trialing' && s.trial_end
                ? `Your 7-day free trial has started. Nothing has been taken. Your first payment is on ${fmtDate(s.trial_end)}, and not at all if you cancel before then.`
                : s.current_period_end ? `Active. Renews on ${fmtDate(s.current_period_end)}.` : 'Active.'}
              {' '}You can change your card or cancel any time from You → Membership.
            </p>
          </Card>
        ) : (
          <Notice tone="success" title="Thank you">Your membership is being set up. It can take a few seconds to appear.</Notice>
        )}
        <form action={finishOnboarding}><button className={buttonClass('solid', true)}>Go to Today</button></form>
      </main>
    </div>
  );
}
