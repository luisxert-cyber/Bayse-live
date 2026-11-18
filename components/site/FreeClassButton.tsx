'use client';
// "Play a free class": opens the free class in a window over the page, so visitors never leave where they are.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { WORKOUTS, workoutMinutes } from '@/lib/workouts/catalog';

const FREE = WORKOUTS.find((w) => w.free) ?? WORKOUTS[0];

export function FreeClassButton({ className, children }: { className: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => { setDone(false); setOpen(true); }} className={className}>{children}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={FREE.name} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto w-full max-w-lg border border-stone bg-bg p-3 sm:p-4" style={{ marginTop: 'max(12px, env(safe-area-inset-top, 0px))' }}>
            <div className="flex items-start justify-between gap-3 px-1 pb-3">
              <div>
                <p className="eyebrow">Free class · {workoutMinutes(FREE)} min</p>
                <h2 className="mt-1 text-[24px] leading-tight">{FREE.name}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center border border-stone text-xl">×</button>
            </div>
            <p className="mb-2 text-xs text-muted">Only exercise if you are well enough to. Stop if anything hurts, and check with your doctor first if you are pregnant, injured or have a health condition. By playing you accept our <a href="/terms#health" className="underline">health and safety terms</a>.</p>
            <WorkoutPlayer workout={FREE} exitHref="/" onExit={() => setOpen(false)} onComplete={() => setDone(true)} />
            <div className="mt-3 border border-white p-4 text-center">
              <p className="font-bold">{done ? 'Loved it? There’s a whole library waiting.' : 'Like it? Get every class free for 7 days.'}</p>
              <Link href="/start/welcome" className="mt-3 inline-flex min-h-[46px] items-center justify-center bg-white px-6 text-sm font-bold uppercase text-black">Start my 7-day free trial</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
