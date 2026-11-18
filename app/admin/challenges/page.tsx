import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { monthLabel, ukMonth } from '@/lib/challenge/data';
import { saveChallenge } from './actions';

export const metadata = { title: 'Monthly challenges' };
export const dynamic = 'force-dynamic';

const input = 'w-full border border-stone bg-bg px-3 py-2 text-sm';
type Row = { id: string; month: string; title: string; blurb: string; target: number };

export default async function Challenges() {
  await requireStaff('rewards');
  const supabase = await createClient();
  const { start } = ukMonth();
  const { data } = await supabase.from('challenges').select('id, month, title, blurb, target').order('month');
  const rows = (data ?? []) as Row[];
  const shown = rows.filter((r) => r.month >= start).slice(0, 6);
  const past = rows.filter((r) => r.month < start).slice(-3);
  const stats = Object.fromEntries(await Promise.all([...past, ...shown.slice(0, 1)].map(async (r) => {
    const { data: st } = await supabase.rpc('challenge_stats', { p_id: r.id }).maybeSingle();
    return [r.id, st as { joined: number; finished: number } | null] as const;
  })));
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Monthly challenges</h1>
      <p className="max-w-[70ch] text-sm text-muted">One challenge a month for BAYSE Inner Circle and BAYSE Black members: finish a number of sessions before the month ends. Timer classes, filmed classes, built workouts and live classes all count. A challenge is already set for every month; change the name, wording or target here.</p>
      <ul className="space-y-3">
        {[...past, ...shown].map((r) => (
          <li key={r.id} className="border border-stone p-4 text-sm">
            <form action={saveChallenge} className="space-y-3">
              <input type="hidden" name="month" value={r.month.slice(0, 7)} />
              <p className="font-bold">{monthLabel(r.month)}{r.month === start ? <span className="ml-2 bg-white px-2 py-0.5 text-[11px] uppercase text-black">Running now</span> : r.month < start ? <span className="ml-2 text-xs font-normal text-muted">finished</span> : null}
                {stats[r.id] ? <span className="ml-2 text-xs font-normal text-muted">{stats[r.id]!.joined} joined · {stats[r.id]!.finished} completed</span> : null}</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="grid gap-1">Name<input name="title" required minLength={2} maxLength={80} defaultValue={r.title} className={input} /></label>
                <label className="grid gap-1">Sessions<input name="target" type="number" min={1} max={60} defaultValue={r.target} className={input} /></label>
              </div>
              <label className="grid gap-1">What members see<textarea name="blurb" maxLength={300} rows={2} defaultValue={r.blurb} className={input} /></label>
              <button className="border border-ink px-5 py-2 text-xs font-bold uppercase">Save</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={saveChallenge} className="space-y-3 border border-stone p-4 text-sm">
        <p className="font-bold">Set a challenge for another month</p>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_120px]">
          <label className="grid gap-1">Month<input name="month" type="month" required className={input} /></label>
          <label className="grid gap-1">Name<input name="title" required minLength={2} maxLength={80} className={input} /></label>
          <label className="grid gap-1">Sessions<input name="target" type="number" min={1} max={60} defaultValue={12} className={input} /></label>
        </div>
        <label className="grid gap-1">What members see<textarea name="blurb" maxLength={300} rows={2} className={input} /></label>
        <button className="border border-ink px-5 py-2 text-xs font-bold uppercase">Save</button>
      </form>
    </div>
  );
}
