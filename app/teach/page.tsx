import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { mySessions, myClasses } from '@/lib/teach/data';
import { SessionCard } from '@/components/teach/SessionCard';
import { money } from '@/lib/teach/format';

export const metadata = { title: 'Instructor portal' };

export default async function TeachHome() {
  const { me } = await requireInstructor();
  if (!me) return null;
  const supabase = await createClient();
  const [sessions, classes, { data: period }] = await Promise.all([
    mySessions(me.id, { from: new Date(Date.now() - 864e5).toISOString(), limit: 50 }),
    myClasses(me.id),
    supabase.rpc('pay_period', { p_offset: 0 }).single(),
  ]);
  const p = period as { period_start: string; period_end: string } | null;
  const { data: pay } = p ? await supabase.rpc('instructor_pay', { p_from: p.period_start, p_to: p.period_end }) : { data: [] };
  const earned = ((pay ?? []) as { amount_pence: number }[]).reduce((a, x) => a + x.amount_pence, 0);
  const requests = sessions.filter((s) => s.status === 'requested');
  const upcoming = sessions.filter((s) => s.status === 'confirmed' && new Date(s.starts_at) > new Date()).slice(0, 5);
  const joins = Object.fromEntries(await Promise.all(upcoming.map(async (s) => [s.id, (await supabase.rpc('private_session_join', { p_id: s.id })).data as string | null])));
  const thisWeek = classes.filter((c) => c.daysAhead < 7);
  const profileTodo = !me.photos?.length || !me.bio;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hi {me.display_name.split(' ')[0]}</h1>
      {me.status !== 'published' && (
        <Notice tone="warning" title={me.status === 'pending' ? 'Your profile is waiting for approval' : 'Your profile is not on the website yet'}>
          {me.status === 'pending' ? 'BAYSE will check it and publish it shortly.' : <>Add photos and a short bio, then send it for approval. <Link href="/teach/profile" className="underline">Finish my profile</Link></>}
        </Notice>
      )}
      {me.status === 'published' && profileTodo && <Notice tone="info">Add photos and a bio so members can get to know you. <Link href="/teach/profile" className="underline">My profile</Link></Notice>}
      <div className="grid gap-px border border-stone bg-stone sm:grid-cols-3">
        <Link href="/teach/sessions" className="bg-bg p-4 hover:bg-surface"><p className="text-2xl font-bold">{requests.length}</p><p className="text-xs text-muted">1-to-1 requests to answer</p></Link>
        <Link href="/teach/classes" className="bg-bg p-4 hover:bg-surface"><p className="text-2xl font-bold">{thisWeek.length}</p><p className="text-xs text-muted">Live classes in the next 7 days</p></Link>
        <Link href="/teach/pay" className="bg-bg p-4 hover:bg-surface"><p className="text-2xl font-bold">{money(earned)}</p><p className="text-xs text-muted">Earned this pay period</p></Link>
      </div>
      {requests.length > 0 && <section><p className="mb-2 font-bold">Requests</p><ul className="divide-y divide-stone border border-white">{requests.map((s) => <SessionCard key={s.id} s={s} back="/teach" />)}</ul></section>}
      <section><p className="mb-2 font-bold">Next 1-to-1s</p>
        <ul className="divide-y divide-stone border border-stone">{upcoming.map((s) => <SessionCard key={s.id} s={s} joinUrl={joins[s.id]} back="/teach" />)}{!upcoming.length && <li className="p-4 text-sm text-muted">None booked yet. Members can book you once your profile is live and you have <Link href="/teach/availability" className="underline">availability</Link> set.</li>}</ul>
      </section>
      <section><p className="mb-2 font-bold">Live classes this week</p>
        <ul className="divide-y divide-stone border border-stone">{thisWeek.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span><b>{c.nextDate} {c.starts_at.slice(0, 5)}</b> · {c.name}{c.lead ? ' · lead' : ''}</span>{c.joinUrl && <a href={c.joinUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline">Zoom link</a>}</li>)}{!thisWeek.length && <li className="p-4 text-sm text-muted">No live classes assigned to you this week.</li>}</ul>
      </section>
    </div>
  );
}
