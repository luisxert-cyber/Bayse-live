import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_TIMETABLE, LIVE_CLASSES_PER_WEEK, LIVE_CLASS_MINUTES, PROGRAMMES, CLUBS, FAQS, TIERS, OPENING_IN_STAGES } from '@/lib/site/offer';
import { HeroInstructor } from '@/components/site/HeroInstructor';
import { EXERCISES, WORKOUTS } from '@/lib/workouts/catalog';
import { READY } from '@/lib/workouts/builder';
import { recordCompletion } from '@/app/(member)/train/actions';
import { PhoneTour } from '@/components/site/PhoneTour';
import { ClassLibrary } from '@/components/site/ClassLibrary';
import { Icon } from '@/components/site/Graphics';

// BAYSE On Demand style (white, Archivo headings, rounded cards, pill buttons, black bands),
// merged with the real BAYSE Live platform: working sign-up, live timetable, community and plans.

const PHOTO = {
  hero: '/images/studio-bird-dog.webp',
  plank: '/images/studio-side-plank.webp',
  core: '/images/studio-mat-core.webp',
  move: '/images/studio-movement.webp',
  selfie: '/images/community-selfie.webp',
  sign: '/images/community-studio-sign.webp',
  friends: '/images/community-friends.webp',
};

const MOVE_COUNT = Object.keys(EXERCISES).length;
const CLASS_COUNT = WORKOUTS.length + READY.length;

const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const Chip = ({ children = OPENING_IN_STAGES }: { children?: React.ReactNode }) => <span className="chip">{children}</span>;
const Tick = () => <span aria-hidden className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink text-[9px] font-bold text-bg">✓</span>;
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];

function SecHead({ eyebrow, title, children, chip }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; chip?: boolean }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-3"><Eyebrow>{eyebrow}</Eyebrow>{chip && <Chip />}</div>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">{title}</h2>
      </div>
      {children && <p className="max-w-[52ch] text-muted">{children}</p>}
    </div>
  );
}

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* Hero (BAYSE On Demand) */}
        <section className={`${wrap} grid items-center gap-9 pb-8 pt-8 sm:pt-12 md:grid-cols-[1.05fr_0.95fr]`}>
          <div>
            <Eyebrow>Your home for Pilates</Eyebrow>
            <h1 className="mb-4 mt-3 text-[40px] sm:text-[60px]">Your home for Pilates, <span className="script">wherever you are.</span></h1>
            <p className="max-w-[46ch] text-lg text-muted">Expert-led Pilates from the instructors behind BAYSE Reformer Pilates. Classes you can play right now, live classes every week, a plan made around you and a community that keeps you going. No experience? No problem.</p>
            <div className="mb-3 mt-7 flex flex-wrap gap-3">
              <Link href="/start/welcome" className={buttonClass('primary')}>Start 7 days free</Link>
              <Link href="#classes" className={buttonClass('secondary')}>Browse classes</Link>
              <Link href="#play-wake-up-6" className={buttonClass('secondary')}>Play today&rsquo;s class</Link>
            </div>
            <p className="text-sm text-muted">Today&rsquo;s class is free, no sign-up needed. All on the mat, no reformer needed.</p>
          </div>
          <HeroInstructor />
        </section>

        {/* Numbers strip */}
        <section className={`${wrap} pb-6`}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [`${MOVE_COUNT}`, 'illustrated moves'],
              [`${CLASS_COUNT}`, 'classes to play now'],
              [`${LIVE_CLASSES_PER_WEEK}`, 'live classes a week'],
              ['6', 'class styles'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-card border border-stone bg-surface px-4 py-3">
                <dt className="sr-only">{l}</dt>
                <dd><span className="block font-display text-[30px] font-extrabold leading-none">{n}</span><span className="text-sm text-muted">{l}</span></dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Class library */}
        <section id="classes" className={`${wrap} scroll-mt-20 py-10`}>
          <SecHead eyebrow="Class library" title="Find your class">Filter by style, length and level. Tap a class to play it here, with the BAYSE instructor, a timer and voice cues.</SecHead>
          <ClassLibrary signedIn={Boolean(user)} onRecord={user ? recordCompletion : undefined} />
          <Link href="/try" className="mt-6 flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-bg">
            <span><span className="block font-display text-xl font-extrabold uppercase">Build your own workout</span><span className="text-sm opacity-80">Pick a style, the areas you want to work on and your time. We build it from {MOVE_COUNT} moves. No sign-up.</span></span>
            <span aria-hidden className="text-2xl">›</span>
          </Link>
        </section>

        {/* Plans */}
        <section id="plans" className={`${wrap} scroll-mt-20 py-10`}>
          <SecHead eyebrow="Programmes" title="Follow a plan">Classes in a sensible order, 4 to 12 weeks. Answer a few questions and we recommend the right one.</SecHead>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {PROGRAMMES.slice(0, 4).map((p) => (
              <article key={p.name} className="flex min-w-0 flex-col gap-3 rounded-card border border-stone bg-surface p-5">
                <h3 className="text-[19px] uppercase">{p.name}</h3>
                <p className="text-[15px] text-muted">{p.for}</p>
                <ol className="grid text-sm">
                  {p.sessions.map(([n, m], i) => (
                    <li key={n} className="flex justify-between gap-2 border-t border-stone py-1.5"><span>{i + 1}. {n}</span><em className="whitespace-nowrap not-italic text-muted">{m} min</em></li>
                  ))}
                </ol>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[13px] text-muted">{p.weeks} · {p.level}</span>
                  <Link href="/start/welcome" className={`${buttonClass('primary')} !min-h-[40px] !px-4 text-sm`}>Start programme</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Also: {PROGRAMMES.slice(4).map((p) => p.name).join(' and ')}.</p>
        </section>

        {/* Live */}
        <section id="live" className={`${wrap} scroll-mt-20 py-10`}>
          <SecHead eyebrow="Live classes" title={`${LIVE_CLASSES_PER_WEEK} live classes every week`}>All {LIVE_CLASS_MINUTES} minutes. One instructor teaches, the other watches your form and answers questions. Included with BAYSE Club and BAYSE Coaching.</SecHead>
          <div className="grid gap-3 sm:grid-cols-7">
            {LIVE_TIMETABLE.map((d) => (
              <div key={d.day} className="flex gap-4 rounded-card border border-stone bg-surface p-4 sm:block">
                <p className="w-12 shrink-0 text-sm font-bold uppercase sm:w-auto">{d.short}</p>
                <ul className="flex-1 space-y-3 sm:mt-3">
                  {d.classes.map((c) => (
                    <li key={c.time} className="flex items-baseline gap-3 sm:block">
                      <span className="w-[56px] shrink-0 font-display text-lg font-extrabold sm:w-auto">{c.time}</span>
                      <span className="text-sm text-muted sm:block">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">UK time. The app always shows the latest timetable.</p>
        </section>

        {/* Community (black band) */}
        <section id="community" className="band scroll-mt-16 py-14 sm:py-20">
          <div className={wrap}>
            <SecHead eyebrow="Your people" chip title={<>The best part of BAYSE <span className="script">happens after class</span></>}>
              Friendships are why people stay. Find your Circle, take on monthly challenges together, and meet up in real life through clubs run by members, for members.
            </SecHead>
            <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
              <figure className="relative overflow-hidden rounded-card">
                <img src={PHOTO.selfie} alt="A group of BAYSE members laughing together after a class" className="aspect-[4/3] h-full w-full object-cover" style={{ objectPosition: '50% 45%' }} />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold">BAYSE members, after class</figcaption>
              </figure>
              <img src={PHOTO.sign} alt="BAYSE members together in front of the BAYSE sign" className="aspect-[4/3] h-full w-full rounded-card object-cover sm:aspect-auto" style={{ objectPosition: '50% 35%' }} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CLUBS.map((c, i) => (
                <div key={c.name} className="flex gap-4 rounded-card border border-stone p-5">
                  <span className="h-9 w-9 shrink-0">{CLUB_ICONS[i]}</span>
                  <div><h3 className="text-lg uppercase">{c.name}</h3><p className="mt-1 text-muted">{c.body}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">Adults only. Meet in public places. Members can report, block and choose who can find them.</p>
          </div>
        </section>

        {/* How it works + app */}
        <section id="how" className={`${wrap} grid scroll-mt-20 items-center gap-12 py-14 md:grid-cols-[1fr_auto]`}>
          <div>
            <Eyebrow>How BAYSE works</Eyebrow>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">Three steps <span className="script">to your first class</span></h2>
            <ol className="mt-8 space-y-6">
              {[
                ['Tell us about you', 'Your goals, experience and how much time you have. About a minute.'],
                ['Get your plan', 'We recommend a programme, explain why, and set out each week. Train live, on demand, or both.'],
                ['Show up, together', 'Book live classes, join your Circle and see what is on near you.'],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display font-extrabold text-bg">{i + 1}</span>
                  <div><h3 className="text-lg uppercase">{t}</h3><p className="mt-1 max-w-md text-muted">{b}</p></div>
                </li>
              ))}
            </ol>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-8`}>Build my plan</Link>
          </div>
          <div className="flex justify-center"><PhoneTour photos={{ hero: PHOTO.hero, a: PHOTO.core, b: PHOTO.plank, c: PHOTO.move, group: PHOTO.friends }} /></div>
        </section>

        {/* Membership (black band) */}
        <section id="membership" className="band scroll-mt-16 py-14 sm:py-20">
          <div className={wrap}>
            <SecHead eyebrow="Membership" title="Find your fit. 7 days free.">Every plan starts with a free trial. Cancel any time. Prices are being finalised before launch.</SecHead>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              {TIERS.map((t) => {
                const featured = 'featured' in t && t.featured;
                return (
                  <div key={t.key} className={`flex min-w-0 flex-col gap-3 rounded-card border p-6 ${featured ? 'border-white' : 'border-stone'}`}>
                    {featured && <span className="w-fit rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase text-black">Most popular</span>}
                    <p className="text-sm font-bold uppercase tracking-[0.06em]">{t.name}</p>
                    <p><span className="font-display text-[38px] font-extrabold leading-none">{t.price}</span> <span className="text-sm text-muted">/ month</span></p>
                    <p className="text-sm text-muted"><span className="font-semibold text-ink">{t.tagline}.</span> {t.bestFor}</p>
                    <ul className="flex-1 space-y-2 text-sm">{t.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                    <Link href="/start/welcome" className={`${buttonClass(featured ? 'primary' : 'secondary', true)} mt-2`}>Start free trial</Link>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 rounded-card border border-stone p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
              <div>
                <h3 className="text-xl uppercase">Create your account</h3>
                <p className="mt-1 text-muted">Tell us your goals, get your plan, then choose a membership. About a minute, all on this site.</p>
              </div>
              <Link href="/start/welcome" className={buttonClass('primary')}>Continue</Link>
            </div>
            <div className="mt-4 rounded-card border border-stone p-5">
              <p className="font-bold uppercase">Have a BAYSE code?</p>
              <p className="mt-1 text-muted">Choose a plan, then tap &ldquo;Add promotion code&rdquo; on the payment page. A free-membership code means you are not charged.</p>
            </div>
            <p className="mt-4 text-sm text-muted">Coaching, nutrition, wellness and Clubs open in stages after launch. The app always shows what is live.</p>
          </div>
        </section>

        {/* Questions */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-[30px] sm:text-[40px]">Questions</h2>
          <div className="mt-6 divide-y divide-stone border-y border-stone">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-16 rounded-3xl bg-surface p-8 text-center">
            <h2 className="text-[30px] sm:text-[40px]">Your first class <span className="script">is a minute away</span></h2>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Start 7 days free</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
