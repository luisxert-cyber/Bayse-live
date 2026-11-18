import Link from 'next/link';
import { buttonClass } from '@/components/ui';
import { LIVE_TIMETABLE, LIVE_CLASSES_PER_WEEK, LIVE_CLASS_MINUTES, PROGRAMMES, CLUBS, FAQS, TIERS } from '@/lib/site/offer';
import { ClassLibrary } from '@/components/site/ClassLibrary';
import { FreeClassButton } from '@/components/site/FreeClassButton';
import { HeroInstructor } from '@/components/site/HeroInstructor';
import { SixFeatures } from '@/components/site/SixFeatures';
import { LiveTimetable } from '@/components/site/LiveTimetable';
import { Icon } from '@/components/site/Graphics';
import { recordCompletion } from '@/app/(member)/train/actions';

// Website sections, shared by the home page and the dedicated pages (Live, Classes, Programmes, Community, Membership, Questions).
export const PHOTO = {
  hero: '/images/studio-bird-dog.webp',
  plank: '/images/studio-side-plank.webp',
  core: '/images/studio-mat-core.webp',
  selfie: '/images/community-selfie.webp',
  sign: '/images/community-studio-sign.webp',
  friends: '/images/community-friends.webp',
};
export const wrap = 'mx-auto w-full max-w-5xl px-4 sm:px-6';
export const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="mt-[3px] h-4 w-4 shrink-0"><circle cx="8" cy="8" r="8" fill="rgb(var(--muted))" /><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#000" strokeWidth="1.8" /></svg>
);
const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const Rule = () => <hr className="border-stone" />;
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];

export function LiveSection() {
  return (
    <>
        {/* Live classes */}
        <section id="live" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Live classes</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">Real instructors, live, with someone watching your form</h2>
              <p className="mt-4 text-muted">One instructor teaches. The other watches your form and coaches you by name.</p>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {[`${LIVE_CLASSES_PER_WEEK} classes a week, ${LIVE_CLASS_MINUTES} minutes each`, 'Mornings, lunchtimes and evenings', 'Camera on for feedback, or off', 'Just a mat: no reformer needed'].map((t) => <li key={t} className="flex gap-3"><Tick />{t}</li>)}
              </ul>
            </div>
            <figure className="border border-stone">
              <img src={PHOTO.plank} alt="A BAYSE instructor teaching a side plank" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: '50% 40%' }} />
              <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" />Live on Zoom, inside BAYSE</span><span>{LIVE_CLASS_MINUTES} min</span></figcaption>
            </figure>
          </div>
          <div className="mt-12 mb-4 flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-2xl uppercase">This week&rsquo;s live classes</h3>
            <p className="text-sm text-muted">{LIVE_CLASSES_PER_WEEK} classes · all {LIVE_CLASS_MINUTES} min · UK time</p>
          </div>
          <LiveTimetable days={LIVE_TIMETABLE} minutes={LIVE_CLASS_MINUTES} />
          <p className="mt-3 text-xs text-muted">The app always shows the latest timetable. Join any class from your phone, tablet or laptop.</p>
        </section>

    </>
  );
}

export function ClassesSection({ member }: { member: boolean }) {
  return (
    <>
        {/* On demand: the real, playable library */}
        <section id="classes" className={`${wrap} scroll-mt-28 py-14`}>
          <div className="grid items-center gap-8 md:grid-cols-[1fr_0.9fr]">
            <div>
              <Eyebrow>On demand</Eyebrow>
              <h2 className="mt-3 text-[32px] sm:text-[40px]">Train whenever suits you</h2>
              <p className="mt-4 max-w-[52ch] text-muted">Follow-along classes with a timer and voice cues, whenever suits you. Today&rsquo;s class is free.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <FreeClassButton className={buttonClass('primary')}>Play today&rsquo;s class</FreeClassButton>
                <Link href={member ? '/train/build' : '/try'} className={buttonClass('secondary')}>{member ? 'Build your own workout' : 'See how the workout builder works'}</Link>
              </div>
            </div>
            <HeroInstructor />
          </div>
          <div className="mt-10"><ClassLibrary preview signedIn={member} onRecord={member ? recordCompletion : undefined} /></div>
        </section>

    </>
  );
}

export function PlansSection() {
  return (
    <>
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

    </>
  );
}

export function FeaturesSection() {
  return (
    <>
        {/* What makes BAYSE different: the six BAYSE experiences */}
        <Rule />
        <section id="different" className={`${wrap} scroll-mt-28 py-14`}>
          <Eyebrow>More than a Pilates subscription</Eyebrow>
          <h2 className="mt-3 max-w-[20ch] text-[32px] sm:text-[40px]">Everything you need, in one app</h2>
          <p className="mt-2 text-sm text-muted sm:hidden">Swipe to see all six →</p>
          <SixFeatures />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">All six included in your 7-day free trial.</p>
            <Link href="/start/welcome" className={buttonClass('solid')}>Start my 7-day free trial</Link>
          </div>
        </section>
        <Rule />

    </>
  );
}

export function PeopleSection() {
  return (
    <>
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

    </>
  );
}

export function CodesSection() {
  return (
    <>
        {/* BAYSE codes */}
        <section className={`${wrap} pb-6`}>
          <div className="border-2 border-white p-6 sm:p-10">
            <Eyebrow>Have a BAYSE code?</Eyebrow>
            <h2 className="mt-3 max-w-[18ch] text-[30px] sm:text-[40px]">Got a code from your studio or the BAYSE team?</h2>
            <p className="mt-4 max-w-[56ch] text-muted">Choose any plan and enter your code on the payment page. A free-membership code means you are not charged.</p>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Build my plan</Link>
          </div>
        </section>

    </>
  );
}

export function MembershipSection() {
  return (
    <>
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

    </>
  );
}

export function FaqSection({ limit }: { limit?: number }) {
  return (
    <>
        {/* Questions */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-14 sm:px-6">
          <h2 className="text-[32px] sm:text-[40px]">Questions</h2>
          <div className="mt-6 divide-y divide-stone border-y border-stone">
            {(limit ? FAQS.slice(0, limit) : FAQS).map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
    </>
  );
}

export function TrialCta() {
  return (
    <>
        <section className="px-4 pb-16 pt-6 text-center">
          <h2 className="text-[30px] sm:text-[40px]">Your first class is a few minutes away</h2>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Start your 7-day free trial</Link>
        </section>
    </>
  );
}
