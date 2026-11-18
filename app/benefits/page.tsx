import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { wrap, PHOTO, TrialCta } from '@/components/site/sections';
import { LIVE_CLASSES_PER_WEEK } from '@/lib/site/offer';
import { RECIPES } from '@/lib/nourish/recipes';

export const metadata = { title: 'Benefits', description: 'What The BAYSE Club does for you: strength, posture, energy, food that fits, real instructors and people who keep you going.' };

const BENEFITS: { title: string; body: string; photo: string | null; link: [string, string] }[] = [
  { title: 'A stronger core and better posture', body: 'Pilates works the deep muscles that hold you up. A few sessions a week, done well, and you stand taller, carry shopping easier and feel steadier on your feet.', photo: PHOTO.core, link: ['/programmes', 'See the programmes'] },
  { title: 'You actually keep going', body: 'Your plan is built from your goals and the time you really have, and BAYSE Daily tells you the one thing to do today. Milestones and rewards make the streak worth protecting.', photo: PHOTO.plank, link: ['/features', 'How the plan works'] },
  { title: 'Real instructors, not just videos', body: `${LIVE_CLASSES_PER_WEEK} live Zoom classes a week, taught by the BAYSE studio team, who can watch your form and coach you as you move. Book a private 1-to-1 when you want more.`, photo: PHOTO.hero, link: ['/live-classes', 'See the timetable'] },
  { title: 'Food that fits your life', body: 'Simple recipes and a shopping list that builds itself, filtered for your allergies and the way you like to eat. No strict diets, ever.', photo: null, link: ['/features#nourish', 'About Nourish'] },
  { title: 'People who notice when you show up', body: 'A community of women training at the same times as you. Small Circles, Clubs for padel and walks, and chat rooms for the things you love.', photo: PHOTO.friends, link: ['/clubs', 'Community and Clubs'] },
  { title: 'Fits around everything else', body: '10 to 45 minutes, at home or away, with just a mat. Every class shows easier and harder options, so it works whether you are brand new or years in.', photo: PHOTO.selfie, link: ['/classes', 'Browse classes'] },
];

const SAFE = ['A short health check before your first class', 'Gentle, Steady and Strong levels on everything', 'Options for pregnancy, postnatal and niggles', 'Instructors from our real studios'];

export default function Benefits() {
  return (
    <SitePage>
      <PageHero eyebrow="Why join" title="Feel stronger, every week" intro="The BAYSE Club is Pilates, nutrition and personal coaching for women, from the team behind the BAYSE studios. Here’s what it does for you." image={PHOTO.hero} />
      <section className={`${wrap} space-y-14 py-14`}>
        {BENEFITS.map((b, i) => (
          <div key={b.title} className={`grid items-center gap-6 md:grid-cols-2 md:gap-12 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            {b.photo ? <img src={b.photo} alt="" className="aspect-[4/3] w-full border border-stone object-cover" loading="lazy" /> : (
              <div className="flex aspect-[4/3] w-full flex-col justify-center gap-2 border border-stone bg-surface p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">In the app · Nourish</p>
                {RECIPES.slice(0, 5).map((r) => <div key={r.key} className="flex items-center justify-between border border-stone bg-bg px-3 py-2 text-sm"><span>{r.name}</span><span className="text-xs text-muted">{r.minutes} min</span></div>)}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-2 text-[30px] leading-[1.02] sm:text-[40px]">{b.title}</h2>
              <p className="mt-4 text-[17px] text-muted">{b.body}</p>
              <Link href={b.link[0]} className="mt-4 inline-block text-sm font-bold uppercase tracking-[0.06em] underline">{b.link[1]} ›</Link>
            </div>
          </div>
        ))}
      </section>
      <section className={`${wrap} pb-14`}>
        <div className="border-2 border-white p-6 sm:p-10">
          <p className="eyebrow">Safe from day one</p>
          <h2 className="mt-3 text-[30px] sm:text-[40px]">Looked after, even at home</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">{SAFE.map((s) => <li key={s} className="flex gap-3 text-[16px]"><span className="text-xl leading-none">✓</span>{s}</li>)}</ul>
        </div>
      </section>
      <TrialCta />
    </SitePage>
  );
}
