'use client';
// Any "free trial" link (to /start/welcome) opens sign-up in a window over the current page,
// so the address doesn't change. Plans, account and membership steps happen inside the window;
// Stripe's secure payment page and the finished member app open full screen.
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function TrialWindow() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const framed = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (framed) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== '/start/welcome') return;
      if (path.startsWith('/start') || path.startsWith('/admin')) return;
      e.preventDefault();
      setOpen(true);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'bayse:navigate') return;
      const href = String(e.data.href || '/');
      if (href.startsWith('/')) { setOpen(false); window.location.href = href; }
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('message', onMsg);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('message', onMsg); };
  }, [framed, path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Start your 7-day free trial" data-trial-window
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black sm:items-center sm:bg-black/75 sm:p-6 sm:backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="relative flex h-[100dvh] max-h-full w-full max-w-xl flex-col bg-bg pb-[env(safe-area-inset-bottom)] sm:h-[88vh] sm:border sm:border-stone sm:pb-0">
        <div className="flex shrink-0 items-center justify-between border-b border-stone px-4 py-1.5 pt-[calc(6px+env(safe-area-inset-top))] sm:py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">7-day free trial · 100% free</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center text-2xl leading-none">×</button>
        </div>
        <iframe src="/start/welcome" title="Start your free trial" className="min-h-0 w-full flex-1 bg-black" />
      </div>
    </div>
  );
}

/** Inside the trial window: hide the site header, and hand anything outside sign-up back to the main page. */
export function FrameBridge() {
  const path = usePathname();
  useEffect(() => {
    if (window.self === window.top) return;
    document.documentElement.dataset.framed = '1';
    const fullScreen = !path.startsWith('/start') || path.startsWith('/start/payment');
    if (fullScreen) window.parent.postMessage({ type: 'bayse:navigate', href: window.location.pathname + window.location.search }, window.location.origin);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) { e.preventDefault(); window.open(url.href, '_blank', 'noopener'); return; }
      if (!url.pathname.startsWith('/start')) { e.preventDefault(); window.parent.postMessage({ type: 'bayse:navigate', href: url.pathname + url.search + url.hash }, window.location.origin); }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [path]);
  return null;
}
