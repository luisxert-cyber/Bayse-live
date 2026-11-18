import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { money, ukDate } from '@/lib/teach/format';

export const metadata = { title: 'My pay' };

type Line = { sessions: number; late_cancellations: number; live_classes: number; amount_pence: number };

export default async function TeachPay() {
  const { me } = await requireInstructor();
  if (!me) return null;
  const supabase = await createClient();
  const [{ data: cur }, { data: settings }, { data: lines }] = await Promise.all([
    supabase.rpc('pay_period', { p_offset: 0 }).single(),
    supabase.from('booking_settings').select('instructor_rate_pence, live_class_rate_pence, pay_cycle_days, pay_late_cancellations').single(),
    supabase.from('pay_run_lines').select('sessions, late_cancellations, live_classes, amount_pence, pay_runs(period_start, period_end, status, paid_at)').eq('instructor_id', me.id),
  ]);
  const c = cur as { period_start: string; period_end: string } | null;
  const { data: now } = c ? await supabase.rpc('instructor_pay', { p_from: c.period_start, p_to: c.period_end }) : { data: [] };
  const n = ((now ?? []) as Line[])[0];
  const runs = (lines ?? []).map((l) => ({ ...l, run: l.pay_runs as unknown as { period_start: string; period_end: string; status: string; paid_at: string | null } })).sort((a, b) => b.run.period_start.localeCompare(a.run.period_start));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My pay</h1>
        <p className="mt-1 text-sm text-muted">{money(settings?.live_class_rate_pence)} per live class and {money(settings?.instructor_rate_pence)} per 1-to-1, paid every {settings?.pay_cycle_days} days with your usual pay.{settings?.pay_late_cancellations ? ' Late cancellations by members are paid too.' : ''}</p>
      </div>
      {c && (
        <section className="border border-white p-4">
          <p className="text-xs text-muted">This period · {ukDate(c.period_start)} to {ukDate(c.period_end)}</p>
          <p className="mt-1 text-3xl font-bold">{money(n?.amount_pence ?? 0)}</p>
          <p className="text-sm text-muted">{n?.live_classes ?? 0} live classes · {n?.sessions ?? 0} 1-to-1s · {n?.late_cancellations ?? 0} late cancellations</p>
        </section>
      )}
      <ul className="divide-y divide-stone border border-stone">
        {runs.map((r, i) => (
          <li key={i} className="flex items-center justify-between p-4 text-sm">
            <span>{ukDate(r.run.period_start)} to {ukDate(r.run.period_end)} · {r.live_classes ?? 0} live classes · {r.sessions} 1-to-1s</span>
            <span className="text-right"><b>{money(r.amount_pence)}</b><br /><span className="text-xs text-muted">{r.run.status === 'paid' ? 'Paid' : 'Approved'}</span></span>
          </li>
        ))}
        {!runs.length && <li className="p-4 text-sm text-muted">No pay runs yet.</li>}
      </ul>
    </div>
  );
}
