'use client';
// Filterable preview of the on-demand library (BAYSE On Demand style).
// Honest by design: classes open at launch, so cards say so instead of playing anything.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LibraryClass } from '@/lib/site/offer';

const FOCUS = ['All', 'Full body', 'Core', 'Glutes & legs', 'Upper body', 'Stretch'] as const;
const LEVEL = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;
const LENGTH = ['Any', 'Under 20 min', '20 to 30 min', 'Over 30 min'] as const;

function Motif({ c }: { c: LibraryClass }) {
  const o = (c.id * 11) % 36;
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 h-full w-full">
      <g stroke="#fff" strokeOpacity=".3" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <circle cx={230 - o} cy="160" r="44" /><circle cx={230 - o} cy="160" r="76" /><circle cx={230 - o} cy="160" r="110" />
        <rect x="40" y="150" width="130" height="14" rx="7" />
      </g>
    </svg>
  );
}

function Chips<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[72px] shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}
          className="min-h-[36px] rounded-full border border-stone bg-surface px-3.5 text-sm hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-bg">
          {o}
        </button>
      ))}
    </div>
  );
}

export function ClassLibrary({ classes }: { classes: LibraryClass[] }) {
  const [focus, setFocus] = useState<(typeof FOCUS)[number]>('All');
  const [level, setLevel] = useState<(typeof LEVEL)[number]>('All');
  const [len, setLen] = useState<(typeof LENGTH)[number]>('Any');
  const [q, setQ] = useState('');

  const shown = useMemo(() => classes.filter((c) =>
    (focus === 'All' || c.focus === focus) &&
    (level === 'All' || LEVEL.indexOf(level) === c.level) &&
    (len === 'Any' || (len === 'Under 20 min' ? c.minutes < 20 : len === '20 to 30 min' ? c.minutes >= 20 && c.minutes <= 30 : c.minutes > 30)) &&
    (!q || `${c.name} ${c.focus}`.toLowerCase().includes(q.toLowerCase())),
  ), [classes, focus, level, len, q]);

  return (
    <div>
      <div className="grid gap-3">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or focus" aria-label="Search classes"
          className="min-h-[44px] w-full rounded-[10px] border border-stone bg-surface px-3 text-base sm:max-w-md" />
        <Chips label="Focus" options={FOCUS} value={focus} onChange={setFocus} />
        <Chips label="Level" options={LEVEL} value={level} onChange={setLevel} />
        <Chips label="Length" options={LENGTH} value={len} onChange={setLen} />
      </div>
      <p className="mb-3 mt-5 text-sm text-muted">{shown.length} {shown.length === 1 ? 'class' : 'classes'} · a taste of the library at launch</p>
      {shown.length ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {shown.map((c) => (
            <article key={c.id} data-class-card className="flex min-w-0 flex-col overflow-hidden rounded-card border border-stone bg-surface">
              <div className="relative aspect-[16/10] overflow-hidden text-white" style={{ background: `linear-gradient(135deg, hsl(0 0% ${9 + (c.id % 4) * 3}%), hsl(0 0% ${25 + (c.id % 4) * 3}%))` }}>
                <Motif c={c} />
                <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-white/70 bg-white/15">▶</span></span>
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold">{c.minutes} min</span>
                <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">At launch</span>
              </div>
              <div className="grid gap-1.5 px-4 pb-4 pt-3.5">
                <h3 className="text-base uppercase">{c.name}</h3>
                <p className="text-sm text-muted">{c.kit} · {c.focus}</p>
                <p className="flex items-center gap-1.5 text-[13px] text-muted">
                  {[1, 2, 3].map((n) => <i key={n} className={`h-2 w-2 rounded-full border-[1.5px] border-ink ${n <= c.level ? 'bg-ink' : ''}`} />)}
                  <span className="ml-1">{LEVEL[c.level]}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-stone px-4 py-10 text-center text-muted">
          No classes match. <button type="button" className="underline" onClick={() => { setFocus('All'); setLevel('All'); setLen('Any'); setQ(''); }}>Clear filters</button>
        </div>
      )}
      <Link href="/start/welcome" className="mt-6 inline-block text-sm font-semibold underline">Build my plan to get classes picked for you →</Link>
    </div>
  );
}
