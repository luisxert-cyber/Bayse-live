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
const LINK: Record<string, string> = { pending: 'Waiting for your studio to confirm', verified: 'Confirmed', rejected: 'Not confirmed: please speak to your studio', ended: 'Ended' };

export default async function Membership({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/you/membership');
  const m = await loadMember(user.id);
  const s = m.subscription;
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
            {s.trial_end && s.status === 'trialing' && <p className="text-sm text-muted">Trial ends {fmtDate(s.trial_end)}. You can cancel before then and you will not be charged.</p>}
            {s.cancel_at_period_end && s.current_period_end && <p className="text-sm text-muted">Set to end on {fmtDate(s.current_period_end)}.</p>}
            <form action={openBillingPortal} className="pt-3"><button className={buttonClass('secondary')}>Manage billing, card or cancel</button></form>
          </div>
        ) : (
          <div className="mt-2"><p className="text-sm text-muted">No digital membership.</p><Link href="/start/membership" className={`${buttonClass('primary')} mt-3`}>Choose a membership</Link></div>
        )}
      </Card>
      <Card>
        <p className="eyebrow">Studio membership</p>
        {m.links.length ? m.links.map((l, i) => (
          <p key={i} className="mt-2 text-sm"><span className="font-medium">{l.studios?.name}</span> · {LINK[l.status] ?? l.status}</p>
        )) : <p className="mt-2 text-sm text-muted">Not linked. <Link href="/start/studio" className="text-ink underline">Link my studio membership</Link></p>}
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
