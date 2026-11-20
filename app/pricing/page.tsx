import Link from 'next/link';
import { PricingChooser } from '@/components/site/PricingChooser';
import { StudioFinder } from '@/components/site/StudioFinder';
import { ReviewsBadge } from '@/components/site/ReviewsBadge';
import { SitePage } from '@/components/site/SitePage';
import { PageHero, Check } from '@/components/site/PageHero';
import { wrap, PHOTO, CodesSection, TrialCta } from '@/components/site/sections';
import { TIERS, BILLING, PRIVATE_SESSION_PRICE, LIVE_CLASSES_PLANNED, STRAPLINE } from '@/lib/site/offer';
import { pricingJsonLd, jsonLd } from '@/lib/site/seo';

export const metadata = { title: 'Pricing', description: 'The BAYSE Club pricing: Foundation £19.99, Inner Circle £39.99 and Black £89.99 every 28 days, after 7 days free. BAYSE studio members get Foundation included and half price on Inner Circle and Black.' };

const ROWS: [string, boolean, boolean, boolean][] = [
  ['On-demand classes, filmed classes and the workout builder', true, true, true],
  ['Reformer at home classes', true, true, true],
  ['The BAYSE Club community, General Chat, Circles and your studio’s group', true, true, true],
  ['Member-led walking, padel and social groups, and members near you', true, true, true],
  [`Up to ${LIVE_CLASSES_PLANNED} live Zoom classes a week`, false, true, true],
  ['Your personal plan, 4 to 12 weeks', false, true, true],
  ['Six programmes for your stage of life', false, true, true],
  ['Nutrition: recipes with videos, a weekly food plan, food diary and shopping lists', false, true, true],
  ['Daily recovery, sleep and effort scores', false, true, true],
  ['Levels, the weekly league, challenges and member rewards', false, true, true],
  ['One 40-minute private Zoom session per paid 28 days', false, false, true],
  ['Your own coach: priority Q&A and a progress review every 28 days', false, false, true],
  [`Book extra 1-to-1s (${PRIVATE_SESSION_PRICE} each)`, true, true, true],
];

// The same rows, grouped by the first plan that includes them (for phones).
const COMPARE_GROUPS = [
  { title: 'Every plan', note: 'Foundation, Inner Circle and Black', rows: ROWS.filter(([, f]) => f).map(([label]) => label) },
  { title: 'Inner Circle and Black', note: 'Everything above, plus', rows: ROWS.filter(([, f, ic]) => !f && ic).map(([label]) => label) },
  { title: 'Black only', note: 'Everything above, plus', rows: ROWS.filter(([, f, ic, b]) => !f && !ic && b).map(([label]) => label) },
];

const FAQ: [string, string][] = [
  ['Why every 28 days and not monthly?', 'Every billing period is exactly the same length, so you always get the same value. It means 13 payments in a year, and some calendar months have two.'],
  ['What happens after my free trial?', 'On day 8 your chosen plan starts and you pay the first 28 days. Cancel at any point in the first 7 days from My BAYSE and you pay nothing.'],
  ['How do I cancel?', 'From My BAYSE → Membership, at any time. Cancellation needs 28 days’ notice; if your next payment falls inside that notice you pay one last period and keep everything until it ends. The terms explain this with an example.'],
  ['Can I change plan?', 'Yes, you can move up or down between plans at any time.'],
  ['I’m a BAYSE studio member. Do I pay?', 'Active £99 and £148 studio memberships include BAYSE Foundation at no extra cost. Inner Circle is £19.99 and Black is £44.99 every 28 days, half the standard price. Enter the studio code your studio gives you in the app and your member prices apply straight away.'],
  ['What if my studio membership ends?', 'We tell you at least 28 days ahead. Included Foundation access then ends, and a half-price Inner Circle or Black membership is set to finish at the end of a paid period unless you choose a standard-price plan. We never raise what you pay without you agreeing to it.'],
  ['What if I don’t use my Black 1-to-1?', 'It’s for the 28 days you paid for and doesn’t carry over, so book it in that period. It unlocks after your first payment, not during the free trial. You can cancel a 1-to-1 up to 12 hours before and keep it.'],
];

export default function Pricing() {
  return (
    <SitePage>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pricingJsonLd)} />
      <PageHero eyebrow="Pricing" title="7 days free. Then from £19.99." intro={`${STRAPLINE} Three plans, billed ${BILLING}. New to BAYSE? Try any of them free for 7 days.`} image={PHOTO.core} cta={false} />

      <PricingChooser />
      <ReviewsBadge />

      <section className={`${wrap} pb-12`}>
        <h2 className="text-[30px] sm:text-[40px]">Compare plans</h2>
        {/* Phones: the same comparison as three short lists, so nothing runs off the screen */}
        <div className="mt-5 space-y-4 md:hidden" data-compare-mobile>
          {COMPARE_GROUPS.map((g) => (
            <div key={g.title} className="border border-stone p-5">
              <p className="text-lg font-bold uppercase">{g.title}</p>
              <p className="text-xs text-muted">{g.note}</p>
              <ul className="mt-3 space-y-2 text-[15px]">{g.rows.map((label) => <li key={label} className="flex gap-3"><span className="shrink-0"><Check /></span><span>{label}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-5 hidden overflow-x-auto md:block">
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
          <p className="eyebrow">Community</p>
          <h3 className="mt-2 text-2xl font-bold uppercase">Every plan includes the community</h3>
          <p className="mt-3 text-muted">The BAYSE Club feed, a group for each BAYSE studio, and walking, padel and social groups that members set up and run themselves. It’s part of Foundation, not an extra.</p>
          <Link href="/the-community" className="mt-5 inline-flex min-h-[44px] items-center border border-white px-5 text-sm font-bold uppercase hover:bg-white hover:text-black">See the community</Link>
        </div>
        <div className="border border-stone p-6">
          <p className="eyebrow">1-to-1s</p>
          <h3 className="mt-2 text-2xl font-bold uppercase">Private Zoom sessions</h3>
          <p className="mt-3 text-muted">40 minutes with a BAYSE instructor, just you. {PRIVATE_SESSION_PRICE} each, or one every 28 days included with BAYSE Black. Free to cancel up to 12 hours before.</p>
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
      <StudioFinder />
      <TrialCta />
    </SitePage>
  );
}
