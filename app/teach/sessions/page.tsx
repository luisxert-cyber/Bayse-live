import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { mySessions } from '@/lib/teach/data';
import { SessionCard } from '@/components/teach/SessionCard';

export const metadata = { title: 'My 1-to-1s' };

const OK: Record<string, string> = { accepted: 'Accepted. The member can now see the Zoom link.', declined: 'Declined. Any credit or payment goes back to the member.', cancelled: 'Cancelled. The member gets their credit or money back.', marked: 'Saved.' };

export default async function TeachSessions({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { me } = await requireInstructor();
  if (!me) return null;
  const sp = await searchParams;
  const supabase = await createClient();
  const all = await mySessions(me.id, { from: new Date(Date.now() - 60 * 864e5).toISOString(), limit: 200 });
  const now = Date.now();
  const requests = all.filter((s) => s.status === 'requested');
  const upcoming = all.filter((s) => s.status === 'confirmed' && new Date(s.starts_at).getTime() + s.minutes * 60000 > now);
  const past = all.filter((s) => !['requested'].includes(s.status) && new Date(s.starts_at).getTime() <= now).reverse();
  const joins = Object.fromEntries(await Promise.all(upcoming.map(async (s) => [s.id, (await supabase.rpc('private_session_join', { p_id: s.id })).data as string | null])));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My 1-to-1s</h1>
        <p className="mt-1 text-sm text-muted">40-minute private Zoom sessions. You earn the same for each one. Please mark each session completed or a no-show afterwards.</p>
      </div>
      {sp.ok && <Notice tone="success">{OK[sp.ok] ?? 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">{decodeURIComponent(sp.error)}</Notice>}
      <section><p className="mb-2 font-bold">Requests</p><ul className="divide-y divide-stone border border-stone">{requests.map((s) => <SessionCard key={s.id} s={s} back="/teach/sessions" />)}{!requests.length && <li className="p-4 text-sm text-muted">No requests waiting.</li>}</ul></section>
      <section><p className="mb-2 font-bold">Coming up</p><ul className="divide-y divide-stone border border-stone">{upcoming.map((s) => <SessionCard key={s.id} s={s} joinUrl={joins[s.id]} back="/teach/sessions" />)}{!upcoming.length && <li className="p-4 text-sm text-muted">Nothing booked.</li>}</ul></section>
      <section><p className="mb-2 font-bold">Past 60 days</p><ul className="divide-y divide-stone border border-stone">{past.map((s) => <SessionCard key={s.id} s={s} back="/teach/sessions" />)}{!past.length && <li className="p-4 text-sm text-muted">None yet.</li>}</ul></section>
    </div>
  );
}
