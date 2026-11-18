'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMembershipCheckout } from '@/app/join/actions';

// The payment form, inside BAYSE. Stripe draws it (card, Apple Pay, Google Pay, promotion code)
// in a secure frame on this page, so card details never touch BAYSE and nobody leaves the app.

type Checkout = { mount: (el: HTMLElement) => void; destroy: () => void };
type StripeJs = { initEmbeddedCheckout: (o: { fetchClientSecret: () => Promise<string> }) => Promise<Checkout> };
declare global {
  interface Window { Stripe?: (key: string) => StripeJs }
}

const MESSAGES: Record<string, string> = {
  signin: 'Please sign in again to continue.',
  price: 'Please choose a membership.',
  not_connected: 'Payments are being switched on for this membership. Please try again shortly.',
  failed: 'We could not open the payment form. Nothing has been charged. Please try again.',
  script: 'We could not load the payment form. Check your connection and try again.',
};

let stripeJs: Promise<void> | null = null;
function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  stripeJs ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { stripeJs = null; s.remove(); reject(new Error('script')); };
    document.head.appendChild(s);
  });
  return stripeJs;
}

// Stripe allows one payment form on a page at a time, so starts and clean-ups run one after another.
let queue: Promise<unknown> = Promise.resolve();

export function EmbeddedCheckout({ priceId, publishableKey }: { priceId: string; publishableKey: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('failed');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let checkout: Checkout | null = null;
    setState('loading');

    const start = async () => {
      if (cancelled) return;
      try {
        await loadStripeJs();
        if (cancelled || !window.Stripe) return;
        let reason = '';
        const instance = await window.Stripe(publishableKey).initEmbeddedCheckout({
          fetchClientSecret: async () => {
            const res = await createMembershipCheckout(priceId);
            if (res.error) { reason = res.error; throw new Error(res.error); }
            return res.clientSecret;
          },
        }).catch((e: unknown) => { throw new Error(reason || (e instanceof Error && e.message === 'script' ? 'script' : 'failed')); });
        if (cancelled || !holder.current) { instance.destroy(); return; }
        checkout = instance;
        instance.mount(holder.current);
        setState('ready');
      } catch (e) {
        if (cancelled) return;
        const code = e instanceof Error ? e.message : 'failed';
        if (code === 'already') { router.replace('/you/membership?already=1'); return; }
        if (code === 'signin') { router.replace('/sign-in?next=/join'); return; }
        setError(code in MESSAGES ? code : 'failed');
        setState('error');
      }
    };

    queue = queue.then(start, start);
    return () => {
      cancelled = true;
      queue = queue.then(() => { try { checkout?.destroy(); } catch { /* already gone */ } });
    };
  }, [priceId, publishableKey, attempt, router]);

  return (
    <div>
      {state === 'loading' && <p className="py-10 text-center text-sm text-muted" role="status">Opening secure payment…</p>}
      {state === 'error' && (
        <div role="alert" className="rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm">
          <p>{MESSAGES[error]}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-2 font-bold underline">Try again</button>
        </div>
      )}
      {/* Stripe's form is always light, so it sits on white whatever the app theme. */}
      <div ref={holder} className={state === 'error' ? 'hidden' : 'overflow-hidden rounded-2xl bg-white'} />
    </div>
  );
}
