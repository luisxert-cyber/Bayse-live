import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { hasOnDemand } from '@/lib/auth/access';
import { requireUser } from '@/lib/auth/session';
import { requireHealthCheck } from '@/lib/health/gate';
import { workoutMinutes } from '@/lib/workouts/catalog';
import { findAnyWorkout } from '@/lib/workouts/builder';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { recordCompletion } from '../actions';

export default async function WorkoutPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const w = findAnyWorkout(key);
  if (!w) notFound();
  await requireUser(`/train/${key}`);
  await requireHealthCheck(`/train/${key}`);
  // Only the free class plays without a membership or free trial.
  if (!w.free && !(await hasOnDemand())) redirect('/you/membership');
  return (
    <main className="page space-y-4">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[28px] leading-none">{w.name}</h1>
        <p className="mt-2 text-muted">{workoutMinutes(w)} min · {w.focus} · {w.blocks.length} moves</p>
      </div>
      <WorkoutPlayer workout={w} exitHref="/today" onComplete={recordCompletion.bind(null, w.key)} />
    </main>
  );
}
