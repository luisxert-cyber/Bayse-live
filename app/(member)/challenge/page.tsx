import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadChallenge, monthLabel } from '@/lib/challenge/data';
import { Card, Notice, buttonClass } from '@/components/ui';
import { joinChallenge, leaveChallenge } from './actions';

export const metadata = { title: 'Monthly challenge' };
export const dynamic = 'force-dynamic';

export default async function ChallengePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/challenge');
  const { challenge: c, allowed, joined, done, daysLeft, stats } = await loadChallenge(user.id);

  if (!c) {
    return (
      <main className="page space-y-5">
        <Link href="/today" className="text-sm text-muted hover:text-ink">← Today</Link>
        <h1 className="text-[30px] leading-none">Monthly challenge</h1>
        <Notice>There is no challenge set for this month yet. Check back soon.</Notice>
      </main>
    );
  }

  const count = Math.min(done, c.target);
  const complete = done >= c.target;
  const left = Math.max(0, c.target - done);
  const pct = Math.round((count / c.target) * 100);
  return (
    <main className="page space-y-5">
      <Link href="/today" className="text-sm text-muted hover:text-ink">← Today</Link>
      <div>
        <p className="eyebrow">{monthLabel(c.month)} challenge</p>
        <h1 className="mt-1 text-[30px] leading-none">{c.title}</h1>
        <p className="mt-2 text-muted">{c.blurb}</p>
      </div>

      {sp.joined && <Notice tone="success" title="You are in">Every session you finish this month now counts.</Notice>}
      {sp.error && <Notice tone="error">That did not work. Please try again.</Notice>}

      {!allowed ? (
        <Notice title="Challenges come with BAYSE Inner Circle">
          Monthly challenges are part of BAYSE Inner Circle and BAYSE Black. <Link href="/join" className="underline">See membership</Link>
        </Notice>
      ) : joined ? (
        <Card>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-4xl font-extrabold">{count}<span className="text-xl text-muted"> / {c.target}</span></p>
            <p className="text-sm text-muted">{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</p>
          </div>
          <div className="mt-3 h-3 w-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={c.target} aria-valuenow={count} aria-label="Sessions finished this month">
            <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-sm">{complete ? 'Challenge complete. Brilliant work: that is a month of showing up.' : `${left} more ${left === 1 ? 'session' : 'sessions'} to go. About ${Math.max(1, Math.ceil(left / Math.max(1, daysLeft / 7)))} a week from here.`}</p>
          {!complete && <Link href="/train" className={`${buttonClass('solid', true)} mt-4`}>Do a class now</Link>}
        </Card>
      ) : (
        <Card>
          <p className="font-semibold">Finish {c.target} sessions before the end of the month.</p>
          <p className="mt-1 text-sm text-muted">You have done {done} so far this month, and they all count. {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left.</p>
          <form action={joinChallenge} className="mt-4"><input type="hidden" name="id" value={c.id} /><button className={buttonClass('solid', true)}>Join the challenge</button></form>
        </Card>
      )}

      <Card>
        <p className="eyebrow">How it works</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>· Any class counts: timer classes, filmed classes, workouts you build and live classes you join.</li>
          <li>· A new challenge starts on the 1st of every month.</li>
          <li>· {stats.joined === 0 ? 'Be the first member to join this month.' : `${stats.joined} ${stats.joined === 1 ? 'member has' : 'members have'} joined${stats.finished ? `, and ${stats.finished} ${stats.finished === 1 ? 'has' : 'have'} already finished` : ''}.`}</li>
        </ul>
      </Card>

      {allowed && joined && !complete && (
        <form action={leaveChallenge}><input type="hidden" name="id" value={c.id} /><button className="w-full py-2 text-sm text-muted hover:text-ink">Leave this challenge</button></form>
      )}
    </main>
  );
}
