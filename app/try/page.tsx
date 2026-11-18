import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { WORKOUTS, workoutMinutes } from '@/lib/workouts/catalog';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';

export const metadata = { title: 'Try a free workout' };

export default function Try() {
  const w = WORKOUTS.find((x) => x.free)!;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <p className="eyebrow">Free taster</p>
        <h1 className="mt-2 text-[34px] leading-none">{w.name}</h1>
        <p className="mt-2 text-muted">{workoutMinutes(w)} minutes, no equipment, any level. Follow your BAYSE instructor and the timer does the rest.</p>
        <div className="mt-6"><WorkoutPlayer workout={w} exitHref="/start/welcome" /></div>
        <p className="mt-6 text-center text-sm">Enjoyed it? <Link href="/start/welcome" className="font-semibold underline">Build your plan and start 7 days free</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
