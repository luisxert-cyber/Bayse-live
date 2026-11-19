'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TIERS, BILLING, STUDIO_NOTE } from '@/lib/site/offer';

// Pricing asks one question first: are you a BAYSE studio member? (owner's choice, 19 Nov 2026)
// The answer swaps the three cards between standard and studio member prices, so nobody reads both.
// Before anyone answers (and without JavaScript) the standard prices show.
// Inner Circle and Black carry a highlight line; Foundation says plainly what it does not include.

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
      <Link href="/start/welcome" className={`mt-2 inline-flex min-h-[48px] items-center justify-center px-5 text-sm font-bold uppercase ${featured ? 'bg-white text-black hover:opacity-90' : 'border border-white hover:bg-white hover:text-black'}`}>
        {free ? 'Create my free account' : featured ? 'Start Inner Circle free for 7 days' : 'Start 7 days free'}
      </Link>
    </div>
  );
}

type Answer = 'yes' | 'no' | null;

const choice = (on: boolean) =>
  `flex min-h-[64px] flex-col items-center justify-center px-4 py-2 text-center uppercase ${on ? 'bg-white text-black' : 'border border-white hover:bg-white hover:text-black'}`;

/** `studio` is kept for older callers; both pages now show the same question. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PricingChooser({ studio: _layout = 'full' }: { studio?: 'full' | 'summary' }) {
  const [answer, setAnswer] = useState<Answer>(null);

  // A link straight to member prices (/pricing#studio-members) opens on them.
  useEffect(() => {
    if (window.location.hash === '#studio-members') setAnswer('yes');
    if (window.location.hash === '#new') setAnswer('no');
  }, []);

  const studio = answer === 'yes';

  return (
    <section id="prices" className="mx-auto w-full max-w-5xl scroll-mt-28 px-4 py-12 sm:px-6">
      <p className="eyebrow">Membership</p>
      <div className="mt-3 border border-stone p-5 sm:p-6" data-studio-question>
        <h2 className="text-[26px] sm:text-[34px]">Are you a BAYSE studio member?</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-muted">That’s a £99 or £148 membership at one of our reformer studios. It changes what you pay here.</p>
        <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Are you a BAYSE studio member?">
          <button type="button" aria-pressed={studio} onClick={() => setAnswer('yes')} className={choice(studio)} data-answer="yes">
            <span className="text-base font-bold">Yes</span>
            <span className="text-[11px] normal-case opacity-80">I train at a BAYSE studio</span>
          </button>
          <button type="button" aria-pressed={answer === 'no'} onClick={() => setAnswer('no')} className={choice(answer === 'no')} data-answer="no">
            <span className="text-base font-bold">No</span>
            <span className="text-[11px] normal-case opacity-80">I’m new to BAYSE</span>
          </button>
        </div>
      </div>

      <div aria-live="polite" className="mt-10">
        {studio ? (
          <div id="studio-members" className="scroll-mt-28">
            <p className="eyebrow">Studio member prices</p>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">Foundation is on us. The rest is half price.</h2>
            <p className="mt-3 max-w-[60ch] text-muted">For as long as your studio membership is active. Inner Circle and Black still start with 7 days free.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
              {TIERS.map((t) => <PlanCard key={t.key} t={t} studio />)}
            </div>
            <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
              {['Create your free account.', 'Enter the studio code your studio gives you in You → Membership.', 'Foundation switches on free and your member prices appear.'].map((step, i) => (
                <li key={step} className="flex gap-3 border border-stone p-4"><span className="font-bold">{i + 1}</span><span className="text-muted">{step}</span></li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">No code? Ask at your studio, or pick your studio in You → Membership and your studio team will confirm you. {STUDIO_NOTE} Promotion codes can’t be added to member prices.</p>
          </div>
        ) : (
          <div id="new" className="scroll-mt-28">
            <p className="eyebrow">{answer === 'no' ? 'New to BAYSE' : 'Online membership'}</p>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">7 days free, then from £19.99</h2>
            <p className="mt-3 max-w-[60ch] text-muted">Join from anywhere in the UK. Billed {BILLING}, cancel any time. Most members choose Inner Circle: it is the one with live classes, your plan, nutrition and progress.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
              {TIERS.map((t) => <PlanCard key={t.key} t={t} />)}
            </div>
            <p className="mt-6 text-xs text-muted">13 payments a year. <Link href="/free-trial" className="underline">What’s in the free trial</Link> · <Link href="/terms" className="underline">Terms</Link></p>
          </div>
        )}
      </div>
    </section>
  );
}
