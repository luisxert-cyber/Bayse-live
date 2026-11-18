import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { SixFeatures } from '@/components/site/SixFeatures';
import { wrap, PHOTO, TrialCta } from '@/components/site/sections';
import { LIVE_CLASSES_PER_WEEK, PRIVATE_SESSION_PRICE } from '@/lib/site/offer';

export const metadata = { title: 'Features', description: 'Everything in The BAYSE Club app: your plan, BAYSE Daily, on-demand and live classes, the workout builder, 1-to-1s, Nourish, progress and community.' };

const GROUPS: { id: string; title: string; plan: string; items: [string, string][] }[] = [
  { id: 'train', title: 'Train', plan: 'Every plan', items: [
    ['Your personal plan', 'Built from three quick questions: 4 to 12 weeks, the right number of sessions, at your level.'],
    ['BAYSE Daily', 'Open the app and see your next best move, picked for your plan, your week and how you are doing.'],
    ['On-demand and filmed classes', 'Follow-along timer classes plus full filmed classes with BAYSE instructors, from 10 to 45 minutes.'],
    ['Workout builder', 'Choose a style, what to work on, your time and kit. It builds a class in seconds, with video demos, rest timers and voice cues.'],
    ['Reformer at home', 'Have a bed at home? Studio reformer classes with spring settings for every section.'],
    ['Move library', 'Every move with a demo and coaching cues, so you know you are doing it right.'],
  ] },
  { id: 'live', title: 'Live and 1-to-1', plan: 'Inner Circle and Black', items: [
    ['Live Zoom classes', `${LIVE_CLASSES_PER_WEEK} classes a week, 45 minutes each, with an instructor who can watch your form.`],
    ['Private 1-to-1s', `45 minutes on Zoom with the instructor you choose. One every 28 days with Black, or ${PRIVATE_SESSION_PRICE} each on any plan.`],
    ['Meet the instructors', 'Every instructor has a page with photos, what they specialise in and the times you can book them.'],
  ] },
  { id: 'nourish', title: 'Nourish', plan: 'Every plan', items: [
    ['Recipes', 'Simple, high-protein meals that suit busy weeks, filtered by allergies and the way you eat.'],
    ['Shopping list', 'Add a recipe and the ingredients go straight onto your list.'],
  ] },
  { id: 'progress', title: 'Progress and rewards', plan: 'Every plan', items: [
    ['Weekly progress', 'See your sessions, minutes and streak, and how close you are to this week’s goal.'],
    ['Milestones and rewards', 'Hit milestones and unlock member rewards from BAYSE and partners.'],
  ] },
  { id: 'community', title: 'Community', plan: 'Every plan', items: [
    ['The feed', 'Share wins and questions with women who get it, moderated by the BAYSE team.'],
    ['Circles', 'Small groups of 10 to 20 who train at similar times and keep each other going.'],
    ['Clubs and meet-ups', 'Padel games, walks and socials organised by members, with places and waiting lists handled for you.'],
    ['Chat rooms', 'Join rooms for padel, walking, nutrition and more, chat and plan meet-ups.'],
    ['Safety built in', 'Report and block, private profiles, adults only, and meet-ups at public places.'],
  ] },
];

export default function Features() {
  return (
    <SitePage>
      <PageHero eyebrow="Features" title="Everything, in one app" intro="Your plan, your classes, your food and your people. Here’s everything inside The BAYSE Club." image={PHOTO.plank} />
      <section className={`${wrap} py-12`}>
        <h2 className="text-[30px] sm:text-[40px]">Six things you’ll use every week</h2>
        <SixFeatures />
      </section>
      <nav aria-label="Feature groups" className={`${wrap} flex flex-wrap gap-2 pb-6`}>
        {GROUPS.map((g) => <a key={g.id} href={`#${g.id}`} className="border border-stone px-3 py-1.5 text-xs font-bold uppercase hover:border-white">{g.title}</a>)}
      </nav>
      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} className={`${wrap} scroll-mt-28 border-t border-stone py-10`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[28px] sm:text-[36px]">{g.title}</h2>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{g.plan}</p>
          </div>
          <dl className="mt-5 grid gap-px border border-stone bg-stone sm:grid-cols-2">
            {g.items.map(([t, d]) => <div key={t} className="bg-bg p-5"><dt className="font-bold">{t}</dt><dd className="mt-1 text-sm text-muted">{d}</dd></div>)}
          </dl>
        </section>
      ))}
      <p className="pb-6 text-center text-sm"><Link href="/pricing" className="underline">Compare what’s in each plan</Link></p>
      <TrialCta />
    </SitePage>
  );
}
