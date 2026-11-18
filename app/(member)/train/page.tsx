import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { WORKOUTS, EXERCISES, workoutMinutes } from '@/lib/workouts/catalog';
import { FigureStill } from '@/components/workout/Figure';

export const metadata = { title: 'Train' };

export default async function Train() {
  await requireUser('/train');
  return (
    <main className="page space-y-5">
      <div>
        <h1 className="text-[30px] leading-none">Train</h1>
        <p className="mt-2 text-muted">Guided timer workouts with your BAYSE instructor. Press start, follow along, and each one counts towards your week.</p>
      </div>
      <div className="grid gap-3">
        {WORKOUTS.map((w) => (
          <Link key={w.key} href={`/train/${w.key}`} className="flex items-center gap-4 rounded-card border border-stone bg-surface p-3 hover:border-ink">
            <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-bg"><FigureStill move={EXERCISES[w.blocks[1]?.ex ?? w.blocks[0].ex].move} t={0.6} className="block w-full" /></div>
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold uppercase leading-tight">{w.name}</p>
              <p className="text-sm text-muted">{workoutMinutes(w)} min · {w.focus} · {w.level}</p>
              <p className="mt-1 line-clamp-2 text-sm">{w.summary}</p>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted">Filmed classes with BAYSE instructors are being added to the library.</p>
    </main>
  );
}
