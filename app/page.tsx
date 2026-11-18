import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_SCHEDULE, ON_DEMAND, PROGRAMMES, CLUBS, FAQS } from '@/lib/site/offer';
import { Icon, IconBadge, TodayPhone, LiveClassGraphic, CoachGraphic, NutritionGraphic, WellnessGraphic, ActivityGraphic, ProgrammeGraphic } from '@/components/site/Graphics';

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`eyebrow ${light ? '!text-bg/60' : ''}`}>{children}</p>
);
const Tick = () => <span aria-hidden className="silver-fill mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold">✓</span>;
const ONDEMAND_ICONS = [Icon.play, Icon.wellness, Icon.people, Icon.circle, Icon.walk, Icon.clock, Icon.clock, Icon.plan];
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* Hero: banner photo with boxed call to action, as on the studio site */}
        <section className="relative">
          <img src="/images/studio-mat-core.webp" alt="" className="h-[300px] w-full object-cover opacity-70 sm:h-[380px]" style={{ objectPosition: '60% 35%' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
          <div className="absolute inset-x-0 top-8 mx-auto max-w-5xl px-4 sm:px-6">
            <Link href="/start/welcome" className="inline-block border-[3px] border-white bg-black/20 px-5 py-3 text-lg font-bold uppercase tracking-[0.01em] backdrop-blur-[1px] hover:bg-white hover:text-black sm:text-2xl">Start your 7-day free trial</Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-10 sm:gap-6 sm:px-6">
          <img src="/images/studio-movement.webp" alt="A BAYSE member moving through a mat Pilates sequence in the studio" className="aspect-square w-full object-cover" />
          <img src="/images/studio-mat-core.webp" alt="A BAYSE instructor teaching a mat Pilates core exercise" className="aspect-square w-full object-cover" />
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
          <div className="panel grid items-center gap-10 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="text-[40px] sm:text-[56px]">Your programme. Your coach. Your people.</h1>
              <p className="subhead mt-4 text-2xl sm:text-3xl">Live and on-demand Pilates</p>
              <p className="mt-6 max-w-md text-lg">From the instructors behind BAYSE studios: live classes five times a week, an on-demand library, a plan built around you and a real coach.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/start/welcome" className={buttonClass('primary')}>Build my plan</Link>
                <Link href="#membership" className={buttonClass('secondary')}>See membership</Link>
              </div>
              <p className="mt-4 text-sm text-muted">Three minutes to build your plan. Cancel any time.</p>
            </div>
            <div className="flex justify-center"><TodayPhone /></div>
          </div>
        </section>

        {/* What you get */}
        <section className="border-y border-white">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-10 sm:grid-cols-5 sm:px-6">
            {[
              ['5', 'live classes a week'],
              ['2', 'instructors in every live class'],
              ['10–60', 'minute on-demand sessions'],
              ['4–12', 'week personal programmes'],
              ['7', 'day free trial'],
            ].map(([n, l]) => (
              <div key={l}><p className="text-[36px] font-bold leading-none">{n}</p><p className="mt-1.5 text-sm text-muted">{l}</p></div>
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
          <div className="space-y-4">
            <LiveClassGraphic photo="/images/studio-mat-core.webp" />
            <div>
              <p className="eyebrow mb-2">Weekly timetable (UK time)</p>
              <div className="grid grid-cols-5 gap-2">
                {LIVE_SCHEDULE.map((s) => (
                  <div key={s.day} className="rounded-2xl border border-stone bg-surface px-2 py-3 text-center">
                    <p className="text-xs text-muted">{s.day.slice(0, 3)}</p>
                    <p className="mt-0.5 text-base font-bold">{s.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* On demand */}
        <section id="on-demand" className="bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <Eyebrow>On demand</Eyebrow>
            <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">Train whenever suits you</h2>
            <p className="mt-3 max-w-xl text-muted">A growing library of BAYSE classes you can do at home or away. Search by length, level, body area or equipment, and pick up where you left off.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ON_DEMAND.map((c, i) => (
                <div key={c.name} className="rounded-2xl border border-stone bg-bg p-4">
                  <IconBadge size="sm">{ONDEMAND_ICONS[i]}</IconBadge>
                  <p className="mt-3 font-semibold">{c.name}</p>
                  <p className="mt-1 text-sm text-muted">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programmes */}
        <section id="programmes" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <Eyebrow>Your plan</Eyebrow>
              <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">A clear path, built from your answers</h2>
              <p className="mt-3 max-w-xl text-muted">Tell us your goals, experience, equipment and how many sessions a week are realistic. We recommend a programme, explain why, and set out each week for you.</p>
            </div>
            <ProgrammeGraphic />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMMES.map((p) => (
              <div key={p.name} className="rounded-card border border-stone bg-surface p-5">
                <p className="font-serif text-lg">{p.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-silver">{p.weeks}</p>
                <p className="mt-2 text-sm text-muted">{p.for}</p>
              </div>
            ))}
          </div>
          <Link href="/start/welcome" className={`${buttonClass('primary')} mt-8`}>Build my plan</Link>
        </section>

        {/* Coaching, nutrition, wellness */}
        <section className="border-y border-white">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
            <div>
              <CoachGraphic />
              <div className="mt-6 flex items-center gap-3"><IconBadge size="sm">{Icon.coach}</IconBadge><Eyebrow>Coaching</Eyebrow></div>
              <h3 className="mt-3 text-lg font-semibold">A coach who knows your plan</h3>
              <p className="mt-2 text-sm text-muted">Message your coach, get weekly check-ins and feedback, and adjust your plan when life gets busy. Group coaching comes with BAYSE Club, and your own coach with BAYSE Coaching.</p>
            </div>
            <div>
              <NutritionGraphic />
              <div className="mt-6 flex items-center gap-3"><IconBadge size="sm">{Icon.food}</IconBadge><Eyebrow>Nutrition</Eyebrow></div>
              <h3 className="mt-3 text-lg font-semibold">Food that fits real life</h3>
              <p className="mt-2 text-sm text-muted">Simple recipes, flexible weekly meal plans and shopping lists made for you, based on your tastes, budget and time. Never a crash diet.</p>
            </div>
            <div>
              <WellnessGraphic />
              <div className="mt-6 flex items-center gap-3"><IconBadge size="sm">{Icon.wellness}</IconBadge><Eyebrow>Women&rsquo;s wellness</Eyebrow></div>
              <h3 className="mt-3 text-lg font-semibold">Support for every stage</h3>
              <p className="mt-2 text-sm text-muted">Guidance on sleep, stress, cycles, pregnancy, postpartum, perimenopause and menopause, reviewed by professionals. What you share stays private to you.</p>
            </div>
          </div>
        </section>

        {/* Community */}
        <section id="community" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <Eyebrow>Your people</Eyebrow>
              <h2 className="mt-3 max-w-xl text-xl font-semibold sm:text-2xl">Find your people, online and near your studio</h2>
              <p className="mt-3 max-w-xl text-muted">Join your studio community and the wider BAYSE community, take part in monthly club challenges, and meet members outside class through clubs run by members themselves.</p>
            </div>
            <ActivityGraphic />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {CLUBS.map((c, i) => (
              <div key={c.name} className="flex gap-4 rounded-card border border-stone bg-surface p-5">
                <IconBadge>{CLUB_ICONS[i]}</IconBadge>
                <div>
                <p className="font-serif text-lg">{c.name}</p>
                <p className="mt-1 text-sm text-muted">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Adults only. Meet in public places. Members can report, block and control who can find them.</p>
        </section>

        {/* Studio members */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="panel px-6 py-12 sm:px-12">
            <Eyebrow>Already a BAYSE studio member?</Eyebrow>
            <h2 className="mt-3 max-w-lg text-xl font-semibold sm:text-2xl">£99 and £148 members get BAYSE online included</h2>
            <p className="mt-3 max-w-lg text-muted">Keep your routine going at home or away. Choose your studio when you sign up; once your studio confirms your membership, everything switches on. No second payment.</p>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Link my studio membership</Link>
          </div>
        </section>

        {/* Membership */}
        <section id="membership" className="border-t border-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <Eyebrow>Membership</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Start with 7 days free</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { name: 'BAYSE Essential', price: '£19.99', items: ['Your personal programme', 'On-demand library', 'Recipes and meal plans', 'Progress tracking', 'Community and Clubs'] },
                { name: 'BAYSE Club', price: '£39.99', items: ['Everything in Essential', 'Five live classes a week', 'Group coaching', 'Monthly club challenges'], featured: true },
                { name: 'BAYSE Coaching', price: '£79.99', items: ['Everything in Club', 'Your own coach and check-ins', 'Extra nutrition support'] },
              ].map((p) => (
                <div key={p.name} className={`p-6 ${p.featured ? 'panel' : 'border border-stone'}`}>
                  {p.featured && <p className="subhead mb-2 text-sm">Most popular</p>}
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="mt-2"><span className="text-[32px] font-extrabold leading-none">{p.price}</span> <span className="text-sm text-muted">/ month</span></p>
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
