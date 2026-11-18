import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { findWorkout, workoutMinutes, EXERCISES } from '@/lib/workouts/catalog';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { recordCompletion } from '../actions';

export default async function WorkoutPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const w = findWorkout(key);
  if (!w) notFound();
  await requireUser(`/train/${key}`);
  return (
    <main className="page space-y-4">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[28px] leading-none">{w.name}</h1>
        <p className="mt-2 text-muted">{workoutMinutes(w)} min · {w.blocks.map((b) => EXERCISES[b.ex].name).filter((n, i, a) => a.indexOf(n) === i).join(' · ')}</p>
      </div>
      <WorkoutPlayer workout={w} exitHref="/today" onComplete={recordCompletion.bind(null, w.key)} />
    </main>
  );
}
