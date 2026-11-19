import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { money } from '@/lib/teach/format';
import { DAYS, clock } from '@/lib/site/timetable';

export const metadata = { title: 'Reports' };
export const dynamic = 'force-dynamic';

type R = {
  trials_started: number; trials_converted: number; trials_ended: number; active_28d_ago: number; cancelled_28d: number;
  attendance: { class_id: string; name: string; weekday: number; starts_at: string; booked: number; attended: number; people: number }[];
  attendance_by_hour: { hour: number; attended: number }[];
  black: { members: number; credits_given: number; credits_booked: number; completed: number; missed: number };
  instructor_rate_pence: number; black_price_pence: number; black_studio_price_pence: number;
};
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '–');
const Tile = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-bg p-4"><p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p>{sub && <p className="text-xs text-muted">{sub}</p>}</div>
);

// Reports from the master brief. Last 8 weeks unless stated; test accounts left out.
export default async function Insights() {
  await requireStaff('overview');
  const supabase = await createClient();
  const { data } = await supabase.rpc('admin_reports');
  const r = data as R | null;
  if (!r) return <p className="text-sm text-muted">Reports are not available.</p>;
  const b = r.black;
  const cost = b.completed * r.instructor_rate_pence;
  const peak = Math.max(1, ...r.attendance_by_hour.map((h) => h.attended));
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-muted">Trials, churn, live attendance and Black profitability. Figures fill in as real members join and pay; automatic test accounts are left out.</p>
      </div>
      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Trials and churn</p>
        <div className="grid grid-cols-2 gap-px border border-stone bg-stone lg:grid-cols-4">
          <Tile label="Trials started" value={r.trials_started} />
          <Tile label="Trial to paid" value={pct(r.trials_converted, r.trials_ended)} sub={`${r.trials_converted} of ${r.trials_ended} finished trials`} />
          <Tile label="Cancelled (28 days)" value={r.cancelled_28d} />
          <Tile label="Churn (28 days)" value={pct(r.cancelled_28d, r.active_28d_ago)} sub="of members active 28 days ago" />
        </div>
      </section>
      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Live class attendance · last 8 weeks</p>
        <div className="flex h-32 items-end gap-2 border border-stone p-4" role="img" aria-label="Attendance by start time">
          {r.attendance_by_hour.map((h) => (
            <div key={h.hour} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs">{h.attended || ''}</span>
              <div className="w-full bg-white" style={{ height: `${Math.max(2, (h.attended / peak) * 70)}px` }} />
              <span className="text-[10px] text-muted">{clock(`${String(h.hour).padStart(2, '0')}:00`)}</span>
            </div>
          ))}
          {!r.attendance_by_hour.length && <p className="m-auto text-sm text-muted">No bookings yet.</p>}
        </div>
        <table className="mt-3 w-full border border-stone text-sm">
          <thead><tr className="text-left text-xs text-muted"><th className="p-2 font-normal">Class</th><th className="font-normal">Booked</th><th className="font-normal">Joined</th><th className="p-2 text-right font-normal">Members</th></tr></thead>
          <tbody>{r.attendance.map((a) => <tr key={a.class_id} className="border-t border-stone"><td className="p-2">{DAYS[a.weekday - 1]} {clock(a.starts_at)} · {a.name}</td><td>{a.booked}</td><td>{a.attended}</td><td className="p-2 text-right">{a.people}</td></tr>)}</tbody>
        </table>
      </section>
      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">BAYSE Black profitability · last 8 weeks</p>
        <div className="grid grid-cols-2 gap-px border border-stone bg-stone lg:grid-cols-4">
          <Tile label="Black members" value={b.members} />
          <Tile label="Sessions used" value={pct(b.credits_booked, b.credits_given)} sub={`${b.credits_booked} of ${b.credits_given} included sessions booked`} />
          <Tile label="Completed" value={b.completed} sub={`${b.missed} no-shows or late cancellations`} />
          <Tile label="Instructor cost" value={money(cost)} sub={`${money(r.instructor_rate_pence)} per completed session`} />
        </div>
        <p className="mt-2 text-xs text-muted">Per member each 28 days, if they use their session: {money(r.black_price_pence)} − {money(r.instructor_rate_pence)} = {money(r.black_price_pence - r.instructor_rate_pence)} (studio: {money(r.black_studio_price_pence)} − {money(r.instructor_rate_pence)} = {money(r.black_studio_price_pence - r.instructor_rate_pence)}), before Stripe fees, other costs and tax.</p>
      </section>
    </div>
  );
}
