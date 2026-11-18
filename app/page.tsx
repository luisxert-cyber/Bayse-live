import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';

const PILLARS = [
  { title: 'Personal programmes', body: '4, 6, 8 or 12-week plans built from your goals, experience and the time you really have.', status: 'ready' },
  { title: 'On-demand Pilates', body: 'Mat, sculpt, strength, mobility and express sessions from BAYSE instructors, wherever you are.', status: 'soon' },
  { title: 'Live classes', body: 'Interactive classes with a teaching instructor and a second instructor watching form and keeping you safe.', status: 'soon' },
  { title: 'Coaching', body: 'A real coach who knows your plan, checks in, and answers your questions.', status: 'soon' },
  { title: 'Nutrition', body: 'Recipes, simple meal plans and shopping lists. Practical, never a crash diet.', status: 'soon' },
  { title: 'Your people', body: 'Your studio community, small Circles, and member-run Padel, Walk and Social Clubs.', status: 'soon' },
] as const;

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-16">
          <div>
            <p className="eyebrow">BAYSE online · live and on demand</p>
            <h1 className="mt-4 text-[44px] font-semibold leading-[1.02] sm:text-[56px]">Your programme.<br />Your coach.<br />Your people.</h1>
            <p className="mt-5 max-w-md text-lg text-muted">Personalised Pilates and strength from the instructors behind BAYSE studios, with coaching, nutrition and a community of women who keep you going.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/start/welcome" className={buttonClass('primary')}>Build my plan</Link>
              <Link href="/pricing" className={buttonClass('secondary')}>See membership</Link>
            </div>
            <p className="mt-4 text-sm text-muted">Three minutes. No card needed to see your plan.</p>
          </div>
          <div className="relative">
            <img src="/images/studio-mat-core.webp" alt="A BAYSE instructor teaching a mat Pilates core exercise in the studio" className="aspect-[4/5] w-full rounded-[28px] object-cover" />
            <div className="absolute -bottom-5 left-5 right-5 rounded-card border border-stone bg-surface/95 p-4 shadow-card backdrop-blur sm:left-auto sm:w-64">
              <p className="eyebrow">Week 2 · Strong &amp; Sculpt</p>
              <p className="mt-1 font-serif text-lg">Full Body Pilates</p>
              <p className="text-sm text-muted">30 minutes · mat and light weights</p>
            </div>
          </div>
        </section>

        <section className="border-y border-stone bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <p className="eyebrow">How it works</p>
            <ol className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                ['Tell us about you', 'Your goals, experience, equipment and how many sessions a week feel realistic.'],
                ['Get your plan', 'We recommend a programme, explain why, and set out your weeks.'],
                ['Train with support', 'Follow your plan at home or live, with a coach and your community behind you.'],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="font-serif text-2xl text-accent">{i + 1}</span>
                  <div><p className="font-medium">{t}</p><p className="mt-1 text-sm text-muted">{b}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold sm:text-2xl">More than a video library</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-card border border-stone bg-surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-lg">{p.title}</p>
                  {p.status === 'soon' && <span className="rounded-pill bg-stone/60 px-2.5 py-0.5 text-xs text-muted">Coming soon</span>}
                </div>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="rounded-[28px] bg-ink px-6 py-12 text-bg sm:px-12">
            <p className="eyebrow !text-bg/60">Already a BAYSE studio member?</p>
            <h2 className="mt-3 max-w-lg text-xl font-semibold sm:text-2xl">Link your studio membership and keep your routine going at home.</h2>
            <p className="mt-3 max-w-lg text-bg/70">Choose your studio when you build your plan. Once your studio confirms your membership, your included digital benefits switch on automatically.</p>
            <Link href="/start/welcome" className="mt-6 inline-flex min-h-tap items-center rounded-pill bg-bg px-6 text-sm font-medium text-ink">Build my plan</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
