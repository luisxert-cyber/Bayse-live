import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, buttonClass } from '@/components/ui';
import { fmtDate } from '@/lib/data/member';
import { cancelPlan } from '@/lib/billing/cancel';
import { SUPPORT_EMAIL } from '@/lib/site/offer';
import { cancelMembership } from './actions';

export const metadata = { title: 'Cancel membership' };
export const dynamic = 'force-dynamic';

// One clear screen: what happens, on which date, and one button. No questions, no hoops.
export default async function Cancel() {
  const user = await requireUser('/you/membership/cancel');
  const supabase = await createClient();
  const { data: sub } = await supabase.from('subscriptions')
    .select('status, trial_end, current_period_end, cancel_at_period_end, cancel_at, plans(name)')
    .eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!sub) redirect('/you/membership?cancel=none');
  if (sub.cancel_at_period_end || sub.cancel_at) redirect('/you/membership?cancel=already');
  const plan = cancelPlan(sub.status as string, sub.current_period_end as string | null, sub.trial_end as string | null);
  const name = (sub.plans as unknown as { name: string } | null)?.name ?? 'your membership';
  return (
    <main className="page space-y-5">
      <Link href="/you/membership" className="text-sm text-muted hover:text-ink">← Membership</Link>
      <h1 className="text-xl font-semibold">Cancel {name}</h1>
      <Card data-cancel-summary>
        {plan.trial ? (
          <>
            <p className="font-medium">You will not be charged.</p>
            <p className="mt-2 text-sm text-muted">Your free trial carries on until <strong className="text-ink">{fmtDate(plan.endsAt)}</strong> and then ends. No payment is taken.</p>
          </>
        ) : plan.finalPayment ? (
          <>
            <p className="font-medium">Your membership ends on {fmtDate(plan.endsAt)}.</p>
            <p className="mt-2 text-sm text-muted">Cancelling needs 28 days’ notice. Your next payment on <strong className="text-ink">{fmtDate(plan.finalPaymentOn!)}</strong> is your last, and you keep everything until <strong className="text-ink">{fmtDate(plan.endsAt)}</strong>. Nothing is taken after that.</p>
          </>
        ) : (
          <>
            <p className="font-medium">Your membership ends on {fmtDate(plan.endsAt)}.</p>
            <p className="mt-2 text-sm text-muted">No more payments are taken. You keep everything until then.</p>
          </>
        )}
        <form action={cancelMembership} className="mt-5 space-y-2">
          <button className={buttonClass('danger', true)}>Cancel my membership</button>
          <Link href="/you/membership" className={buttonClass('secondary', true)}>Keep my membership</Link>
        </form>
      </Card>
      <p className="text-xs text-muted">Joined in the last 14 days, or need to leave sooner because your circumstances have changed? Email <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a> and we will sort it out. Your plan, progress and community posts stay on your account if you come back.</p>
    </main>
  );
}
