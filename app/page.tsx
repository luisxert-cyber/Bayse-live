import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_SCHEDULE, ON_DEMAND, PROGRAMMES, CLUBS, FAQS } from '@/lib/site/offer';

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`eyebrow ${light ? '!text-bg/60' : ''}`}>{children}</p>
);
const Tick = () => <span aria-hidden className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 text-[10px] text-accent">✓</span>;

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-16">
          <div>
            <Eyebrow>BAYSE online · live and on demand</Eyebrow>
            <h1 className="mt-4 text-[44px] font-semibold leading-[1.02] sm:text-[56px]">Your programme.<br />Your coach.<br />Your people.</h1>
            <p className="mt-5 max-w-md text-lg text-muted">Live Pilates classes five times a week, an on-demand library, a plan built around you and a real coach, all from the instructors behind BAYSE studios.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/start/welcome" className={buttonClass('primary')}>Start your 7-day free trial</Link>
              <Link href="#membership" className={buttonClass('secondary')}>See membership</Link>
            </div>
            <p className="mt-4 text-sm text-muted">Build your plan in three minutes. Cancel any time.</p>
          </div>
          <div className="relative">
            <img src="/images/studio-mat-core.webp" alt="A BAYSE instructor teaching a mat Pilates core exercise" className="aspect-[4/5] w-full rounded-[28px] object-cover" />
            <div className="absolute -bottom-5 left-5 right-5 rounded-card border border-stone bg-surface/95 p-4 shadow-card backdrop-blur sm:left-auto sm:w-64">
              <p className="eyebrow">Live tonight · 7pm</p>
              <p className="mt-1 font-serif text-lg">Full Body Mat Pilates</p>
              <p className="text-sm text-muted">45 minutes · mat and light weights</p>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="border-y border-stone bg-surface">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-10 sm:grid-cols-5 sm:px-6">
            {[
              ['5', 'live classes a week'],
              ['2', 'instructors in every live class'],
              ['10–60', 'minute on-demand sessions'],
              ['4–12', 'week personal programmes'],
              ['7', 'day free trial'],
            ].map(([n, l]) => (
              <div key={l}><p className="font-serif text-[32px] leading-none">{n}</p><p className="mt-1.5 text-sm text-muted">{l}</p></div>
            ))}
          </div>
        </section>

        {/* Live */}
        <section id="live" className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <Eyebrow>Live classes</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Real instructors, live, with someone watching your form</h2>
            <p className="mt-3 text-muted">Every live class has two BAYSE instructors. One teaches and motivates. The other watches the class, checks your technique, answers questions and makes sure everyone is safe.</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {['Join from your phone, tablet or laptop, inside BAYSE', 'Camera on for pointers, or off if you prefer', 'Mat-based: no reformer needed', 'Beginner and progression options in every class', 'Book ahead and get a reminder before class'].map((t) => (
                <li key={t} className="flex gap-3"><Tick />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-stone bg-surface p-6">
            <p className="eyebrow">Weekly timetable (UK time)</p>
            <ul className="mt-4 divide-y divide-stone">
              {LIVE_SCHEDULE.map((s) => (
                <li key={s.day} className="flex items-baseline justify-between py-3"><span>{s.day}</span><span className="font-serif text-lg">{s.time}</span></li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">Classes may change from time to time; your timetable in the app is always up to date.</p>
          </div>
        </section>

        {/* On demand */}
        <section id="on-demand" className="bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <Eyebrow>On demand</Eyebrow>
            <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">Train whenever suits you</h2>
            <p className="mt-3 max-w-xl text-muted">A growing library of BAYSE classes you can do at home or away. Search by length, level, body area or equipment, and pick up where you left off.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ON_DEMAND.map((c) => (
                <div key={c.name} className="rounded-2xl border border-stone bg-bg p-4">
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-1 text-sm text-muted">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programmes */}
        <section id="programmes" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Eyebrow>Your plan</Eyebrow>
          <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">A clear path, built from your answers</h2>
          <p className="mt-3 max-w-xl text-muted">Tell us your goals, experience, equipment and how many sessions a week are realistic. We recommend a programme, explain why, and set out each week for you.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMMES.map((p) => (
              <div key={p.name} className="rounded-card border border-stone bg-surface p-5">
                <p className="font-serif text-lg">{p.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-accent">{p.weeks}</p>
                <p className="mt-2 text-sm text-muted">{p.for}</p>
              </div>
            ))}
          </div>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-8`}>Build my plan</Link>
        </section>

        {/* Coaching, nutrition, wellness */}
        <section className="border-y border-stone bg-surface">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
            <div>
              <Eyebrow>Coaching</Eyebrow>
              <h3 className="mt-3 text-lg font-semibold">A coach who knows your plan</h3>
              <p className="mt-2 text-sm text-muted">Message your coach, get weekly check-ins and feedback, and adjust your plan when life gets busy. Group coaching comes with BAYSE Club, and your own coach with BAYSE Coaching.</p>
            </div>
            <div>
              <Eyebrow>Nutrition</Eyebrow>
              <h3 className="mt-3 text-lg font-semibold">Food that fits real life</h3>
              <p className="mt-2 text-sm text-muted">Simple recipes, flexible weekly meal plans and shopping lists made for you, based on your tastes, budget and time. Never a crash diet.</p>
            </div>
            <div>
              <Eyebrow>Women&rsquo;s wellness</Eyebrow>
              <h3 className="mt-3 text-lg font-semibold">Support for every stage</h3>
              <p className="mt-2 text-sm text-muted">Guidance on sleep, stress, cycles, pregnancy, postpartum, perimenopause and menopause, reviewed by professionals. What you share stays private to you.</p>
            </div>
          </div>
        </section>

        {/* Community */}
        <section id="community" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Eyebrow>Your people</Eyebrow>
          <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">Find your people, online and near your studio</h2>
          <p className="mt-3 max-w-xl text-muted">Join your studio community and the wider BAYSE community, take part in monthly club challenges, and meet members outside class through clubs run by members themselves.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {CLUBS.map((c) => (
              <div key={c.name} className="rounded-card border border-stone bg-surface p-5">
                <p className="font-serif text-lg">{c.name}</p>
                <p className="mt-2 text-sm text-muted">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Adults only. Meet in public places. Members can report, block and control who can find them.</p>
        </section>

        {/* Studio members */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-[28px] border border-stone bg-surface px-6 py-12 sm:px-12">
            <Eyebrow>Already a BAYSE studio member?</Eyebrow>
            <h2 className="mt-3 max-w-lg text-xl font-semibold sm:text-2xl">£99 and £148 members get BAYSE online included</h2>
            <p className="mt-3 max-w-lg text-muted">Keep your routine going at home or away. Choose your studio when you sign up; once your studio confirms your membership, everything switches on. No second payment.</p>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Link my studio membership</Link>
          </div>
        </section>

        {/* Membership */}
        <section id="membership" className="border-t border-stone bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <Eyebrow>Membership</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Start with 7 days free</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { name: 'BAYSE Essential', price: '£19.99', items: ['Your personal programme', 'On-demand library', 'Recipes and meal plans', 'Progress tracking', 'Community and Clubs'] },
                { name: 'BAYSE Club', price: '£39.99', items: ['Everything in Essential', 'Five live classes a week', 'Group coaching', 'Monthly club challenges'], featured: true },
                { name: 'BAYSE Coaching', price: '£79.99', items: ['Everything in Club', 'Your own coach and check-ins', 'Extra nutrition support'] },
              ].map((p) => (
                <div key={p.name} className={`rounded-card border bg-bg p-6 ${p.featured ? 'border-ink' : 'border-stone'}`}>
                  {p.featured && <p className="eyebrow mb-2 !text-accent">Most popular</p>}
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="mt-2"><span className="font-serif text-[32px] leading-none">{p.price}</span> <span className="text-sm text-muted">/ month</span></p>
                  <ul className="mt-5 space-y-2 text-sm">{p.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                  <Link href="/start/welcome" className={`${buttonClass(p.featured ? 'primary' : 'secondary', true)} mt-6`}>Start free trial</Link>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">Prices are being finalised before launch. Cancel any time. Studio members on £99 and £148 memberships: included.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold sm:text-2xl">Questions</h2>
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

        <section className="mx-auto max-w-5xl px-4 pb-20 text-center sm:px-6">
          <h2 className="text-xl font-semibold sm:text-2xl">Your first class is a few minutes away</h2>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Start your 7-day free trial</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
