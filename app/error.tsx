'use client';
import { useEffect } from 'react';
import { buttonClass } from '@/components/ui/Button';

// A page left open across a site update calls actions that no longer exist ("Failed to find Server Action").
// Reload once to pick up the new version, rather than showing an error.
const STALE = /server action|chunkloaderror|loading chunk|failed to fetch dynamically imported module/i;

export default function Error({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  const stale = STALE.test(`${error?.name ?? ''} ${error?.message ?? ''}`);
  useEffect(() => {
    if (!stale) return;
    try {
      if (sessionStorage.getItem('bayse-reloaded') === location.pathname) return;
      sessionStorage.setItem('bayse-reloaded', location.pathname);
    } catch { /* storage blocked: still reload once per page view */ }
    location.reload();
  }, [stale]);
  if (stale) return <main className="flex min-h-dvh items-center justify-center text-muted">Updating to the latest version…</main>;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-xl font-semibold">Sorry, that did not load</h1>
      <p className="mt-2 text-sm text-muted">Nothing you entered has been lost. Please try again.</p>
      <button onClick={() => { try { sessionStorage.removeItem('bayse-reloaded'); } catch {} location.reload(); }} className={`${buttonClass('primary')} mt-6`}>Try again</button>
    </main>
  );
}
