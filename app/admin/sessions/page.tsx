import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { STATUS, PAYMENT, money, ukDateTime, input, btn, btnSolid } from '@/lib/teach/format';
import { markRefunded, grantCredit } from './actions';
import { respondSession, cancelSessionAsStaff } from '@/app/teach/actions';

export const metadata = { title: '1-to-1 sessions' };
export const dynamic = 'force-dynamic';

type S = { id: string; starts_at: string; status: string; payment: string; price_pence: number; member_note: string | null; cancel_reason: string | null;
  instructors: { display_name: string } | null; member: { display_name: string | null; email: string | null } | null };

const OK: Record<string, string> = { refunded: 'Marked as refunded.', credit: 'Credit added. The member can now book a free 1-to-1.', accepted: 'Confirmed.', declined: 'Declined.', cancelled: 'Cancelled.' };

export default async function Sessions({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('sessions');
  const sp = await searchParams;
  const supabase = await createClient();
  await supabase.rpc('expire_unpaid_sessions');
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const sel = 'id, starts_at, status, payment, price_pence, member_note, cancel_reason, instructors(display_name), member:profiles!private_sessions_member_id_fkey(display_name, email)';
  const [{ data: upcoming }, { data: refunds }, { data: credits }] = await Promise.all([
    supabase.from('private_sessions').select(sel).gte('starts_at', since).order('starts_at').limit(200),
    supabase.from('private_sessions').select(sel).eq('payment', 'refund_due').order('starts_at'),
    supabase.from('coaching_credits').select('id, session_id, expires_at').gt('expires_at', new Date().toISOString()),
  ]);
  const list = (upcoming ?? []) as unknown as S[];
  const due = (refunds ?? []) as unknown as S[];
  const unused = (credits ?? []).filter((c) => !c.session_id).length;
  const used = (credits ?? []).length - unused;
  const Row = ({ s }: { s: S }) => (
    <li className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
      <div>
        <p className="font-bold">{ukDateTime(s.starts_at)} · {s.instructors?.display_name}</p>
        <p>{s.member?.display_name ?? 'Member'} <span className="text-muted">{s.member?.email}</span></p>
        <p className="text-xs text-muted">{STATUS[s.status]} · {PAYMENT[s.payment]}{s.price_pence ? ` · ${money(s.price_pence)}` : ''}{s.cancel_reason ? ` · “${s.cancel_reason}”` : ''}</p>
        {s.member_note && <p className="mt-1 text-xs">Note: {s.member_note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {s.status === 'requested' && <form action={respondSession}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="accept" value="1" /><input type="hidden" name="back" value="/admin/sessions" /><button className={btnSolid} disabled={!['paid', 'credit', 'none'].includes(s.payment)}>Confirm</button></form>}
        {s.status === 'requested' && <form action={respondSession}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="accept" value="0" /><input type="hidden" name="back" value="/admin/sessions" /><button className={btn}>Decline</button></form>}
        {['requested', 'confirmed'].includes(s.status) && new Date(s.starts_at) > new Date() && <form action={cancelSessionAsStaff}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="back" value="/admin/sessions" /><button className={btn}>Cancel (credit/refund back)</button></form>}
        {s.payment === 'refund_due' && <form action={markRefunded}><input type="hidden" name="id" value={s.id} /><button className={btn}>Mark refunded</button></form>}
      </div>
    </li>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">1-to-1 sessions</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">40-minute private Zoom sessions. Members cancelling 12 hours or more before get their credit or money back; under 12 hours the session is lost. Personal Coaching credits last for the month they are given and one more.</p>
      </div>
      {sp.ok && <Notice tone="success">{OK[sp.ok] ?? 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">{sp.error === 'nomember' ? 'No member with that email.' : sp.error === 'email' ? 'Check the email.' : decodeURIComponent(sp.error)}</Notice>}
      <div className="grid gap-px border border-stone bg-stone sm:grid-cols-3">
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{list.filter((s) => s.status === 'requested').length}</p><p className="text-xs text-muted">Requests waiting</p></div>
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{unused}</p><p className="text-xs text-muted">Unused coaching credits</p></div>
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{used}</p><p className="text-xs text-muted">Credits booked (still valid)</p></div>
      </div>
      {due.length > 0 && (
        <section><p className="mb-2 font-bold">Refunds to make in Stripe</p><ul className="divide-y divide-stone border border-white">{due.map((s) => <Row key={s.id} s={s} />)}</ul></section>
      )}
      <section><p className="mb-2 font-bold">This week and coming up</p>
        <ul className="divide-y divide-stone border border-stone">{list.map((s) => <Row key={s.id} s={s} />)}{!list.length && <li className="p-6 text-center text-sm text-muted">No 1-to-1s booked yet.</li>}</ul>
      </section>
      <form action={grantCredit} className="grid gap-3 border border-stone p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <p className="font-bold sm:col-span-3">Give a free 1-to-1 credit</p>
        <label className="grid gap-1 text-sm">Member email<input name="email" type="email" required className={input} /></label>
        <label className="grid gap-1 text-sm">Reason (optional)<input name="note" maxLength={200} placeholder="Goodwill, tester…" className={input} /></label>
        <button className={btn}>Add credit</button>
      </form>
    </div>
  );
}
