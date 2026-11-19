'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TIERS, BILLING, STUDIO_NOTE, STUDIO_INCLUDED, STUDIO_UPGRADE_EXTRAS } from '@/lib/site/offer';

// The pricing page asks one question first: are you a BAYSE studio member?
// The answer decides which three prices are shown, so nobody has to read both sets.
// Before anyone answers (and without JavaScript) the standard prices show.

type Answer = 'yes' | 'no' | null;

const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="mt-[3px] h-4 w-4 shrink-0"><circle cx="8" cy="8" r="8" fill="rgb(var(--muted))" /><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#000" strokeWidth="1.8" /></svg>
);

const choice = (on: boolean) =>
  `flex min-h-[64px] flex-col items-center justify-center px-4 py-2 text-center uppercase ${on ? 'bg-white text-black' : 'border border-white hover:bg-white hover:text-black'}`;

export function PricingChooser() {
  const [answer, setAnswer] = useState<Answer>(null);

  // A link straight to the member prices (/pricing#studio-members) opens on them.
  useEffect(() => {
    if (window.location.hash === '#studio-members') setAnswer('yes');
    if (window.location.hash === '#new') setAnswer('no');
  }, []);

  const studio = answer === 'yes';

  return (
    <section id="prices" className="mx-auto w-full max-w-5xl scroll-mt-28 px-4 py-12 sm:px-6">
      <div className="border border-stone p-5 sm:p-6" data-studio-question>
        <h2 className="text-[26px] sm:text-[34px]">Are you a BAYSE studio member?</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-muted">That’s a £99 or £148 membership at one of our reformer studios. It changes what you pay here.</p>
        <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Are you a BAYSE studio member?">
          <button type="button" aria-pressed={studio} onClick={() => setAnswer('yes')} className={choice(studio)}>
            <span className="text-base font-bold">Yes</span>
            <span className="text-[11px] normal-case opacity-80">I train at a BAYSE studio</span>
          </button>
          <button type="button" aria-pressed={answer === 'no'} onClick={() => setAnswer('no')} className={choice(answer === 'no')}>
            <span className="text-base font-bold">No</span>
            <span className="text-[11px] normal-case opacity-80">I’m new to BAYSE</span>
          </button>
        </div>
      </div>

      <div aria-live="polite" className="mt-8">
        {studio ? (
          <div id="studio-members">
            <p className="eyebrow">Studio member prices</p>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">On demand and community are included. The rest is half price.</h2>
            <p className="mt-3 max-w-[60ch] text-muted">For as long as your studio membership is active.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-3 border border-stone p-6" data-studio-plan-card>
                <p className="text-xs font-bold uppercase text-muted">Included with your studio membership</p>
                <p className="text-2xl font-bold uppercase">{STUDIO_INCLUDED.name}</p>
                <p><span className="text-[40px] font-bold leading-none">Free</span></p>
                <p className="text-sm text-muted">{STUDIO_INCLUDED.bestFor}</p>
                <ul className="flex-1 space-y-2 text-[15px]">{STUDIO_INCLUDED.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
              </div>
              {TIERS.filter((t) => t.key !== 'essential').map((t) => {
                // Inner Circle is where a studio member gets the rest of Foundation, so spell it out instead of "Everything in Foundation".
                const items: readonly string[] = t.key === 'club' ? ['Everything included with your studio membership', ...STUDIO_UPGRADE_EXTRAS, ...t.items.filter((i) => i !== 'Everything in Foundation')] : t.items;
                return (
                  <div key={t.key} className="flex min-w-0 flex-col gap-3 border border-stone p-6" data-studio-plan-card>
                    <p className="text-xs font-bold uppercase text-muted">Half price for studio members</p>
                    <p className="text-2xl font-bold uppercase">{t.name}</p>
                    <p>
                      <span className="text-[40px] font-bold leading-none">{t.studioPrice}</span>{' '}
                      <span className="text-sm text-muted">{BILLING} · usually <span className="line-through">{t.price}</span></span>
                    </p>
                    <p className="text-sm text-muted">{t.bestFor}</p>
                    <ul className="flex-1 space-y-2 text-[15px]">{items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                  </div>
                );
              })}
            </div>
            <ol className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              {['Create your free account.', 'Pick your studio in You → Membership.', 'Your studio confirms it and your member prices appear.'].map((step, i) => (
                <li key={step} className="flex gap-3 border border-stone p-4"><span className="font-bold">{i + 1}</span><span className="text-muted">{step}</span></li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">{STUDIO_NOTE} There’s no free trial on member prices and codes can’t be added to them.</p>
            <Link href="/start/welcome" className="mt-5 inline-flex min-h-[52px] items-center justify-center bg-white px-6 text-sm font-bold uppercase text-black hover:opacity-90">Create my account and link my studio</Link>
          </div>
        ) : (
          <div id="new">
            <p className="eyebrow">{answer === 'no' ? 'New to BAYSE' : 'Standard online prices'}</p>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">7 days free, then choose your plan</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
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
            <p className="mt-4 text-sm text-muted">Thinking of joining a studio? <a href="#studios" className="underline">Find your local studio</a> and on-demand classes and the community are included with your membership.</p>
          </div>
        )}
      </div>
    </section>
  );
}
