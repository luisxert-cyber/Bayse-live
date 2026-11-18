'use client';
// "Find your class" (BAYSE On Demand layout) with the real BAYSE classes behind it.
// Every card opens the class player on the page. The free class plays for anyone;
// the rest play for signed-in members, and visitors are offered the free trial instead.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MoveThumb } from '@/components/workout/MoveThumb';
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

type Kit = 'Mat' | 'Weights' | 'Band' | 'Ball';
const KIT_OF: Record<string, Kit> = { weights: 'Weights', band: 'Band', ball: 'Ball' };
const kitsOf = (w: Workout): Kit[] => {
  const k = new Set<Kit>();
  for (const b of w.blocks) { const p = EXERCISES[b.ex]?.prop; if (p) k.add(KIT_OF[p]); }
  return k.size ? [...k] : ['Mat'];
};
const KITS = new Map(CLASSES.map((c) => [c.w.key, kitsOf(c.w)]));

const STYLE_OPTS = ['All', ...(Object.keys(STYLES) as Style[])] as const;
const KIT_OPTS = ['All', 'Mat', 'Weights', 'Band', 'Ball'] as const;
const LENGTH = ['Any', 'Up to 15 min', '16 to 25 min', 'Over 25 min'] as const;
const LEVELS = ['All', 'Beginner', 'All levels', 'Intermediate'] as const;
const thumbMove = (w: Workout) => EXERCISES[(w.blocks[1] ?? w.blocks[0]).ex]?.move ?? 'childs';
const SORTS = { newest: 'Newest', short: 'Shortest first', long: 'Longest first' } as const;

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

// Per-browser conveniences: favourites and a simple practice tally. Members' progress is saved to their account too.
const LS = { saved: 'bayse_saved', done: 'bayse_done' };
const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* optional */ } };

export function ClassLibrary({ signedIn, onRecord }: { signedIn: boolean; onRecord?: (key: string) => Promise<void> }) {
  const [style, setStyle] = useState<(typeof STYLE_OPTS)[number]>('All');
  const [kit, setKit] = useState<(typeof KIT_OPTS)[number]>('All');
  const [len, setLen] = useState<(typeof LENGTH)[number]>('Any');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<keyof typeof SORTS>('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [done, setDone] = useState<{ n: number; minutes: number }>({ n: 0, minutes: 0 });
  const [open, setOpen] = useState<Card | null>(null);

  useEffect(() => { setSaved(read<string[]>(LS.saved, [])); setDone(read(LS.done, { n: 0, minutes: 0 })); }, []);
  const toggleSave = (key: string) => setSaved((s) => { const n = s.includes(key) ? s.filter((x) => x !== key) : [...s, key]; write(LS.saved, n); return n; });

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = CLASSES.filter((c) =>
      (style === 'All' || c.style === style) &&
      (kit === 'All' || (KITS.get(c.w.key) ?? []).includes(kit)) &&
      (level === 'All' || LEVEL_NAME[c.level] === level) &&
      (len === 'Any' || (len === 'Up to 15 min' ? c.minutes <= 15 : len === '16 to 25 min' ? c.minutes > 15 && c.minutes <= 25 : c.minutes > 25)) &&
      (!savedOnly || saved.includes(c.w.key)) &&
      (!t || `${c.w.name} ${STYLES[c.style].label} ${c.w.focus}`.toLowerCase().includes(t)));
    if (sort === 'short') list.sort((a, b) => a.minutes - b.minutes);
    else if (sort === 'long') list.sort((a, b) => b.minutes - a.minutes);
    else list.sort((a, b) => Number(b.free) - Number(a.free));
    return list;
  }, [style, kit, len, level, q, sort, savedOnly, saved]);

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
  const finished = async (c: Card) => {
    setDone((d) => { const n = { n: d.n + 1, minutes: d.minutes + c.minutes }; write(LS.done, n); return n; });
    if (signedIn && onRecord) await onRecord(c.w.key);
  };
  const clear = () => { setStyle('All'); setKit('All'); setLevel('All'); setLen('Any'); setQ(''); setSavedOnly(false); };

  return (
    <div>
      <dl className="mb-5 grid grid-cols-3 gap-3 rounded-card border border-stone bg-surface p-4" data-stats>
        {[[done.n, 'classes done'], [done.minutes, 'minutes practised'], [saved.length, 'saved']].map(([n, l]) => (
          <div key={l}><dt className="sr-only">{l}</dt><dd><span className="block font-display text-2xl font-extrabold leading-none">{n}</span><span className="text-xs text-muted">{l}</span></dd></div>
        ))}
      </dl>
      <div className="mb-4 flex flex-wrap gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, style or focus" aria-label="Search classes"
          className="min-h-[44px] min-w-0 flex-1 rounded-[10px] border border-stone bg-surface px-3 text-base sm:min-w-[260px]" />
        <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} aria-label="Sort classes"
          className="min-h-[44px] rounded-[10px] border border-stone bg-surface px-3 text-sm">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)}
          className="min-h-[44px] rounded-full border border-stone bg-surface px-4 text-sm hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-bg">Saved only</button>
      </div>
      <div className="grid gap-3">
        <Chips label="Kit" options={KIT_OPTS} value={kit} onChange={setKit} />
        <Chips label="Style" options={STYLE_OPTS} value={style} onChange={setStyle} name={(o) => (o === 'All' ? 'All' : STYLES[o as Style].label)} />
        <Chips label="Level" options={LEVELS} value={level} onChange={setLevel} />
        <Chips label="Length" options={LENGTH} value={len} onChange={setLen} />
      </div>
      <p className="mb-3 mt-5 text-sm text-muted">{shown.length} {shown.length === 1 ? 'class' : 'classes'}{signedIn ? '' : ' · the free class plays now, the rest come with your free trial'}</p>
      {shown.length ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {shown.map((c) => {
            const i = CLASSES.indexOf(c);
            const isSaved = saved.includes(c.w.key);
            return (
              <article key={c.w.key} className="relative flex min-w-0 flex-col overflow-hidden rounded-card border border-stone bg-surface">
                <button type="button" data-class-card onClick={() => setOpen(c)} aria-label={`${c.w.name}, ${c.minutes} minutes${c.free ? ', free class' : ''}`}
                  className="group flex flex-1 flex-col text-left">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface text-white">
                    <MoveThumb move={thumbMove(c.w)} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
                    <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-white/70 bg-white/15 transition-transform group-hover:scale-110">▶</span></span>
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold">{c.minutes} min</span>
                    {c.free && <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">Free class</span>}
                    {!c.free && !signedIn && <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold">Members</span>}
                  </div>
                  <div className="grid gap-1.5 px-4 pb-4 pt-3.5">
                    <h3 className="text-base uppercase">{c.w.name}</h3>
                    <p className="text-sm text-muted">{STYLES[c.style].label} · {(KITS.get(c.w.key) ?? ['Mat']).join(', ')}</p>
                    <p className="flex items-center gap-1.5 text-[13px] text-muted">
                      {[1, 2, 3].map((n) => <i key={n} className={`h-2 w-2 rounded-full border-[1.5px] border-ink ${n <= c.level ? 'bg-ink' : ''}`} />)}
                      <span className="ml-1">{LEVEL_NAME[c.level]}</span>
                    </p>
                  </div>
                </button>
                <button type="button" onClick={() => toggleSave(c.w.key)} aria-pressed={isSaved} aria-label={isSaved ? `Remove ${c.w.name} from saved` : `Save ${c.w.name}`}
                  className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white text-black">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-stone px-4 py-10 text-center text-muted">
          No classes match. <button type="button" className="underline" onClick={clear}>Clear filters</button>
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
                onComplete={() => finished(open)} />
            ) : (
              <div className="rounded-3xl border border-stone bg-surface p-4 sm:p-5">
                <div className="overflow-hidden rounded-2xl bg-bg"><MoveThumb move={thumbMove(open.w)} t={0.7} className="block w-full" /></div>
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
