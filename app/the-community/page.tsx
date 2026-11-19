import Link from 'next/link';
// The public page about the community. (/community itself is the members’ community inside the app.)
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { StudioFinder } from '@/components/site/StudioFinder';
import { wrap, PHOTO, PeopleSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Community', description: 'The BAYSE Club community: a group for every BAYSE studio, chat rooms, small Circles, member-led walking, padel and social clubs, and monthly challenges. Included in every plan.' };

const INSIDE: [string, string][] = [
  ['The BAYSE Club feed', 'Share a win, ask a question, cheer someone on. Send a heart when a post makes your day.'],
  ['Your studio’s group', 'Every BAYSE studio has its own group, so you can find the people you train next to.'],
  ['General Chat', 'One open chat room for every member, for anything from beginners’ questions to what’s for dinner.'],
  ['Circles', 'Small groups of 10 to 20 who train at similar times and keep each other going.'],
  ['Clubs and meetups', 'Walking, padel and social groups, and nights out near you, set up and run by members.'],
  ['Member challenges', 'A new challenge to join each month, with everyone’s progress side by side.'],
];

const SAFE: [string, string][] = [
  ['You choose your name', 'Other members only see the display name you pick.'],
  ['Your health stays private', 'Anything you tell us about your health is never shown in the community.'],
  ['Report and block', 'Every post and member can be reported or blocked, and the BAYSE team moderates.'],
  ['Adults only, public places', 'Meetups are for adults and happen in public places.'],
];

export default function TheCommunity() {
  return (
    <SitePage>
      <PageHero eyebrow="Community" title="Your people, online and near you" intro="Pilates is easier to stick with when someone notices you showed up. The community is part of every plan, including Foundation." image={PHOTO.friends} />

      <section className={`${wrap} py-12`}>
        <p className="eyebrow">What’s inside</p>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">Six ways to belong</h2>
        <div className="mt-6 grid gap-px border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map(([title, body]) => (
            <div key={title} className="bg-bg p-5">
              <h3 className="text-lg font-bold uppercase">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <PeopleSection />

      <section className={`${wrap} pb-12`}>
        <div className="grid gap-6 border border-stone p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Included</p>
            <h2 className="mt-2 text-2xl font-bold uppercase">Every plan includes the community</h2>
            <p className="mt-3 max-w-[60ch] text-muted">It’s part of BAYSE Foundation, not an extra. If you train at a BAYSE studio on a £99 or £148 membership, the community and on-demand classes are included, so the community is yours already.</p>
          </div>
          <Link href="/pricing" className="inline-flex min-h-[48px] items-center justify-center border border-white px-6 text-sm font-bold uppercase hover:bg-white hover:text-black">See pricing</Link>
        </div>
      </section>

      <section className={`${wrap} pb-12`}>
        <p className="eyebrow">Safe and kind</p>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">Looked after from day one</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SAFE.map(([title, body]) => (
            <div key={title} className="border border-stone p-5">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-1 text-[15px] text-muted">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted"><Link href="/community-guidelines" className="underline">Read the community guidelines</Link></p>
      </section>

      <StudioFinder />
      <TrialCta />
    </SitePage>
  );
}
