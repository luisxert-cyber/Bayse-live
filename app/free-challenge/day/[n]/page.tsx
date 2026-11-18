import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SitePage } from '@/components/site/SitePage';
import { wrap } from '@/components/site/sections';
import { workoutMinutes } from '@/lib/workouts/catalog';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { DAYS, CHALLENGE_DAYS, openDay } from '@/lib/free-challenge/days';
import { currentLead } from '@/lib/free-challenge/lead';
import { markDay } from '../../actions';

export const metadata = { title: 'Free 7-day Pilates challenge' };
export const dynamic = 'force-dynamic';

export default async function ChallengeDayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const d = DAYS.find((x) => String(x.day) === n);
  if (!d) notFound();
  const mine = await currentLead();
  if (!mine) redirect('/free-challenge#start');
  // Days open one at a time.
  if (d.day > openDay(mine.lead.started_on, mine.lead.today)) redirect('/free-challenge');
  return (
    <SitePage>
      <section className={`${wrap} max-w-2xl space-y-4 py-8`}>
        <Link href="/free-challenge" className="text-sm text-muted hover:text-ink">← Your challenge</Link>
        <div>
          <p className="eyebrow">Day {d.day} of {CHALLENGE_DAYS}</p>
          <h1 className="mt-1 text-[30px] leading-none">{d.workout.name}</h1>
          <p className="mt-2 text-muted">{workoutMinutes(d.workout)} min · {d.workout.blocks.length} moves · {d.line}</p>
        </div>
        <p className="text-xs text-muted">Only exercise if you are well enough to. Stop if anything hurts.</p>
        <WorkoutPlayer workout={d.workout} exitHref="/free-challenge" onComplete={markDay.bind(null, d.day)} />
        <div className="border border-white p-5 text-center">
          <p className="font-bold">Enjoying it? Get every class free for 7 days.</p>
          <Link href="/start/welcome" className="mt-3 inline-flex min-h-[46px] items-center justify-center bg-white px-6 text-sm font-bold uppercase text-black">Start my 7-day free trial</Link>
        </div>
      </section>
    </SitePage>
  );
}
