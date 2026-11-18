import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { STATUS, PAYMENT, money, ukDateTime, ukDate, btn, btnSolid } from '@/lib/teach/format';
import { cancelMySession, payForSession } from './actions';

export const metadata = { title: 'My 1-to-1s' };
export const dynamic = 'force-dynamic';

type S = { id: string; starts_at: string; minutes: number; status: string; payment: string; price_pence: number; instructor_note: string | null; cancel_reason: string | null; instructors: { display_name: string; slug: string } | null };

export default async function MySessions({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser('/you/sessions');
  const sp = await searchParams;
  const supabase = await createClient();
  await supabase.rpc('expire_unpaid_sessions');
  const [{ data }, { data: credits }, { data: settings }] = await Promise.all([
    supabase.from('private_sessions').select('id, starts_at, minutes, status, payment, price_pence, instructor_note, cancel_reason, instructors(display_name, slug)').order('starts_at', { ascending: false }).limit(50),
    supabase.from('coaching_credits').select('id, expires_at, session_id').gt('expires_at', new Date().toISOString()).order('expires_at'),
    supabase.from('booking_settings').select('cancel_cutoff_hours').single(),
  ]);
  const rows = (data ?? []) as unknown as S[];
  const now = Date.now();
  const upcoming = rows.filter((s) => ['requested', 'confirmed'].includes(s.status) && new Date(s.starts_at).getTime() + s.minutes * 60000 > now).reverse();
  const past = rows.filter((s) => !upcoming.includes(s));
  const joins = Object.fromEntries(await Promise.all(upcoming.filter((s) => s.status === 'confirmed').map(async (s) => [s.id, (await supabase.rpc('private_session_join', { p_id: s.id })).data as string | null])));
  const free = (credits ?? []).filter((c) => !c.session_id);
  const cutoff = settings?.cancel_cutoff_hours ?? 12;
  return (
    <main className="page space-y-6">
      <div>
        <p className="text-sm"><Link href="/you" className="text-muted">← You</Link></p>
        <h1 className="mt-2 text-2xl font-bold uppercase">My 1-to-1s</h1>
        <p className="mt-1 text-sm text-muted">45-minute private sessions on Zoom. Free to cancel up to {cutoff} hours before; after that the session is lost.</p>
      </div>
      {sp.booked === 'credit' && <Notice tone="success" title="Requested">Your free Personal Coaching session is reserved. Your instructor will confirm it shortly.</Notice>}
      {sp.booked === 'unpaid' && <Notice tone="warning" title="Request saved, payment not taken">Card payments for 1-to-1s are being switched on. Your time is held for 30 minutes; we will be in touch if it can’t be confirmed.</Notice>}
      {sp.paid && <Notice tone="success" title="Thank you">Payment received. Your instructor will confirm the session shortly. (It can take a minute to show as paid.)</Notice>}
      {sp.pay === 'off' && <Notice tone="warning">Card payments are not switched on yet.</Notice>}
      {sp.pay === 'cancelled' && <Notice tone="info">Payment cancelled. Your request is held for 30 minutes if you want to try again.</Notice>}
      {sp.cancelled && <Notice tone="success">{sp.cancelled === 'late_cancelled' ? `Cancelled. As it was under ${cutoff} hours before, the session can’t be refunded.` : 'Cancelled. Your credit or payment comes back to you.'}</Notice>}
      {sp.error && <Notice tone="error">{decodeURIComponent(sp.error)}</Notice>}

      {free.length > 0 && <Notice tone="info" title={`You have ${free.length} free Personal Coaching session${free.length > 1 ? 's' : ''}`}>Use {free.length > 1 ? 'them' : 'it'} by {ukDate(free[0].expires_at)}. <Link href="/instructors" className="underline">Choose an instructor</Link></Notice>}

      <section>
        <p className="mb-2 font-bold">Coming up</p>
        <ul className="divide-y divide-stone border border-stone">
          {upcoming.map((s) => {
            const late = new Date(s.starts_at).getTime() - now < cutoff * 3600000;
            return (
              <li key={s.id} className="space-y-2 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{ukDateTime(s.starts_at)} · {s.instructors?.display_name}</p>
                    <p className="text-xs text-muted">{STATUS[s.status]} · {PAYMENT[s.payment]}{s.payment === 'unpaid' ? ` · ${money(s.price_pence)}` : ''}</p>
                    {s.instructor_note && <p className="mt-1">“{s.instructor_note}”</p>}
                  </div>
                  {joins[s.id] && <a href={joins[s.id]!} target="_blank" rel="noopener noreferrer" className={btnSolid}>Join on Zoom</a>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.payment === 'unpaid' && s.status === 'requested' && <form action={payForSession}><input type="hidden" name="id" value={s.id} /><button className={btnSolid}>Pay {money(s.price_pence)}</button></form>}
                  <form action={cancelMySession}><input type="hidden" name="id" value={s.id} /><button className={btn}>{s.status === 'confirmed' && late ? 'Cancel (no refund)' : 'Cancel'}</button></form>
                </div>
              </li>
            );
          })}
          {!upcoming.length && <li className="p-4 text-sm text-muted">Nothing booked. <Link href="/instructors" className="underline">Book a 1-to-1</Link></li>}
        </ul>
      </section>
      {past.length > 0 && (
        <section>
          <p className="mb-2 font-bold">Past and cancelled</p>
          <ul className="divide-y divide-stone border border-stone">{past.map((s) => <li key={s.id} className="p-4 text-sm"><p>{ukDateTime(s.starts_at)} · {s.instructors?.display_name}</p><p className="text-xs text-muted">{STATUS[s.status]} · {PAYMENT[s.payment]}{s.cancel_reason ? ` · “${s.cancel_reason}”` : ''}</p></li>)}</ul>
        </section>
      )}
    </main>
  );
}
