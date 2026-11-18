import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero, Check } from '@/components/site/PageHero';
import { wrap, Tick, PHOTO, CodesSection, TrialCta } from '@/components/site/sections';
import { TIERS, BILLING, PRIVATE_SESSION_PRICE, LIVE_CLASSES_PER_WEEK } from '@/lib/site/offer';

export const metadata = { title: 'Pricing', description: 'The BAYSE Club pricing: Foundation £19.99, Inner Circle £39.99 and Black £79.99 every 28 days, after 7 days free.' };

const ROWS: [string, boolean, boolean, boolean][] = [
  ['Your personal plan, 4 to 12 weeks', true, true, true],
  ['On-demand classes, filmed classes and the workout builder', true, true, true],
  ['BAYSE Daily: your next best move each day', true, true, true],
  ['Recipes, shopping lists and allergy filters', true, true, true],
  ['Progress, milestones and member rewards', true, true, true],
  ['Community, Circles, Clubs and chat rooms', true, true, true],
  [`${LIVE_CLASSES_PER_WEEK} live Zoom classes a week`, false, true, true],
  ['Monthly challenges', false, true, true],
  ['One 45-minute private Zoom session every 28 days', false, false, true],
  [`Book extra 1-to-1s (${PRIVATE_SESSION_PRICE} each)`, true, true, true],
];

const FAQ: [string, string][] = [
  ['Why every 28 days and not monthly?', 'Every billing period is exactly the same length, so you always get the same value. It means 13 payments in a year, and some calendar months have two.'],
  ['What happens after my free trial?', 'On day 8 your chosen plan starts and you pay the first 28 days. Cancel at any point in the first 7 days from My BAYSE and you pay nothing.'],
  ['How do I cancel?', 'From My BAYSE → Membership, at any time. Cancellation needs 28 days’ notice; if your next payment falls inside that notice you pay one last period and keep everything until it ends. The terms explain this with an example.'],
  ['Can I change plan?', 'Yes, you can move up or down between plans at any time.'],
  ['I’m a BAYSE studio member. Do I pay?', 'Qualifying £99 and £148 studio memberships include BAYSE Foundation at no extra cost while your studio membership is active. You can add live classes or 1-to-1s if you want them.'],
  ['What if I don’t use my Black 1-to-1?', 'It carries over for one more 28-day period, then expires. You can cancel a 1-to-1 up to 12 hours before and keep it.'],
];

export default function Pricing() {
  return (
    <SitePage>
      <PageHero eyebrow="Pricing" title="7 days free. Then from £19.99." intro={`Three plans, billed ${BILLING}. Try any of them free for 7 days and cancel in a couple of taps if it’s not for you.`} image={PHOTO.core} cta={false} />

      <section className={`${wrap} py-12`}>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => {
            const featured = 'featured' in t && t.featured;
            return (
              <div key={t.key} className={`flex min-w-0 flex-col gap-3 p-6 ${featured ? 'border-2 border-white' : 'border border-stone'}`} data-plan-card>
                {featured ? <p className="text-xs font-bold uppercase italic">Most popular</p> : <p className="text-xs font-bold uppercase text-muted">{t.tagline}</p>}
                <p className="text-2xl font-bold uppercase">{t.name}</p>
                <p><span className="text-[40px] font-bold leading-none">{t.price}</span> <span className="text-sm text-muted">{BILLING}</span></p>
                <p className="text-sm text-muted">{t.bestFor}</p>
                <ul className="flex-1 space-y-2 text-[15px]">{t.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                <Link href="/start/welcome" className={`mt-2 inline-flex min-h-[48px] items-center justify-center px-5 text-sm font-bold uppercase ${featured ? 'bg-white text-black' : 'border border-white hover:bg-white hover:text-black'}`}>Start 7 days free</Link>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">13 payments a year. <Link href="/free-trial" className="underline">What’s in the free trial</Link> · <Link href="/terms" className="underline">Terms</Link></p>
      </section>

      <section className={`${wrap} pb-12`}>
        <h2 className="text-[30px] sm:text-[40px]">Compare plans</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] border border-stone text-sm">
            <thead>
              <tr className="border-b border-stone text-left"><th className="p-3 font-normal text-muted">What you get</th>{TIERS.map((t) => <th key={t.key} className="p-3 text-center font-bold uppercase">{t.name.replace('BAYSE ', '')}<br /><span className="text-xs font-normal normal-case text-muted">{t.price}</span></th>)}</tr>
            </thead>
            <tbody>
              {ROWS.map(([label, ...cols]) => (
                <tr key={label} className="border-t border-stone"><td className="p-3">{label}</td>{cols.map((on, i) => <td key={i} className="p-3 text-center"><Check on={on} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${wrap} grid gap-4 pb-12 md:grid-cols-2`}>
        <div className="border border-stone p-6">
          <p className="eyebrow">Studio members</p>
          <h3 className="mt-2 text-2xl font-bold uppercase">Already a BAYSE studio member?</h3>
          <p className="mt-3 text-muted">Qualifying £99 and £148 studio memberships include BAYSE Foundation at no extra charge, for as long as your studio membership is active. There’s no second subscription to set up.</p>
          <Link href="/sign-in" className="mt-5 inline-flex min-h-[44px] items-center border border-white px-5 text-sm font-bold uppercase hover:bg-white hover:text-black">Sign in or join</Link>
        </div>
        <div className="border border-stone p-6">
          <p className="eyebrow">1-to-1s</p>
          <h3 className="mt-2 text-2xl font-bold uppercase">Private Zoom sessions</h3>
          <p className="mt-3 text-muted">45 minutes with a BAYSE instructor, just you. {PRIVATE_SESSION_PRICE} each, or one every 28 days included with BAYSE Black. Free to cancel up to 12 hours before.</p>
          <Link href="/instructors" className="mt-5 inline-flex min-h-[44px] items-center border border-white px-5 text-sm font-bold uppercase hover:bg-white hover:text-black">Meet the instructors</Link>
        </div>
      </section>

      <CodesSection />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="text-[30px] sm:text-[40px]">Pricing questions</h2>
        <div className="mt-6 divide-y divide-stone border-y border-stone">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <TrialCta />
    </SitePage>
  );
}
