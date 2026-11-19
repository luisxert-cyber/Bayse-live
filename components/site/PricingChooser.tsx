import Link from 'next/link';
import { TIERS, BILLING, STUDIO_NOTE } from '@/lib/site/offer';

// Pricing for everyone first: The BAYSE Club is a national online membership.
// Inner Circle and Black are where the value is, so their cards carry a highlight line and stand out;
// Foundation says plainly what it does not include.
// BAYSE studio members get their own section underneath. `studio="summary"` (home page) keeps that to
// one box that links to the full section on the pricing page.

const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="mt-[3px] h-4 w-4 shrink-0"><circle cx="8" cy="8" r="8" fill="rgb(var(--muted))" /><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#000" strokeWidth="1.8" /></svg>
);
const Cross = () => <span aria-hidden className="mt-[1px] inline-block w-4 shrink-0 text-center text-muted">–</span>;

type Tier = (typeof TIERS)[number];

/** One plan. `studio` shows the studio member price and wording. */
export function PlanCard({ t, studio = false }: { t: Tier; studio?: boolean }) {
  const featured = t.key === 'club', top = t.key === 'coaching', free = studio && t.key === 'essential';
  const highlight = studio ? t.studioHighlight : t.highlight;
  return (
    <div className={`relative flex min-w-0 flex-col gap-3 p-6 ${featured ? 'border-2 border-white bg-surface md:-my-3 md:py-9' : top ? 'silver-border' : 'border border-stone'}`} {...(studio ? { 'data-studio-plan-card': true } : { 'data-plan-card': true })}>
      {featured ? <p className="self-start bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-black">Most popular</p>
        : <p className="text-xs font-bold uppercase text-muted">{top ? 'The most personal' : t.tagline}</p>}
      <p className="text-2xl font-bold uppercase">{t.name}</p>
      <p>
        <span className="text-[40px] font-bold leading-none">{studio ? t.studioPrice : t.price}</span>{' '}
        {free ? <span className="text-sm text-muted">usually <span className="line-through">{t.price}</span></span>
          : <span className="text-sm text-muted">{BILLING}{studio ? <> · usually <span className="line-through">{t.price}</span></> : null}</span>}
      </p>
      {highlight && <p className={`px-3 py-2 text-sm font-bold ${featured ? 'bg-white text-black' : 'border border-stone'}`}>{highlight}</p>}
      <p className="text-sm text-muted">{t.bestFor}</p>
      <ul className="flex-1 space-y-2 text-[15px]">
        {(t.items as readonly string[]).map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}
        {(t.not as readonly string[]).map((i) => <li key={i} className="flex gap-3 text-muted"><Cross /><span>{i} <span className="text-xs">(Inner Circle and Black)</span></span></li>)}
      </ul>
      {!studio && <Link href="/start/welcome" className={`mt-2 inline-flex min-h-[48px] items-center justify-center px-5 text-sm font-bold uppercase ${featured ? 'bg-white text-black hover:opacity-90' : 'border border-white hover:bg-white hover:text-black'}`}>{featured ? 'Start Inner Circle free for 7 days' : 'Start 7 days free'}</Link>}
    </div>
  );
}

export function PricingChooser({ studio = 'full' }: { studio?: 'full' | 'summary' }) {
  return (
    <section id="prices" className="mx-auto w-full max-w-5xl scroll-mt-28 px-4 py-12 sm:px-6">
      <div id="new">
        <p className="eyebrow">Membership</p>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">7 days free, then from £19.99</h2>
        <p className="mt-3 max-w-[60ch] text-muted">Join from anywhere in the UK. Billed {BILLING}, cancel any time. Most members choose Inner Circle: it is the one with live classes, your plan, nutrition and progress.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
          {TIERS.map((t) => <PlanCard key={t.key} t={t} />)}
        </div>
        <p className="mt-6 text-xs text-muted">13 payments a year. <Link href="/free-trial" className="underline">What’s in the free trial</Link> · <Link href="/terms" className="underline">Terms</Link></p>
      </div>

      {studio === 'summary' ? (
        <div className="mt-10 grid gap-5 border border-stone p-6 md:grid-cols-[1fr_auto] md:items-center" data-studio-summary>
          <div>
            <p className="eyebrow">Already train at a BAYSE studio?</p>
            <h3 className="mt-2 text-xl font-bold uppercase">Foundation is on us. The rest is half price.</h3>
            <p className="mt-2 max-w-[60ch] text-sm text-muted">For active £99 and £148 studio memberships. Inner Circle is {TIERS[1].studioPrice} and Black is {TIERS[2].studioPrice} {BILLING}.</p>
          </div>
          <Link href="/pricing#studio-members" className="inline-flex min-h-[48px] items-center justify-center border border-white px-6 text-sm font-bold uppercase hover:bg-white hover:text-black">Studio member prices</Link>
        </div>
      ) : (
        <div id="studio-members" className="mt-14 scroll-mt-28 border-t border-stone pt-12">
          <p className="eyebrow">For BAYSE studio members</p>
          <h2 className="mt-2 text-[30px] sm:text-[40px]">Foundation is included. The rest is half price.</h2>
          <p className="mt-3 max-w-[60ch] text-muted">If you train at a BAYSE reformer studio on a £99 or £148 membership, this is what you get for as long as it is active.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
            {TIERS.map((t) => <PlanCard key={t.key} t={t} studio />)}
          </div>
          <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {['Create your free account.', 'Pick your studio in You → Membership.', 'Your studio confirms it and your member prices appear.'].map((step, i) => (
              <li key={step} className="flex gap-3 border border-stone p-4"><span className="font-bold">{i + 1}</span><span className="text-muted">{step}</span></li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted">{STUDIO_NOTE} There’s no free trial on member prices and codes can’t be added to them.</p>
          <Link href="/start/welcome" className="mt-5 inline-flex min-h-[52px] items-center justify-center border border-white px-6 text-sm font-bold uppercase hover:bg-white hover:text-black">Create my account and link my studio</Link>
        </div>
      )}
    </section>
  );
}
