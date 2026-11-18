import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero, Check } from '@/components/site/PageHero';
import { wrap, PHOTO, TrialCta } from '@/components/site/sections';
import { TIERS, BILLING, LIVE_CLASSES_PER_WEEK } from '@/lib/site/offer';

export const metadata = { title: '7-day free trial', description: 'What’s included in The BAYSE Club 7-day free trial, how it works and what happens on day 8.' };

const INCLUDED = [
  'Your personal plan, built in a couple of minutes',
  'Every on-demand class, filmed class and the workout builder',
  'BAYSE Daily, progress and milestones',
  'Recipes and your shopping list',
  'The community, Circles, Clubs and chat rooms',
  `Live Zoom classes (${LIVE_CLASSES_PER_WEEK} a week) if you choose Inner Circle or Black`,
];

const STEPS: [string, string][] = [
  ['Build your plan', 'Three quick questions about your goals, experience and time. About a minute.'],
  ['Health check', 'A few yes or no questions and our safety terms, so we can keep you safe.'],
  ['Create your account and pick a plan', 'Choose Foundation, Inner Circle or Black. Your 7 days start now.'],
  ['Train', 'Start today’s class straight away. Try live classes, the builder, recipes and the community.'],
];

const WEEK: [string, string][] = [
  ['Day 1', 'Your first class from your plan, about 15 minutes.'],
  ['Day 2', 'Build a workout of your own, or try a live class.'],
  ['Day 3', 'Rest day: pick a recipe and add it to your shopping list.'],
  ['Day 4', 'Your second plan session. Say hello in the community.'],
  ['Day 5', 'Try a filmed class with one of our instructors.'],
  ['Day 6', 'Join a Circle or a Club near you.'],
  ['Day 7', 'Third session done. Check your weekly progress.'],
];

export default function FreeTrial() {
  return (
    <SitePage>
      <PageHero eyebrow="7-day free trial" title="7 days. 100% free." intro="Try everything in your chosen plan for a week. Cancel in a couple of taps before day 8 and you pay nothing." image={PHOTO.selfie} />

      <section className={`${wrap} grid gap-10 py-12 md:grid-cols-2`}>
        <div>
          <h2 className="text-[30px] sm:text-[40px]">What’s included</h2>
          <ul className="mt-5 space-y-3">{INCLUDED.map((i) => <li key={i} className="flex gap-3 text-[16px]"><Check />{i}</li>)}</ul>
        </div>
        <div>
          <h2 className="text-[30px] sm:text-[40px]">How it works</h2>
          <ol className="mt-5 space-y-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white text-sm font-bold">{i + 1}</span><span><b>{t}</b><br /><span className="text-sm text-muted">{d}</span></span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${wrap} pb-12`}>
        <h2 className="text-[30px] sm:text-[40px]">A week that shows you what it’s like</h2>
        <div className="mt-5 grid gap-px border border-stone bg-stone sm:grid-cols-7">
          {WEEK.map(([d, t]) => <div key={d} className="bg-bg p-4"><p className="text-xs font-bold uppercase">{d}</p><p className="mt-2 text-sm text-muted">{t}</p></div>)}
        </div>
        <p className="mt-2 text-xs text-muted">An example. Your plan sets the real sessions.</p>
      </section>

      <section className={`${wrap} pb-12`}>
        <div className="border-2 border-white p-6 sm:p-10">
          <h2 className="text-[30px] sm:text-[40px]">What happens on day 8</h2>
          <p className="mt-3 max-w-[60ch] text-muted">Your plan starts and the first 28 days are charged. After that it renews {BILLING} until you cancel.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {TIERS.map((t) => <div key={t.key} className="border border-stone p-4"><p className="font-bold uppercase">{t.name}</p><p className="mt-1 text-2xl font-bold">{t.price}</p><p className="text-xs text-muted">{BILLING} after your free week</p></div>)}
          </div>
          <p className="mt-4 text-sm text-muted">Cancel any time during the 7 days from My BAYSE → Membership and you won’t be charged. Qualifying BAYSE studio members get Foundation included and don’t need a trial. <Link href="/pricing" className="underline">Full pricing</Link> · <Link href="/terms" className="underline">Terms</Link></p>
        </div>
      </section>
      <TrialCta />
    </SitePage>
  );
}
