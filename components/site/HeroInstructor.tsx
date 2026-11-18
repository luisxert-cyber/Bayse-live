'use client';
// Hero art panel: the BAYSE instructor working through a few signature moves.
import { useEffect, useState } from 'react';
import { Figure } from '@/components/workout/Figure';

const SHOW = [
  { move: 'birddog', name: 'Bird dog' },
  { move: 'bridge', name: 'Glute bridge' },
  { move: 'hundred', name: 'The hundred' },
  { move: 'plank', name: 'Plank' },
  { move: 'squat', name: 'Squat' },
  { move: 'swimming', name: 'Swimming' },
];

export function HeroInstructor() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % SHOW.length), 5200);
    return () => clearInterval(id);
  }, []);
  const s = SHOW[i];
  return (
    <figure className="min-w-0 rounded-3xl border border-stone bg-surface p-3">
      <div className="relative overflow-hidden rounded-2xl bg-bg">
        <Figure key={s.move} move={s.move} className="block w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-bg" aria-live="polite">{s.name}</span>
      </div>
      <figcaption className="flex justify-between gap-3 px-1 pt-2.5 text-[13px] text-muted">
        <span>Follow the BAYSE instructor, move by move</span>
        <span className="hidden sm:inline">Voice cues · timer</span>
      </figcaption>
    </figure>
  );
}
