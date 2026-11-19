import { hasAccount } from '@/lib/auth/account';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { hasOnDemand } from '@/lib/auth/access';
import { LIVE_CLASSES_PER_WEEK } from '@/lib/site/offer';
import { PhoneTour } from '@/components/site/PhoneTour';
import { FreeClassButton } from '@/components/site/FreeClassButton';
import { Icon } from '@/components/site/Graphics';
import { StudioFinder } from '@/components/site/StudioFinder';
import { PHOTO, wrap, Tick, ClassesSection, FeaturesSection, MembershipSection, FaqSection, TrialCta } from '@/components/site/sections';

// Home: what The BAYSE Club is, then a taste of each part. Each part has its own page for the detail.

export default async function Home() {
  const user = await getUser().catch(() => null);
  const member = user ? await hasOnDemand() : false;
  return (
    <>
      <SiteHeader signedIn={hasAccount(user)} />
      <main>
        {/* Hero: what The BAYSE Club is, in one look */}
        <section className="relative overflow-hidden">
          <div className="relative h-[52vw] max-h-[420px] min-h-[240px] sm:absolute sm:inset-0 sm:h-auto sm:max-h-none">
            <img src={PHOTO.hero} alt="A BAYSE instructor coaching a bird dog in the studio" className="h-full w-full object-cover" style={{ objectPosition: '60% 30%' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/70 sm:to-black/0" />
          </div>
          <div className={`${wrap} relative flex flex-col pb-10 pt-2 sm:min-h-[640px] sm:justify-center sm:py-20`}>
            <p className="eyebrow !text-white/80">The BAYSE Club · Pilates, nutrition &amp; personal coaching for women</p>
            <h1 className="mt-4 max-w-[14ch] text-[42px] leading-[0.98] sm:text-[68px]">Online Pilates coaching from the BAYSE team</h1>
            <p className="mt-5 max-w-[40ch] text-[17px] text-white/85 sm:text-lg">Your plan, your classes, your food and your people. All in one app.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/start/welcome" className="inline-flex min-h-[52px] items-center justify-center bg-white px-7 text-[15px] font-bold uppercase tracking-[0.02em] text-black hover:opacity-90">Start my 7-day free trial</Link>
              <FreeClassButton className="inline-flex min-h-[52px] items-center justify-center border border-white/70 px-7 text-[15px] font-bold uppercase tracking-[0.02em] hover:bg-white hover:text-black">▶ Play a free class</FreeClassButton>
            </div>
            <p className="mt-4 text-sm text-white/70">100% free for 7 days · Cancel any time · No reformer needed</p>
          </div>
        </section>

        {/* What you get, at a glance */}
        <section className={wrap}>
          <div className="grid grid-cols-2 gap-px border border-stone bg-stone lg:grid-cols-4">
          {[
            [Icon.live, 'Live coached classes', `${LIVE_CLASSES_PER_WEEK} a week, taught live by the BAYSE team`, '/live-classes'],
            [Icon.plan, 'Your personal plan', '4 to 12 weeks, built from your answers', '/programmes'],
            [Icon.play, 'On-demand library', 'Follow-along classes and a workout builder', '/classes'],
            [Icon.people, 'Community', 'Circles, Clubs and members near you', '/community'],
          ].map(([icon, t, d, href]) => (
            <Link key={t as string} href={href as string} className="group bg-bg px-4 py-5 hover:bg-surface sm:px-6">
              <span className="block h-6 w-6">{icon}</span>
              <p className="mt-3 font-bold leading-tight">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] group-hover:underline">Find out more ›</p>
            </Link>
          ))}
          </div>
        </section>

        {/* Your programme. Your coach. Your people. + app tour */}
        <section className={`${wrap} py-10`}>
          <div className="grid items-center gap-10 border-2 border-white p-6 sm:p-10 md:grid-cols-[1.15fr_auto]">
            <div>
              <p className="eyebrow">One membership</p>
              <h2 className="mt-3 text-[40px] leading-[1.0] sm:text-[56px]">We take care of everything</h2>
              <ul className="mt-6 space-y-3 text-[17px]">
                {['A plan built around you', 'Live and on-demand classes', 'Recipes and shopping lists', 'Progress, milestones and rewards', 'Circles, Clubs and new friends'].map((t) => <li key={t} className="flex gap-3"><Tick />{t}</li>)}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/start/welcome" className={buttonClass('solid')}>Start my 7-day free trial</Link>
                <Link href="/pricing" className={buttonClass('primary')}>See membership</Link>
              </div>
              <p className="mt-3 text-sm text-muted">100% free for 7 days. Cancel any time.</p>
            </div>
            <div className="flex justify-center"><PhoneTour photos={{ hero: PHOTO.hero, a: PHOTO.core, b: PHOTO.plank, c: PHOTO.plank, group: PHOTO.friends }} /></div>
          </div>
        </section>

        <ClassesSection member={member} />
        <FeaturesSection />
        <MembershipSection />
        <FaqSection limit={4} />
        <p className="-mt-8 pb-6 text-center"><Link href="/faq" className="text-sm underline">All questions</Link></p>
        <StudioFinder />
        <TrialCta />
      </main>
      <SiteFooter />
    </>
  );
}
