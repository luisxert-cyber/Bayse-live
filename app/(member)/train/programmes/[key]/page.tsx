import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { hasEntitlement } from '@/lib/auth/access';
import { createClient } from '@/lib/supabase/server';
import { workoutMinutes } from '@/lib/workouts/catalog';
import { findStageProgramme, stageSchedule } from '@/lib/workouts/stages';
import { UpgradeGate } from '@/components/member/UpgradeGate';

export const dynamic = 'force-dynamic';

// A stage-of-life programme: what it is for, the note to read first, and every session week by week.
export default async function StageProgrammePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const p = findStageProgramme(key);
  if (!p) notFound();
  const user = await requireUser(`/train/programmes/${key}`);
  if (!(await hasEntitlement('programmes'))) {
    return <UpgradeGate title={p.name}>{p.tagline}. {p.about}</UpgradeGate>;
  }
  const supabase = await createClient();
  const { data: rows } = await supabase.from('workout_completions').select('workout_key').eq('user_id', user.id).in('workout_key', p.classes.map((c) => c.key));
  // How many times each class has been finished, so sessions tick off in order as the member works through the weeks.
  const left = new Map<string, number>();
  for (const r of rows ?? []) left.set(r.workout_key as string, (left.get(r.workout_key as string) ?? 0) + 1);
  const schedule = stageSchedule(p).map((wk) => ({ ...wk, sessions: wk.sessions.map((c) => { const n = left.get(c.key) ?? 0; if (n > 0) left.set(c.key, n - 1); return { c, done: n > 0 }; }) }));
  const total = p.weeks * p.perWeek, done = schedule.reduce((n, wk) => n + wk.sessions.filter((s) => s.done).length, 0);
  const next = schedule.flatMap((wk) => wk.sessions).find((s) => !s.done);
  return (
    <main className="page space-y-5">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <p className="eyebrow">{p.weeks} weeks · {p.perWeek} sessions a week</p>
        <h1 className="mt-2 text-[30px] leading-none">{p.name}</h1>
        <p className="mt-2 text-muted">{p.tagline}. {p.about}</p>
      </div>
      <p className="border-l-2 border-ink pl-3 text-sm">{p.note}</p>
      <div className="border border-stone p-4">
        <div className="flex items-center justify-between text-sm"><span className="font-bold">{done} of {total} sessions done</span>{done >= total && <span className="text-xs font-bold uppercase">Programme complete</span>}</div>
        <div className="mt-2 h-1.5 bg-stone"><div className="h-full bg-white" style={{ width: `${Math.min(100, (done / total) * 100)}%` }} /></div>
        {next && <Link href={`/train/${next.c.key}`} className="mt-4 inline-flex min-h-[44px] items-center bg-ink px-5 text-sm font-bold uppercase text-bg">Start next session: {next.c.name}</Link>}
      </div>
      <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {schedule.map((wk) => (
          <li key={wk.week} className="border border-stone p-4">
            <p className="font-bold uppercase tracking-[0.06em]">Week {wk.week}</p>
            <ul className="mt-2 divide-y divide-stone">
              {wk.sessions.map((s, i) => (
                <li key={i}>
                  <Link href={`/train/${s.c.key}`} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0"><span className={`block font-semibold leading-tight ${s.done ? 'text-muted line-through' : ''}`}>{s.c.name}</span><span className="block text-xs text-muted">{workoutMinutes(s.c)} min · {s.c.focus}</span></span>
                    <span aria-hidden className="shrink-0 text-sm">{s.done ? '✓' : '›'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted">BAYSE supports wellbeing and movement. It is not a medical or rehabilitation service. Stop if anything hurts, and speak to your doctor about anything that worries you.</p>
    </main>
  );
}
