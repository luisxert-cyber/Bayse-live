'use client';
// "Find your class" (BAYSE On Demand layout) with the real BAYSE classes behind it.
// Every card opens the class player on the page. The free class plays for anyone;
// the rest play for signed-in members, and visitors are offered the free trial instead.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FigureStill } from '@/components/workout/Figure';
import { WorkoutPlayer } from '@/components/workout/WorkoutPlayer';
import { EXERCISES, WORKOUTS, workoutMinutes, type Style, type Workout } from '@/lib/workouts/catalog';
import { READY, READY_STYLE, STYLES } from '@/lib/workouts/builder';
import { buttonClass } from '@/components/ui';

type Card = { w: Workout; style: Style; minutes: number; level: 1 | 2 | 3; free: boolean };

const QUICK_STYLE: Record<string, Style> = { 'wake-up-6': 'flow', 'core-10': 'mat', 'glutes-12': 'mat', 'wind-down-8': 'flow' };
const LEVEL_OF = { Beginner: 1, 'All levels': 2, Intermediate: 3 } as const;
const LEVEL_NAME = ['', 'Beginner', 'All levels', 'Intermediate'] as const;

const CLASSES: Card[] = [...WORKOUTS, ...READY].map((w) => ({
  w,
  style: READY_STYLE[w.key] ?? QUICK_STYLE[w.key] ?? 'mat',
  minutes: workoutMinutes(w),
  level: LEVEL_OF[w.level],
  free: Boolean(w.free),
}));

const STYLE_OPTS = ['All', ...(Object.keys(STYLES) as Style[])] as const;
const LENGTH = ['Any', 'Up to 15 min', '16 to 25 min', 'Over 25 min'] as const;
const LEVELS = ['All', 'Beginner', 'All levels', 'Intermediate'] as const;

function Chips<T extends string>({ label, options, value, onChange, name }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; name?: (v: T) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[64px] shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}
          className="min-h-[36px] rounded-full border border-stone bg-surface px-3.5 text-sm hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-bg">
          {name ? name(o) : o}
        </button>
      ))}
    </div>
  );
}

const thumbMove = (w: Workout) => EXERCISES[(w.blocks[1] ?? w.blocks[0]).ex]?.move ?? 'childs';

export function ClassLibrary({ signedIn, onRecord }: { signedIn: boolean; onRecord?: (key: string) => Promise<void> }) {
  const [style, setStyle] = useState<(typeof STYLE_OPTS)[number]>('All');
  const [len, setLen] = useState<(typeof LENGTH)[number]>('Any');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  const [open, setOpen] = useState<Card | null>(null);

  const shown = useMemo(() => CLASSES.filter((c) =>
    (style === 'All' || c.style === style) &&
    (level === 'All' || LEVEL_NAME[c.level] === level) &&
    (len === 'Any' || (len === 'Up to 15 min' ? c.minutes <= 15 : len === '16 to 25 min' ? c.minutes > 15 && c.minutes <= 25 : c.minutes > 25)),
  ).sort((a, b) => Number(b.free) - Number(a.free)), [style, len, level]);

  // "Play today's class" and other links open a class with #play-<key>.
  const fromHash = useCallback(() => {
    const m = /^#play-([a-z0-9-]+)$/.exec(window.location.hash);
    const c = m && CLASSES.find((x) => x.w.key === m[1]);
    if (c) setOpen(c);
  }, []);
  useEffect(() => {
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [fromHash]);

  const close = useCallback(() => {
    setOpen(null);
    if (window.location.hash.startsWith('#play-')) history.replaceState(null, '', `${window.location.pathname}#classes`);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, close]);

  const canPlay = (c: Card) => c.free || signedIn;

  return (
    <div>
      <div className="grid gap-3">
        <Chips label="Style" options={STYLE_OPTS} value={style} onChange={setStyle} name={(o) => (o === 'All' ? 'All' : STYLES[o as Style].label)} />
        <Chips label="Length" options={LENGTH} value={len} onChange={setLen} />
        <Chips label="Level" options={LEVELS} value={level} onChange={setLevel} />
      </div>
      <p className="mb-3 mt-5 text-sm text-muted">{shown.length} {shown.length === 1 ? 'class' : 'classes'} · {signedIn ? 'tap any class to start' : 'the free class plays now, the rest come with your free trial'}</p>
      {shown.length ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {shown.map((c) => (
            <button key={c.w.key} type="button" data-class-card onClick={() => setOpen(c)}
              className="group flex min-w-0 flex-col overflow-hidden rounded-card border border-stone bg-surface text-left transition-colors hover:border-ink">
              <div className="relative bg-bg">
                <FigureStill move={thumbMove(c.w)} t={0.7} className="block w-full" />
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-bg">{c.minutes} min</span>
                <span className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.free ? 'bg-ink text-bg' : 'border border-stone bg-surface text-ink'}`}>
                  {c.free ? 'Free class' : signedIn ? 'Included' : 'Members'}
                </span>
                <span aria-hidden className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-bg">▶</span>
                </span>
              </div>
              <div className="grid gap-1.5 px-4 pb-4 pt-3.5">
                <h3 className="text-base uppercase">{c.w.name}</h3>
                <p className="text-sm text-muted">{STYLES[c.style].label} · {c.w.blocks.length} moves</p>
                <p className="flex items-center gap-1.5 text-[13px] text-muted">
                  {[1, 2, 3].map((n) => <i key={n} className={`h-2 w-2 rounded-full border-[1.5px] border-ink ${n <= c.level ? 'bg-ink' : ''}`} />)}
                  <span className="ml-1">{LEVEL_NAME[c.level]}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-stone px-4 py-10 text-center text-muted">
          No classes match. <button type="button" className="underline" onClick={() => { setStyle('All'); setLevel('All'); setLen('Any'); }}>Clear filters</button>
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label={open.w.name} className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="mx-auto w-full max-w-lg rounded-3xl bg-bg p-3 sm:p-4" style={{ marginTop: 'max(12px, env(safe-area-inset-top, 0px))' }}>
            <div className="flex items-start justify-between gap-3 px-1 pb-3">
              <div className="min-w-0">
                <p className="eyebrow">{STYLES[open.style].label} · {open.minutes} min</p>
                <h2 className="mt-1 text-[26px] leading-tight">{open.w.name}</h2>
                <p className="mt-1 text-sm text-muted">{open.w.summary}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone bg-surface text-lg hover:border-ink">×</button>
            </div>
            {canPlay(open) ? (
              <WorkoutPlayer key={open.w.key} workout={open.w} exitHref="/#classes" onExit={close}
                onComplete={signedIn && onRecord ? () => onRecord(open.w.key) : undefined} />
            ) : (
              <div className="rounded-3xl border border-stone bg-surface p-4 sm:p-5">
                <div className="overflow-hidden rounded-2xl bg-bg"><FigureStill move={thumbMove(open.w)} t={0.7} className="block w-full" /></div>
                <ol className="mt-4 grid gap-1 text-sm">
                  {open.w.blocks.slice(0, 6).map((b, i) => (
                    <li key={i} className="flex justify-between gap-2 border-t border-stone py-1.5"><span>{i + 1}. {EXERCISES[b.ex]?.name}</span><em className="not-italic text-muted">{b.seconds}s</em></li>
                  ))}
                  {open.w.blocks.length > 6 && <li className="border-t border-stone py-1.5 text-muted">+ {open.w.blocks.length - 6} more moves</li>}
                </ol>
                <p className="mt-4 font-semibold">This class comes with your free trial.</p>
                <p className="mt-1 text-sm text-muted">Start 7 days free to play every class, follow a plan and join live classes. Cancel any time.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/start/welcome" className={buttonClass('primary')}>Start 7 days free</Link>
                  <button type="button" onClick={() => setOpen(CLASSES.find((x) => x.free) ?? null)} className={buttonClass('secondary')}>Play the free class</button>
                </div>
                <p className="mt-3 text-sm text-muted">Already a member? <Link href="/sign-in" className="font-semibold text-ink underline">Sign in</Link></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
