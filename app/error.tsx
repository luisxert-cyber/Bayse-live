'use client';
import { buttonClass } from '@/components/ui/Button';
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-xl font-semibold">Sorry, that did not load</h1>
      <p className="mt-2 text-sm text-muted">Nothing you entered has been lost. Please try again.</p>
      <button onClick={reset} className={`${buttonClass('primary')} mt-6`}>Try again</button>
    </main>
  );
}
