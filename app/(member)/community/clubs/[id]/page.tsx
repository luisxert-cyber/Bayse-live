import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, eventTime, namesFor, when } from '@/lib/community/data';
import { CLUB, LEVEL } from '@/lib/community/clubs';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { ReportBlock } from '@/components/community/ReportBlock';
import { joinActivity, leaveActivity, cancelActivity, sendMessage } from '../../actions';

export const metadata = { title: 'Activity' };
export const dynamic = 'force-dynamic';

export default async function Activity({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string; ok?: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/community/clubs/${id}`);
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data: a } = await supabase.from('activities').select('*').eq('id', id).maybeSingle();
  if (!a) notFound();
  const back = `/community/clubs/${id}`;
  const host = a.host_id === user.id;
  const [{ data: counts }, { data: rsvps }, { data: msgs }] = await Promise.all([
    supabase.rpc('activity_counts', { p_ids: [id] }),
    supabase.from('activity_rsvps').select('user_id, status').eq('activity_id', id).in('status', ['going', 'waitlist']).order('updated_at'),
    supabase.from('activity_messages').select('id, author_id, body, created_at').eq('activity_id', id).order('created_at').limit(200),
  ]);
  const c = ((counts ?? []) as { going: number; waiting: number }[])[0] ?? { going: 0, waiting: 0 };
  const mine = (rsvps ?? []).find((r) => r.user_id === user.id)?.status as string | undefined;
  const participant = host || Boolean(mine);
  const names = await namesFor([a.host_id, ...(rsvps ?? []).map((r) => r.user_id as string), ...(msgs ?? []).map((m) => m.author_id as string)]);
  const nm = (u: string) => (u === user.id ? 'You' : names.get(u) ?? 'BAYSE member');
  const going = (rsvps ?? []).filter((r) => r.status === 'going'), waiting = (rsvps ?? []).filter((r) => r.status === 'waitlist');
  const full = a.capacity != null && c.going >= a.capacity;
  const open = a.status === 'open' && new Date(a.starts_at) > new Date();
  const facts = [
    eventTime(a.starts_at),
    `${a.venue_name}${a.venue_area ? `, ${a.venue_area}` : ''}`,
    a.level ? LEVEL[a.level] : null,
    a.kind === 'padel' && a.padel_format ? `Format: ${a.padel_format}` : null,
    a.kind === 'walk' && a.distance_km ? `${a.distance_km} km${a.pace ? `, ${a.pace} pace` : ''}` : null,
    a.repeats_weekly ? 'Every week' : null,
  ].filter(Boolean) as string[];

  return (
    <CommunityShell active="/community/clubs" title={a.title} e={sp.e} ok={sp.ok}>
      <Link href="/community/clubs" className="text-sm text-muted hover:text-ink">← All activities</Link>
      <div className="rounded-card border border-stone bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{CLUB[a.kind]?.icon} {CLUB[a.kind]?.label} · hosted by {nm(a.host_id)}</p>
          {!host && <ReportBlock targetType="activity" targetId={a.id} userId={a.host_id} name={nm(a.host_id)} back={back} />}
        </div>
        {a.status === 'cancelled' && <p className="mt-2 rounded-xl bg-bg px-3 py-2 text-sm font-semibold">This activity has been cancelled.</p>}
        <ul className="mt-2 space-y-1 text-sm">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
        {a.description && <p className="mt-3 whitespace-pre-wrap text-sm">{a.description}</p>}
        <p className="mt-3 font-semibold">{c.going}{a.capacity ? `/${a.capacity}` : ''} going{c.waiting ? ` · ${c.waiting} waiting` : ''}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {open && !host && !mine && (
            <form action={joinActivity}><input type="hidden" name="activity_id" value={a.id} /><input type="hidden" name="back" value={back} />
              <button className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-bg">{full ? 'Join the waiting list' : 'Join'}</button></form>
          )}
          {open && !host && mine && (
            <form action={leaveActivity}><input type="hidden" name="activity_id" value={a.id} /><input type="hidden" name="back" value={back} />
              <button className="rounded-full border border-stone px-5 py-2 text-sm">{mine === 'waitlist' ? 'Leave the waiting list' : 'I can’t make it'}</button></form>
          )}
          {open && host && (
            <form action={cancelActivity}><input type="hidden" name="activity_id" value={a.id} /><input type="hidden" name="back" value={back} />
              <button className="rounded-full border border-stone px-5 py-2 text-sm">Cancel this activity</button></form>
          )}
        </div>
        {mine === 'waitlist' && <p className="mt-2 text-sm text-muted">You&rsquo;re on the waiting list. If a place frees up it&rsquo;s yours automatically.</p>}
      </div>

      {participant ? (
        <>
          <section className="space-y-1 text-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Who&rsquo;s going</h2>
            <p>{going.map((r) => nm(r.user_id)).join(', ') || '—'}</p>
            {waiting.length > 0 && <p className="text-muted">Waiting: {waiting.map((r) => nm(r.user_id)).join(', ')}</p>}
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Group chat</h2>
            <ul className="space-y-2">
              {(msgs ?? []).map((m) => (
                <li key={m.id} className="rounded-xl bg-surface px-3 py-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p><span className="font-semibold">{nm(m.author_id)}</span> <span className="text-muted">· {when(m.created_at)}</span></p>
                    {m.author_id !== user.id && <ReportBlock targetType="activity_message" targetId={m.id} userId={m.author_id} name={nm(m.author_id)} back={back} />}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words">{m.body}</p>
                </li>
              ))}
              {!(msgs ?? []).length && <li className="text-sm text-muted">No messages yet. Say hello and sort out the details.</li>}
            </ul>
            {a.status === 'open' && (
              <form action={sendMessage} className="flex gap-2">
                <input type="hidden" name="activity_id" value={a.id} /><input type="hidden" name="back" value={back} />
                <label htmlFor="msg" className="sr-only">Message</label>
                <input id="msg" name="body" required maxLength={1000} placeholder="Message the group" className="w-full rounded-[10px] border border-stone bg-bg px-3 py-2 text-base" />
                <button className="rounded-full bg-ink px-4 text-sm font-bold text-bg">Send</button>
              </form>
            )}
          </section>
        </>
      ) : <p className="text-sm text-muted">Join to see who&rsquo;s going and chat with the group.</p>}
    </CommunityShell>
  );
}
