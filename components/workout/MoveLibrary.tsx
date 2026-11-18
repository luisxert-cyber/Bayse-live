'use client';
// Browse every move: search, filter by style, area and equipment, tap to see it animated with cues.
import { useMemo, useState } from 'react';
import { EXERCISES, type Area, type Style } from '@/lib/workouts/catalog';
import { AREA_LABELS, STYLES, EQUIPMENT_LABELS, type Equipment } from '@/lib/workouts/builder';
import { Figure, FigureStill } from './Figure';

const LEVEL = ['', 'Beginner', 'Intermediate', 'Advanced'];
const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" aria-pressed={on} onClick={onClick} className="min-h-[34px] shrink-0 rounded-full border border-stone bg-surface px-3 text-sm aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-bg">{children}</button>
);

export function MoveLibrary() {
  const all = useMemo(() => Object.values(EXERCISES).sort((a, b) => a.name.localeCompare(b.name)), []);
  const [q, setQ] = useState('');
  const [style, setStyle] = useState<Style | 'all'>('all');
  const [area, setArea] = useState<Area | 'all'>('all');
  const [eq, setEq] = useState<Equipment | 'none' | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const shown = all.filter((e) =>
    (style === 'all' || (e.styles ?? []).includes(style)) &&
    (area === 'all' || e.areas.includes(area)) &&
    (eq === 'all' || (eq === 'none' ? !e.prop : e.prop === eq)) &&
    (!q || e.name.toLowerCase().includes(q.toLowerCase())));
  const sel = open ? EXERCISES[open] : null;

  return (
    <div className="space-y-4">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${all.length} moves`} aria-label="Search moves" className="min-h-[44px] w-full rounded-[10px] border border-stone bg-surface px-3 text-base" />
      <div className="flex gap-2 overflow-x-auto pb-1"><Chip on={style === 'all'} onClick={() => setStyle('all')}>All styles</Chip>{(Object.keys(STYLES) as Style[]).map((s) => <Chip key={s} on={style === s} onClick={() => setStyle(s)}>{STYLES[s].label}</Chip>)}</div>
      <div className="flex gap-2 overflow-x-auto pb-1"><Chip on={area === 'all'} onClick={() => setArea('all')}>All areas</Chip>{(Object.keys(AREA_LABELS) as Area[]).map((a) => <Chip key={a} on={area === a} onClick={() => setArea(a)}>{AREA_LABELS[a]}</Chip>)}</div>
      <div className="flex gap-2 overflow-x-auto pb-1"><Chip on={eq === 'all'} onClick={() => setEq('all')}>Any kit</Chip><Chip on={eq === 'none'} onClick={() => setEq('none')}>Mat only</Chip>{(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((k) => <Chip key={k} on={eq === k} onClick={() => setEq(k)}>{EQUIPMENT_LABELS[k]}</Chip>)}</div>
      <p className="text-sm text-muted">{shown.length} moves</p>

      {sel && (
        <div className="rounded-3xl border border-ink bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-display text-xl font-extrabold uppercase leading-tight">{sel.name}</p><p className="text-sm text-muted">{LEVEL[sel.level]} · {sel.areas.map((a) => AREA_LABELS[a]).join(', ')}</p></div>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-stone">✕</button>
          </div>
          <div className="mt-3 rounded-2xl bg-bg"><Figure move={sel.move} className="block w-full" /></div>
          <p className="mt-3 text-sm">{sel.cue}</p>
          <p className="mt-1 text-xs text-muted">Easier: {sel.easier}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {shown.map((e) => (
          <button key={e.key} type="button" onClick={() => { setOpen(e.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-2xl border border-stone bg-surface p-2 text-left hover:border-ink">
            <div className="rounded-xl bg-bg"><FigureStill move={e.move} t={0.75} className="block w-full" /></div>
            <p className="mt-1.5 text-sm font-semibold leading-tight">{e.name}</p>
            <p className="text-xs text-muted">{LEVEL[e.level]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
