import { hasAccount } from '@/lib/auth/account';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { hasOnDemand } from '@/lib/auth/access';
import { LIVE_CLASSES_PER_WEEK, LIVE_CLASSES_PLANNED, ON_DEMAND_CLASSES, BUILDER_MOVES } from '@/lib/site/offer';
import { PhoneTour } from '@/components/site/PhoneTour';
import { FreeClassButton } from '@/components/site/FreeClassButton';
import { Icon } from '@/components/site/Graphics';
import { StudioFinder } from '@/components/site/StudioFinder';
import { ReviewsBadge } from '@/components/site/ReviewsBadge';
import { PricingChooser } from '@/components/site/PricingChooser';
import { AnywhereSection } from '@/components/site/Anywhere';
import { PHOTO, wrap, Tick, ClassesSection, FeaturesSection, FaqSection, TrialCta } from '@/components/site/sections';

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
            <h1 className="mt-4 max-w-[14ch] text-[42px] leading-[0.98] sm:text-[68px]">Online Pilates and wellness, wherever you live</h1>
            <p className="mt-5 max-w-[40ch] text-[17px] text-white/85 sm:text-lg">Your plan, your classes, your food and your people. All in one app, wherever you live in the UK.</p>
            <p className="mt-4 text-[15px] font-bold uppercase tracking-[0.04em]">From £19.99 every 28 days</p>
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
            [Icon.play, 'On-demand library', `${ON_DEMAND_CLASSES} classes and a workout builder with ${BUILDER_MOVES} moves`, '/classes'],
            [Icon.people, 'Community', 'Optional: Circles, Clubs and members near you, in any town', '/the-community'],
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

        <ReviewsBadge />

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

        <AnywhereSection photos={{ a: PHOTO.hero, b: PHOTO.core, c: PHOTO.plank }} />

        {/* Live classes: 17 now, growing to 27 */}
        <section className={`${wrap} pb-10`}>
          <Link href="/live-classes" className="group grid items-center gap-4 border-2 border-white p-6 sm:grid-cols-[1fr_auto] sm:p-8" data-live-teaser>
            <div>
              <p className="eyebrow">Live on Zoom · 40 minutes · from anywhere</p>
              <p className="mt-2 text-[28px] font-bold uppercase leading-tight sm:text-[36px]">{LIVE_CLASSES_PER_WEEK} live classes every week</p>
              <p className="mt-1 text-lg font-bold uppercase text-muted">{LIVE_CLASSES_PLANNED} weekly live classes · coming soon</p>
              <p className="mt-3 max-w-[56ch] text-sm text-muted">Early mornings, lunchtimes, afternoons and evenings, with strength, mobility, 50+, prenatal and postnatal classes on the way. See which are live now and tap Notify me for the rest.</p>
            </div>
            <span className="inline-flex min-h-[48px] items-center justify-center bg-white px-6 text-sm font-bold uppercase text-black group-hover:opacity-90">See the timetable</span>
          </Link>
        </section>
        <ClassesSection member={member} />
        <FeaturesSection />
        <div id="membership" className="scroll-mt-28"><PricingChooser studio="summary" /></div>
        <FaqSection limit={4} />
        <p className="-mt-8 pb-6 text-center"><Link href="/faq" className="text-sm underline">All questions</Link></p>
        {/* Who it's for */}
        <section className={`${wrap} py-12`}>
          <div className="grid gap-6 border border-stone p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">Who it’s for</p>
              <h2 className="mt-2 text-[28px] sm:text-[36px]">Every woman is welcome here</h2>
              <p className="mt-3 max-w-[60ch] text-muted">Beginners, new mums, midlife, later life, busy weeks and long breaks. Gentle where you need it, stronger when you’re ready.</p>
            </div>
            <Link href="/who-its-for" className="inline-flex min-h-[48px] items-center justify-center border border-white px-6 text-sm font-bold uppercase hover:bg-white hover:text-black">See who we help</Link>
          </div>
        </section>

        {/* Programmes for different stages of life: a reason to choose BAYSE from anywhere in the country */}
        <section className={`${wrap} pb-12`}>
          <p className="eyebrow">Programmes for where you are</p>
          <h2 className="mt-2 text-[28px] sm:text-[36px]">Built for your stage of life</h2>
          <ul className="mt-6 grid gap-px border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-3">
            {[['BAYSE Begin', 'Beginners and women coming back to movement.'], ['BAYSE Stronger Years', 'Women over 50: strength, balance and staying independent.'], ['BAYSE Midlife', 'Support through perimenopause and menopause.'], ['BAYSE At Home', 'Low-impact, adaptable sessions for your own space.'], ['BAYSE Personal', 'Private one-to-one Pilates and accountability.'], ['BAYSE Postnatal and Prenatal', 'Gentle sessions before and after having a baby.']].map(([name, body]) => (
              <li key={name} className="bg-bg p-5"><p className="font-bold uppercase">{name}</p><p className="mt-1 text-sm text-muted">{body}</p></li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">All open now. Postnatal and Prenatal are for after you have been cleared to exercise by your midwife or doctor. <Link href="/who-its-for" className="underline">More about each</Link></p>
        </section>

        <StudioFinder />
        <TrialCta />
      </main>
      <SiteFooter />
    </>
  );
}
