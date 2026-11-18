import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, fmtDate } from '@/lib/data/member';
import { Card, Notice, buttonClass } from '@/components/ui';
import { openBillingPortal } from '../actions';

export const metadata = { title: 'Membership' };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', unpaid: 'Unpaid', canceled: 'Cancelled',
  incomplete: 'Not completed', incomplete_expired: 'Expired', paused: 'Paused',
};

export default async function Membership({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/you/membership');
  const m = await loadMember(user.id);
  const returning = Boolean(m.subscription);
  // A finished membership (cancelled, expired) is shown like no membership, with a way back in.
  const s = m.subscription && !['canceled', 'incomplete', 'incomplete_expired'].includes(m.subscription.status) ? m.subscription : null;
  return (
    <main className="page space-y-5">
      <Link href="/you" className="text-sm text-muted hover:text-ink">← You</Link>
      <h1 className="text-xl font-semibold">Membership and billing</h1>
      {sp.error === 'portal' && <Notice tone="error">We could not open billing right now. Please try again.</Notice>}
      {sp.error === 'no_customer' && <Notice>You do not have a paid membership yet.</Notice>}
      {sp.already && <Notice>You already have an active membership.</Notice>}
      <Card>
        <p className="eyebrow">Digital membership</p>
        {s ? (
          <div className="mt-2 space-y-1">
            <p className="font-medium">{s.plans?.name ?? 'BAYSE membership'} · {STATUS[s.status] ?? s.status}</p>
            {s.trial_end && s.status === 'trialing' && <p className="text-sm text-muted">Free trial until {fmtDate(s.trial_end)}. Your first payment is taken then. You can cancel before then and you will not be charged.</p>}
            {s.cancel_at_period_end && s.current_period_end && <p className="text-sm text-muted">Set to end on {fmtDate(s.current_period_end)}.</p>}
            <form action={openBillingPortal} className="pt-3"><button className={buttonClass('secondary')}>Manage billing, card or cancel</button></form>
          </div>
        ) : (
          <div className="mt-2">
            {returning ? (
              <><p className="font-medium">Your membership has ended</p><p className="mt-1 text-sm text-muted">Choose a membership to carry on. Your plan and progress are saved.</p></>
            ) : (
              <><p className="font-medium">Start your 7-day free trial</p><p className="mt-1 text-sm text-muted">Choose a membership and add your card. Nothing is taken for 7 days, and you can cancel any time before then.</p></>
            )}
            <Link href="/join" className={`${buttonClass('primary')} mt-3`}>{returning ? 'Choose a membership' : 'Start free trial'}</Link>
          </div>
        )}
      </Card>
      <Card>
        <p className="eyebrow">Have a BAYSE code?</p>
        <p className="mt-2 text-sm text-muted">Choose a membership, then tap &ldquo;Add promotion code&rdquo; on the payment step.</p>
      </Card>
      <Card>
        <p className="eyebrow">What you can use</p>
        {m.entitlements.size ? (
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">{[...m.entitlements].sort().map((k) => <li key={k}>· {k.replace(/_/g, ' ')}</li>)}</ul>
        ) : <p className="mt-2 text-sm text-muted">Nothing switched on yet.</p>}
      </Card>
    </main>
  );
}
