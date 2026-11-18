import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { money, ukDate, input, btn, btnSolid } from '@/lib/teach/format';
import { closePayRun, markPaid, saveSettings } from './actions';

export const metadata = { title: 'Instructor pay' };
export const dynamic = 'force-dynamic';

type Line = { instructor_id: string; instructor_name: string; sessions: number; late_cancellations: number; amount_pence: number };
type Period = { period_start: string; period_end: string };

const PayTable = ({ lines }: { lines: Line[] }) => (
  <table className="w-full text-sm">
    <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-normal">Instructor</th><th className="font-normal">1-to-1s</th><th className="font-normal">Late cancels</th><th className="text-right font-normal">Pay</th></tr></thead>
    <tbody>
      {lines.map((l) => <tr key={l.instructor_id} className="border-t border-stone"><td className="py-2">{l.instructor_name}</td><td>{l.sessions}</td><td>{l.late_cancellations}</td><td className="text-right font-bold">{money(l.amount_pence)}</td></tr>)}
      {!lines.length && <tr><td colSpan={4} className="py-4 text-center text-muted">No 1-to-1s in this period.</td></tr>}
      {lines.length > 0 && <tr className="border-t border-white"><td className="py-2 font-bold">Total</td><td>{lines.reduce((a, l) => a + l.sessions, 0)}</td><td>{lines.reduce((a, l) => a + l.late_cancellations, 0)}</td><td className="text-right font-bold">{money(lines.reduce((a, l) => a + l.amount_pence, 0))}</td></tr>}
    </tbody>
  </table>
);

export default async function Pay({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('pay');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: cur }, { data: prev }, { data: settings }, { data: runs }] = await Promise.all([
    supabase.rpc('pay_period', { p_offset: 0 }).single(),
    supabase.rpc('pay_period', { p_offset: -1 }).single(),
    supabase.from('booking_settings').select('*').single(),
    supabase.from('pay_runs').select('*, pay_run_lines(*, instructors(display_name))').order('period_start', { ascending: false }).limit(12),
  ]);
  const c = cur as Period | null; const p = prev as Period | null;
  const [{ data: curLines }, { data: prevLines }] = await Promise.all([
    c ? supabase.rpc('instructor_pay', { p_from: c.period_start, p_to: c.period_end }) : Promise.resolve({ data: [] }),
    p ? supabase.rpc('instructor_pay', { p_from: p.period_start, p_to: p.period_end }) : Promise.resolve({ data: [] }),
  ]);
  const prevClosed = runs?.some((r) => r.period_start === p?.period_start);
  const st = settings!;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Instructor pay</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Instructors earn {money(st.instructor_rate_pence)} per 1-to-1, paid every {st.pay_cycle_days} days. A session counts once it has happened{st.pay_late_cancellations ? ', and late cancellations (under the cut-off) are paid too' : ''}. Close a period to lock its figures, then mark it paid once the money has gone out.</p>
      </div>
      {sp.ok && <Notice tone="success">{sp.ok === 'closed' ? 'Pay run approved and locked.' : sp.ok === 'paid' ? 'Marked as paid.' : 'Settings saved.'}</Notice>}
      {sp.error && <Notice tone="error">{decodeURIComponent(sp.error)}</Notice>}

      {c && <section className="border border-stone p-4"><p className="font-bold">This period · {ukDate(c.period_start)} to {ukDate(c.period_end)}</p><p className="mb-2 text-xs text-muted">Running total so far. Changes as sessions happen.</p><PayTable lines={(curLines ?? []) as Line[]} /></section>}

      {p && !prevClosed && (
        <section className="border border-white p-4">
          <p className="font-bold">Last period · {ukDate(p.period_start)} to {ukDate(p.period_end)} · ready to approve</p>
          <PayTable lines={(prevLines ?? []) as Line[]} />
          <form action={closePayRun} className="mt-3"><input type="hidden" name="period_start" value={p.period_start} /><button className={btnSolid}>Approve and lock this pay run</button></form>
        </section>
      )}

      <section>
        <p className="mb-2 font-bold">Pay runs</p>
        <ul className="divide-y divide-stone border border-stone">
          {(runs ?? []).map((r) => {
            const total = (r.pay_run_lines ?? []).reduce((a: number, l: { amount_pence: number }) => a + l.amount_pence, 0);
            return (
              <li key={r.id} className="p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{ukDate(r.period_start)} to {ukDate(r.period_end)} · {money(total)}</p>
                  {r.status === 'paid' ? <span className="text-xs text-muted">Paid {r.paid_at ? ukDate(r.paid_at) : ''}</span> : <form action={markPaid}><input type="hidden" name="id" value={r.id} /><button className={btn}>Mark paid</button></form>}
                </div>
                <ul className="mt-1 text-xs text-muted">{(r.pay_run_lines ?? []).map((l: { instructor_id: string; sessions: number; amount_pence: number; instructors: { display_name: string } | null }) => <li key={l.instructor_id}>{l.instructors?.display_name}: {l.sessions} sessions · {money(l.amount_pence)}</li>)}</ul>
              </li>
            );
          })}
          {!runs?.length && <li className="p-6 text-center text-sm text-muted">No pay runs yet.</li>}
        </ul>
      </section>

      <form action={saveSettings} className="space-y-3 border border-stone p-4">
        <p className="font-bold">1-to-1 and pay settings</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">Price (non-members) £<input name="price" defaultValue={(st.price_pence / 100).toFixed(2)} className={input} /></label>
          <label className="grid gap-1 text-sm">Price (members) £<input name="member_price" defaultValue={(st.member_price_pence / 100).toFixed(2)} className={input} /></label>
          <label className="grid gap-1 text-sm">Instructor pay per 1-to-1 £<input name="instructor_rate" defaultValue={(st.instructor_rate_pence / 100).toFixed(2)} className={input} /></label>
          <label className="grid gap-1 text-sm">Cancel cut-off (hours)<input name="cancel_cutoff_hours" type="number" min={0} max={168} defaultValue={st.cancel_cutoff_hours} className={input} /></label>
          <label className="grid gap-1 text-sm">Minimum notice to book (hours)<input name="booking_notice_hours" type="number" min={0} max={168} defaultValue={st.booking_notice_hours} className={input} /></label>
          <label className="grid gap-1 text-sm">Book up to (days ahead)<input name="booking_window_days" type="number" min={1} max={180} defaultValue={st.booking_window_days} className={input} /></label>
          <label className="grid gap-1 text-sm">Credit lasts (months, incl. the first)<input name="credit_valid_months" type="number" min={1} max={12} defaultValue={st.credit_valid_months} className={input} /></label>
          <label className="grid gap-1 text-sm">A pay period started on<input name="pay_cycle_anchor" type="date" defaultValue={st.pay_cycle_anchor} className={input} /></label>
          <label className="flex items-center gap-2 text-sm sm:pt-6"><input type="checkbox" name="pay_late_cancellations" defaultChecked={st.pay_late_cancellations} />Pay instructors for late cancellations</label>
        </div>
        <p className="text-xs text-muted">Set “A pay period started on” to the first day of any of your real 28-day pay periods; every period follows from it.</p>
        <button className={btnSolid}>Save settings</button>
      </form>
    </div>
  );
}
