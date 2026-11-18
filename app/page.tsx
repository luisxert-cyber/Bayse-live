import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_TIMETABLE, LIVE_CLASSES_PER_WEEK, LIVE_CLASS_MINUTES, PROGRAMMES, CLUBS, FAQS, TIERS } from '@/lib/site/offer';
import { PhoneTour } from '@/components/site/PhoneTour';
import { ClassLibrary } from '@/components/site/ClassLibrary';
import { HeroInstructor } from '@/components/site/HeroInstructor';
import { Icon } from '@/components/site/Graphics';
import { WORKOUTS } from '@/lib/workouts/catalog';
import { READY } from '@/lib/workouts/builder';
import { recordCompletion } from '@/app/(member)/train/actions';

// BAYSE website in the studio brand (black, white, square edges, outlined buttons), following the
// "Website and platform design" document, with the real working parts: playable classes, the workout
// builder, live timetable, community and Clubs, membership with BAYSE codes.

const PHOTO = {
  hero: '/images/studio-bird-dog.webp',
  plank: '/images/studio-side-plank.webp',
  core: '/images/studio-mat-core.webp',
  move: '/images/studio-movement.webp',
  selfie: '/images/community-selfie.webp',
  sign: '/images/community-studio-sign.webp',
  friends: '/images/community-friends.webp',
};
const CLASS_COUNT = WORKOUTS.length + READY.length;
const wrap = 'mx-auto w-full max-w-5xl px-4 sm:px-6';
const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="mt-[3px] h-4 w-4 shrink-0"><circle cx="8" cy="8" r="8" fill="rgb(var(--muted))" /><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#000" strokeWidth="1.8" /></svg>
);
const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const Rule = () => <hr className="border-stone" />;
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* Hero: full-width studio photo with the outlined call to action */}
        <section className="relative">
          <img src={PHOTO.hero} alt="A BAYSE instructor holding a bird dog in the studio" className="h-[52vh] min-h-[320px] w-full object-cover sm:h-[62vh]" style={{ objectPosition: '50% 30%' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className={`${wrap} absolute inset-x-0 bottom-8`}>
            <Link href="/start/welcome" className="inline-block border-2 border-white bg-black/30 px-4 py-2.5 font-display text-[24px] font-bold uppercase leading-tight backdrop-blur-[2px] hover:bg-white hover:text-black sm:text-[36px]">Start your 7-day free trial</Link>
          </div>
        </section>

        <section className={`${wrap} grid grid-cols-2 gap-3 pt-8 sm:gap-5`}>
          <img src={PHOTO.plank} alt="Side plank on the mat in a BAYSE studio" className="aspect-[3/2] w-full object-cover" />
          <img src={PHOTO.core} alt="Core work on the mat in a BAYSE studio" className="aspect-[3/2] w-full object-cover" />
        </section>

        {/* Your programme. Your coach. Your people. + app tour */}
        <section className={`${wrap} py-10`}>
          <div className="grid items-center gap-10 border-2 border-white p-6 sm:p-10 md:grid-cols-[1.15fr_auto]">
            <div>
              <h1 className="text-[40px] leading-[1.02] sm:text-[56px]">Your programme. Your coach. Your people.</h1>
              <p className="mt-4 font-display text-[22px] font-semibold uppercase italic sm:text-[26px]">Live and on-demand Pilates</p>
              <p className="mt-4 max-w-[46ch] text-lg text-muted">From the instructors behind BAYSE studios: {LIVE_CLASSES_PER_WEEK} live classes a week, an on-demand library, a plan built around you and a community that keeps you going.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/start/welcome" className={buttonClass('primary')}>Build my plan</Link>
                <Link href="#membership" className={buttonClass('solid')}>See membership</Link>
              </div>
              <p className="mt-3 text-sm text-muted">Three minutes to build your plan. Cancel any time.</p>
            </div>
            <div className="flex justify-center"><PhoneTour photos={{ hero: PHOTO.hero, a: PHOTO.core, b: PHOTO.plank, c: PHOTO.move, group: PHOTO.friends }} /></div>
          </div>
        </section>

        {/* Numbers */}
        <Rule />
        <section className={`${wrap} grid grid-cols-2 gap-6 py-8 sm:grid-cols-5`}>
          {[
            [`${LIVE_CLASSES_PER_WEEK}`, 'live classes a week'],
            ['2', 'instructors in every live class'],
            [`${CLASS_COUNT}`, 'on-demand classes to play now'],
            ['4–12', 'week personal programmes'],
            ['7', 'day free trial'],
          ].map(([n, l]) => (
            <div key={l}><p className="font-display text-[40px] font-bold leading-none">{n}</p><p className="mt-1.5 text-sm text-muted">{l}</p></div>
          ))}
        </section>
        <Rule />

        {/* Live classes */}
        <section id="live" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Live classes</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">Real instructors, live, with someone watching your form</h2>
              <p className="mt-4 text-muted">Every live class has two BAYSE instructors. One teaches and motivates. The other watches the class, checks your technique, answers questions and makes sure everyone is safe.</p>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {[`${LIVE_CLASSES_PER_WEEK} classes a week, every one ${LIVE_CLASS_MINUTES} minutes`, 'Early, mid-morning, lunchtime and evening slots', 'Join from your phone, tablet or laptop', 'Camera on for pointers, or off if you prefer', 'Mat-based: no reformer needed', 'Beginner and progression options in every class'].map((t) => <li key={t} className="flex gap-3"><Tick />{t}</li>)}
              </ul>
            </div>
            <figure className="border border-stone">
              <img src={PHOTO.move} alt="A BAYSE instructor teaching on the mat" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" />Live on Zoom, inside BAYSE</span><span>{LIVE_CLASS_MINUTES} min</span></figcaption>
            </figure>
          </div>
          <div className="mt-12 flex items-end justify-between gap-4 border-b border-stone pb-3">
            <p className="eyebrow">Weekly timetable · UK time</p>
            <p className="text-sm text-muted">{LIVE_CLASSES_PER_WEEK} classes · all {LIVE_CLASS_MINUTES} min</p>
          </div>
          <div className="grid sm:grid-cols-7 sm:divide-x sm:divide-stone">
            {LIVE_TIMETABLE.map((d) => (
              <div key={d.day} className="flex gap-4 border-b border-stone py-3 sm:block sm:border-b-0 sm:px-3 sm:py-4">
                <p className="w-12 shrink-0 text-sm font-bold uppercase sm:w-auto">{d.short}</p>
                <ul className="flex-1 space-y-2 sm:mt-3 sm:space-y-4">
                  {d.classes.map((c) => (
                    <li key={c.time} className="flex items-baseline gap-3 sm:block">
                      <span className="w-[52px] shrink-0 font-display text-lg font-bold sm:block sm:w-auto sm:text-[26px] sm:leading-none">{c.time}</span>
                      <span className="text-sm text-muted sm:mt-1 sm:block">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-stone pt-3 text-xs text-muted">Classes may change from time to time; the timetable in the app is always up to date.</p>
        </section>

        {/* On demand: the real, playable library */}
        <section id="classes" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-center gap-8 md:grid-cols-[1fr_0.9fr]">
            <div>
              <Eyebrow>On demand</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">Train whenever suits you</h2>
              <p className="mt-4 max-w-[52ch] text-muted">A growing library of BAYSE classes you can do at home or away. Filter by style, length, level or kit, tap a class and follow along with a timer and voice cues. Today&rsquo;s class is free.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#play-wake-up-6" className={buttonClass('primary')}>Play today&rsquo;s class</Link>
                <Link href="/try" className={buttonClass('secondary')}>Build your own workout</Link>
              </div>
            </div>
            <HeroInstructor />
          </div>
          <div className="mt-10"><ClassLibrary signedIn={Boolean(user)} onRecord={user ? recordCompletion : undefined} /></div>
        </section>

        {/* Your plan */}
        <section id="plans" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Your plan</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">A clear path, built from your answers</h2>
              <p className="mt-4 text-muted">Tell us your goals, experience, equipment and how many sessions a week are realistic. We recommend a programme, explain why, and set out each week for you.</p>
            </div>
            <div className="border border-stone bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="eyebrow">Example programme</p><p className="mt-1 text-xl font-bold">Strong &amp; Sculpt</p></div>
                <p className="font-display text-[34px] font-bold leading-none text-muted">8 wks</p>
              </div>
              <ol className="mt-4 space-y-3 text-sm">
                {[['Week 1', 'Foundations of strength', 100], ['Week 2', 'Add light weights', 70], ['Week 3', 'Build the burn', 0], ['Week 4', 'Recovery week', 0]].map(([w, t, v]) => (
                  <li key={w as string} className="grid grid-cols-[56px_1fr] items-center gap-2"><span className="text-muted">{w}</span><span>{t}<span className="mt-1.5 block h-1 bg-stone"><span className="block h-full bg-white" style={{ width: `${v}%` }} /></span></span></li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMMES.map((p) => (
              <article key={p.name} className="border border-stone p-5">
                <h3 className="text-xl">{p.name}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{p.weeks}</p>
                <p className="mt-2 text-[15px] text-muted">{p.for}</p>
              </article>
            ))}
          </div>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-7`}>Build my plan</Link>
        </section>

        {/* Coaching, nutrition, wellness: opening in stages */}
        <Rule />
        <section className={`${wrap} grid gap-8 py-14 md:grid-cols-3`}>
          {[
            ['Coaching', 'A coach who knows your plan', 'Message your coach, get weekly check-ins and feedback, and adjust your plan when life gets busy. Group coaching comes with BAYSE Club, and your own coach with BAYSE Coaching.', Icon.coach],
            ['Nutrition', 'Food that fits real life', 'Simple recipes, flexible weekly meal plans and shopping lists made for you, based on your tastes, budget and time. Never a crash diet.', Icon.food],
            ['Women’s wellness', 'Support for every stage', 'Guidance on sleep, stress, cycles, pregnancy, postpartum, perimenopause and menopause, reviewed by professionals. What you share stays private to you.', Icon.wellness],
          ].map(([label, title, body, icon]) => (
            <div key={label as string}>
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-stone p-1.5">{icon}</span><span className="eyebrow">{label}</span></div>
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{body}</p>
              <span className="chip mt-3 text-muted">Opening in stages</span>
            </div>
          ))}
        </section>
        <Rule />

        {/* Your people */}
        <section id="community" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Your people</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">Find your people, online and near you</h2>
              <p className="mt-4 text-muted">Join the BAYSE community, find a Circle that trains at your times, and meet members outside class through Clubs run by members themselves.</p>
            </div>
            <div className="grid grid-cols-[1.5fr_1fr] gap-2">
              <img src={PHOTO.selfie} alt="BAYSE members laughing together after a class" className="aspect-[4/3] h-full w-full object-cover" style={{ objectPosition: '50% 45%' }} />
              <img src={PHOTO.sign} alt="BAYSE members together in front of the BAYSE sign" className="h-full w-full object-cover" style={{ objectPosition: '50% 35%' }} />
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {CLUBS.map((c, i) => (
              <div key={c.name} className="flex gap-4 border border-stone p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-stone p-2">{CLUB_ICONS[i]}</span>
                <div><h3 className="text-lg">{c.name}</h3><p className="mt-1 text-[15px] text-muted">{c.body}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Adults only. Meet in public places. Members can report, block and control who can find them.</p>
        </section>

        {/* BAYSE codes */}
        <section className={`${wrap} pb-6`}>
          <div className="border-2 border-white p-6 sm:p-10">
            <Eyebrow>Have a BAYSE code?</Eyebrow>
            <h2 className="mt-3 max-w-[18ch] text-[30px] sm:text-[40px]">Got a code from your studio or the BAYSE team?</h2>
            <p className="mt-4 max-w-[56ch] text-muted">Choose any plan and enter your code on the payment page. A free-membership code means you are not charged.</p>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Build my plan</Link>
          </div>
        </section>

        {/* Membership */}
        <section id="membership" className={`${wrap} scroll-mt-28 py-14`}>
          <Eyebrow>Membership</Eyebrow>
          <h2 className="mt-3 text-[32px] sm:text-[40px]">Start with 7 days free</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => {
              const featured = 'featured' in t && t.featured;
              return (
                <div key={t.key} className={`flex min-w-0 flex-col gap-3 p-6 ${featured ? 'border-2 border-white' : 'border border-stone'}`}>
                  {featured && <p className="text-xs font-bold uppercase italic">Most popular</p>}
                  <p className="text-xl font-bold">{t.name}</p>
                  <p><span className="font-display text-[34px] font-bold leading-none">{t.price}</span> <span className="text-sm text-muted">/ month</span></p>
                  <ul className="flex-1 space-y-2 text-[15px]">{t.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                  <Link href="/start/welcome" className={`${buttonClass(featured ? 'primary' : 'solid', true)} mt-2`}>Start free trial</Link>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Prices are being finalised before launch. Cancel any time.</p>
        </section>

        {/* Questions */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-14 sm:px-6">
          <h2 className="text-[32px] sm:text-[40px]">Questions</h2>
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
        </section>
        <section className="px-4 pb-16 pt-6 text-center">
          <h2 className="text-[30px] sm:text-[40px]">Your first class is a few minutes away</h2>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Start your 7-day free trial</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
