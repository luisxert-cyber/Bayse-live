import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { PROGRAMMES, TIERS } from '@/lib/site/offer';
import { HeroInstructor } from '@/components/site/HeroInstructor';
import { ClassLibrary } from '@/components/site/ClassLibrary';
import { SignupForm } from '@/components/site/SignupForm';
import { EXERCISES, WORKOUTS } from '@/lib/workouts/catalog';
import { READY } from '@/lib/workouts/builder';
import { recordCompletion } from '@/app/(member)/train/actions';

// The BAYSE On Demand website: hero, class library, plans, memberships and create-your-account.
// Live classes, community and questions are on /live-and-community.

const MOVE_COUNT = Object.keys(EXERCISES).length;
const CLASS_COUNT = WORKOUTS.length + READY.length;
const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const Tick = () => <span aria-hidden className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink text-[9px] font-bold text-bg">✓</span>;

function SecHead({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
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
        {/* Hero */}
        <section className={`${wrap} grid items-center gap-9 pb-12 pt-8 sm:pt-12 md:grid-cols-[1.05fr_0.95fr]`}>
          <div>
            <p className="eyebrow">Your home for Pilates</p>
            <h1 className="mb-4 mt-3 text-[40px] sm:text-[60px]">Your home for Pilates, wherever you are.</h1>
            <p className="max-w-[46ch] text-lg text-muted">Affordable, expert-led Pilates from the instructors behind BAYSE Reformer Pilates, designed to help you move better, feel better and get stronger. No experience? No problem.</p>
            <div className="mb-3 mt-7 flex flex-wrap gap-3">
              <Link href="#play-wake-up-6" className={buttonClass('primary')}>Get your first class free</Link>
              <Link href="#classes" className={buttonClass('secondary')}>Browse classes</Link>
              <Link href="#play-wake-up-6" className={buttonClass('secondary')}>Play today&rsquo;s class</Link>
            </div>
            <p className="text-sm text-muted">{CLASS_COUNT} classes · 5 to 30 minutes · {MOVE_COUNT} moves · Core · Strength · Mobility</p>
          </div>
          <HeroInstructor />
        </section>

        {/* Class library */}
        <section id="classes" className={`${wrap} scroll-mt-20 py-10`}>
          <SecHead eyebrow="Class library" title="Find your class">Filter by what you have and how long you&rsquo;ve got. Save favourites to find them again.</SecHead>
          <ClassLibrary signedIn={Boolean(user)} onRecord={user ? recordCompletion : undefined} />
          <Link href="/try" className="mt-6 flex items-center justify-between gap-4 rounded-card border border-stone bg-surface p-5 hover:border-ink">
            <span><span className="block font-display text-xl font-extrabold uppercase">Build your own workout</span><span className="text-sm text-muted">Pick a style, the areas you want to work on and your time. Free, no sign-up.</span></span>
            <span aria-hidden className="text-2xl">›</span>
          </Link>
        </section>

        {/* Plans */}
        <section id="plans" className={`${wrap} scroll-mt-20 py-10`}>
          <SecHead eyebrow="Programmes" title="Follow a plan">Classes grouped in a sensible order. Start at the first one you haven&rsquo;t done.</SecHead>
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
        </section>

        {/* Memberships (black band) */}
        <section id="membership" className="band mt-6 scroll-mt-16 py-14 sm:py-20">
          <div className={wrap}>
            <SecHead eyebrow="Membership" title="Memberships">Every plan starts with 7 days free. Cancel any time. Prices are being finalised before launch.</SecHead>
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
            <SignupForm tiers={TIERS.map((t) => ({ key: t.key, name: t.name }))} />
            <p className="mt-4 text-sm text-muted">Have a BAYSE code? Choose a plan, then tap &ldquo;Add promotion code&rdquo; on the payment page. A free-membership code means you are not charged.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
