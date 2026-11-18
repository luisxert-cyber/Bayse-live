import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, fmtDate } from '@/lib/data/member';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';
import { ProfileForm } from '@/components/you/ProfileForm';
import { ukDateTime } from '@/lib/teach/format';
import { cancelBooking, joinClass } from '../live/actions';
import { cancelMySession } from './sessions/actions';
import { openBillingPortal } from './actions';

export const metadata = { title: 'You' };
export const dynamic = 'force-dynamic';

const ROWS = [
  { href: '/you/progress', label: 'Progress, points and rewards' },
  { href: '/nourish', label: 'Nutrition: recipes and shopping list' },
  { href: '/you/personalise', label: 'Personalise BAYSE' },
  { href: '/you/health', label: 'Health check and safety' },
  { href: '/you/devices', label: 'My devices' },
  { href: '/you/privacy', label: 'Privacy and your data' },
];
const SUB: Record<string, string> = { trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', unpaid: 'Unpaid', paused: 'Paused' };

type Slot = { class_id: string; class_date: string; starts_at: string; name: string; minutes: number; starts_ts: string; mine: boolean; state: string };
type Session = { id: string; starts_at: string; minutes: number; status: string; instructors: { display_name: string } | null };

// You: the member's hub. Everything booked, with cancel; membership and billing; then settings.
export default async function You({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser('/you');
  const sp = await searchParams;
  const supabase = await createClient();
  const [m, { data: sched }, { data: priv }, { data: settings }, { data: credits }] = await Promise.all([
    loadMember(user.id),
    supabase.rpc('live_schedule', { p_days: 14 }),
    supabase.from('private_sessions').select('id, starts_at, minutes, status, instructors(display_name)').eq('member_id', user.id).in('status', ['requested', 'confirmed']).order('starts_at').limit(20),
    supabase.from('booking_settings').select('cancel_cutoff_hours').single(),
    supabase.from('coaching_credits').select('id, expires_at, session_id').gt('expires_at', new Date().toISOString()).order('expires_at'),
  ]);
  const now = Date.now();
  const cutoff = settings?.cancel_cutoff_hours ?? 12;
  const classes = ((sched ?? []) as Slot[]).filter((s) => s.mine && s.state !== 'finished');
  const sessions = ((priv ?? []) as unknown as Session[]).filter((s) => new Date(s.starts_at).getTime() + s.minutes * 60000 > now);
  const items = [
    ...classes.map((c) => ({ kind: 'class' as const, at: new Date(c.starts_ts).getTime(), c })),
    ...sessions.map((s) => ({ kind: 'session' as const, at: new Date(s.starts_at).getTime(), s })),
  ].sort((a, b) => a.at - b.at);
  const sub = m.subscription && !['canceled', 'incomplete', 'incomplete_expired'].includes(m.subscription.status) ? m.subscription : null;
  const free = (credits ?? []).filter((c) => !c.session_id);

  return (
    <main className="page space-y-5">
      <h1 className="text-xl font-semibold">You</h1>
      {sp.cancelled === 'class' && <Notice tone="success">Class booking cancelled.</Notice>}
      {sp.cancelled && sp.cancelled !== 'class' && <Notice tone="success">{sp.cancelled === 'late_cancelled' ? `1-to-1 cancelled. As it was under ${cutoff} hours before, the session can’t be refunded.` : '1-to-1 cancelled. Your credit or payment comes back to you.'}</Notice>}
      {sp.error && <Notice tone="error">{sp.error}</Notice>}

      <section id="bookings" className="scroll-mt-4">
        <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[0.1em]">My bookings</h2><Link href="/live" className="text-sm underline">Book a class</Link></div>
        {items.length ? (
          <ul className="divide-y divide-stone border border-stone">
            {items.map((it) => it.kind === 'class' ? (
              <li key={`c-${it.c.class_id}-${it.c.class_date}`} className="flex items-center gap-3 p-4">
                <span className="min-w-0 flex-1"><span className="block font-semibold">{ukDateTime(it.c.starts_ts)}</span><span className="text-sm text-muted">Live class · {it.c.name} · {it.c.minutes} min</span></span>
                {it.c.state === 'cancelled' ? <span className="text-xs font-bold uppercase text-clay">Class cancelled</span>
                  : it.c.state === 'open'
                    ? <form action={joinClass}><input type="hidden" name="class_id" value={it.c.class_id} /><input type="hidden" name="class_date" value={it.c.class_date} /><button className={`${buttonClass('solid')} !min-h-[38px] !px-4 text-sm`}>Join now</button></form>
                    : <form action={cancelBooking}><input type="hidden" name="class_id" value={it.c.class_id} /><input type="hidden" name="class_date" value={it.c.class_date} /><input type="hidden" name="back" value="/you" /><button className="px-2 py-2 text-sm text-muted underline">Cancel</button></form>}
              </li>
            ) : (
              <li key={`s-${it.s.id}`} className="flex items-center gap-3 p-4">
                <span className="min-w-0 flex-1"><span className="block font-semibold">{ukDateTime(it.s.starts_at)}</span><span className="text-sm text-muted">1-to-1 · {it.s.instructors?.display_name ?? 'Instructor'} · {it.s.status === 'confirmed' ? 'confirmed' : 'waiting for your instructor'}</span></span>
                <form action={cancelMySession}><input type="hidden" name="id" value={it.s.id} /><input type="hidden" name="back" value="/you" /><button className="px-2 py-2 text-sm text-muted underline">{it.s.status === 'confirmed' && it.at - now < cutoff * 3600000 ? 'Cancel (no refund)' : 'Cancel'}</button></form>
              </li>
            ))}
          </ul>
        ) : <p className="border border-dashed border-stone p-4 text-sm text-muted">Nothing booked yet. <Link href="/live" className="underline">Book a live class</Link> or <Link href="/instructors" className="underline">a 1-to-1</Link>.</p>}
        <p className="mt-2 text-xs text-muted">Live classes can be cancelled any time. 1-to-1s are free to cancel up to {cutoff} hours before. <Link href="/you/sessions" className="underline">All my 1-to-1s</Link></p>
      </section>

      <Card>
        <p className="eyebrow">Membership</p>
        {sub ? (
          <div className="mt-2 space-y-1">
            <p className="font-medium">{sub.plans?.name ?? 'BAYSE membership'} · {SUB[sub.status] ?? sub.status}</p>
            {sub.status === 'trialing' && sub.trial_end && <p className="text-sm text-muted">Free trial until {fmtDate(sub.trial_end)}. Your first payment is taken then.</p>}
            {sub.status !== 'trialing' && sub.current_period_end && <p className="text-sm text-muted">{sub.cancel_at_period_end ? 'Ends on' : 'Next payment'} {fmtDate(sub.current_period_end)}.</p>}
            {free.length > 0 && <p className="text-sm text-muted">{free.length} free Personal Coaching session{free.length > 1 ? 's' : ''} to use. <Link href="/instructors" className="underline">Choose an instructor</Link></p>}
            <div className="flex flex-wrap gap-2 pt-3">
              <form action={openBillingPortal}><button className={`${buttonClass('secondary')} !min-h-[40px] !px-4 text-sm`}>Card, invoices or cancel</button></form>
              <Link href="/you/membership" className={`${buttonClass('quiet')} !min-h-[40px] !px-4 text-sm`}>Membership details</Link>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-muted">{m.entitlements.size ? 'You have access through a BAYSE code or your studio membership.' : 'You do not have a membership yet.'}</p>
            <Link href="/you/membership" className={`${buttonClass('secondary')} mt-3 !min-h-[40px] !px-4 text-sm`}>{m.entitlements.size ? 'Membership details' : 'See memberships'}</Link>
          </div>
        )}
      </Card>

      <Card>
        <p className="eyebrow mb-4">Profile</p>
        <ProfileForm firstName={m.profile?.first_name ?? ''} displayName={m.profile?.display_name ?? ''} />
        <p className="mt-4 text-sm text-muted">Signed in as {user.email}</p>
      </Card>
      <Card className="p-0">
        <ul className="divide-y divide-stone">
          {ROWS.map((r) => (
            <li key={r.href}><Link href={r.href} className="flex min-h-[56px] items-center justify-between px-5 hover:bg-stone/30">{r.label}<span aria-hidden className="text-muted">›</span></Link></li>
          ))}
        </ul>
      </Card>
      <form action="/auth/sign-out" method="post"><button className="w-full py-3 text-sm text-muted hover:text-ink">Sign out</button></form>
    </main>
  );
}
