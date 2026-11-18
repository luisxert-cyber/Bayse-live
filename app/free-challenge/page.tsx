import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { wrap, PHOTO } from '@/components/site/sections';
import { workoutMinutes } from '@/lib/workouts/catalog';
import { DAYS, CHALLENGE_DAYS, openDay } from '@/lib/free-challenge/days';
import { currentLead } from '@/lib/free-challenge/lead';
import { startChallenge } from './actions';

export const metadata = { title: 'Free 7-day Pilates challenge', description: 'Seven short Pilates classes in seven days, free. No card, no account: just your name and email.' };
export const dynamic = 'force-dynamic';

const input = 'min-h-[50px] w-full border border-stone bg-bg px-4 text-[16px]';
const ERRORS: Record<string, string> = {
  details: 'Please add your first name and a valid email address.',
  health: 'Please tick the health box to start.',
  failed: 'That did not work. Please try again.',
};

export default async function FreeChallenge({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const mine = await currentLead();

  if (mine) {
    const { lead } = mine;
    const open = openDay(lead.started_on, lead.today);
    const done = new Set(lead.days_done);
    const finished = done.size >= CHALLENGE_DAYS;
    const next = DAYS.find((d) => d.day <= open && !done.has(d.day));
    return (
      <SitePage>
        <section className={`${wrap} py-10`}>
          <p className="eyebrow">Free 7-day Pilates challenge</p>
          <h1 className="mt-3 text-[36px] leading-[1] sm:text-[48px]">{finished ? `You did it, ${lead.first_name}` : `Day ${open} of ${CHALLENGE_DAYS}, ${lead.first_name}`}</h1>
          <p className="mt-3 max-w-[50ch] text-muted">{finished ? 'Seven classes in seven days. Keep the habit going with a plan built around you.' : `${done.size} of ${CHALLENGE_DAYS} done. A new class opens every day: come back to this page tomorrow.`}</p>
          {next && <Link href={`/free-challenge/day/${next.day}`} className="mt-6 inline-flex min-h-[52px] items-center justify-center bg-white px-7 text-[15px] font-bold uppercase text-black hover:opacity-90">{`Start day ${next.day}: ${next.workout.name}`}</Link>}

          <ol className="mt-8 space-y-2">
            {DAYS.map((d) => {
              const isOpen = d.day <= open;
              const body = (
                <>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center text-sm font-bold ${done.has(d.day) ? 'bg-white text-black' : 'border border-stone'}`}>{done.has(d.day) ? '✓' : d.day}</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{d.workout.name}</span><span className="text-sm text-muted">{workoutMinutes(d.workout)} min · {d.line}</span></span>
                  <span className="shrink-0 text-xs text-muted">{done.has(d.day) ? 'Done' : isOpen ? 'Play ›' : `Opens day ${d.day}`}</span>
                </>
              );
              return (
                <li key={d.day}>
                  {isOpen
                    ? <Link href={`/free-challenge/day/${d.day}`} className="flex items-center gap-4 border border-stone p-4 hover:border-ink">{body}</Link>
                    : <div className="flex items-center gap-4 border border-stone p-4 opacity-50">{body}</div>}
                </li>
              );
            })}
          </ol>

          <div className="mt-10 border border-white p-6 text-center">
            <h2 className="text-[26px]">{finished ? 'Ready for the real thing?' : 'Want more than one class a day?'}</h2>
            <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted">The BAYSE Club gives you a personal plan, every class, live Zoom classes with two instructors and a community. Free for 7 days.</p>
            <Link href="/start/welcome" className="mt-5 inline-flex min-h-[52px] items-center justify-center bg-white px-7 text-[15px] font-bold uppercase text-black hover:opacity-90">Start my 7-day free trial</Link>
          </div>
        </section>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <PageHero eyebrow="Free 7-day Pilates challenge" title="7 days. 7 classes. Free." intro="One short BAYSE class a day for a week, from six to fifteen minutes. No card and no account: just your name and email." image={PHOTO.selfie} cta={false} />

      <section className={`${wrap} grid gap-10 py-12 md:grid-cols-2`}>
        <div>
          <h2 className="text-[28px]">Your week</h2>
          <ol className="mt-5 space-y-3">
            {DAYS.map((d) => (
              <li key={d.day} className="flex gap-4 border-b border-stone pb-3">
                <span className="w-14 shrink-0 text-sm font-bold uppercase">Day {d.day}</span>
                <span><span className="block font-semibold">{d.workout.name} · {workoutMinutes(d.workout)} min</span><span className="text-sm text-muted">{d.line}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">All mat work, no equipment. Day 1 opens straight away and a new class opens each day.</p>
        </div>

        <div id="start" className="scroll-mt-24">
          <form action={startChallenge} className="space-y-4 border border-white p-6">
            <h2 className="text-[28px]">Start today</h2>
            {sp.error && <p role="alert" className="border border-clay/60 bg-clay/10 px-4 py-3 text-sm">{ERRORS[sp.error] ?? ERRORS.failed}</p>}
            <label className="grid gap-1.5 text-sm">First name<input name="first_name" required maxLength={60} autoComplete="given-name" className={input} /></label>
            <label className="grid gap-1.5 text-sm">Email<input name="email" type="email" required maxLength={200} autoComplete="email" inputMode="email" className={input} /></label>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="health" required className="mt-1 h-5 w-5 shrink-0" /><span>I am well enough to exercise and will stop if anything hurts. I will check with my doctor first if I am pregnant, injured or have a health condition, and I accept the <Link href="/terms#health" className="underline">health and safety terms</Link>.</span></label>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="marketing" className="mt-1 h-5 w-5 shrink-0" /><span>Email me BAYSE news and offers too. Optional, and you can stop them any time.</span></label>
            <button className="min-h-[52px] w-full bg-white px-7 text-[15px] font-bold uppercase text-black hover:opacity-90">Start the free challenge</button>
            <p className="text-xs text-muted">We use your email for this challenge. See our <Link href="/privacy" className="underline">privacy notice</Link>. Already started? Enter the same email to pick up where you left off.</p>
          </form>
        </div>
      </section>
    </SitePage>
  );
}
