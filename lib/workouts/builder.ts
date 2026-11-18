// Build a guided timer workout from a member's choices: areas, time, level and joints to protect.
// Shape: warm-up → main moves that match the chosen areas → cool-down. Deterministic for a given seed,
// so "Shuffle" gives a fresh order and the same choices + seed always give the same workout.
import { AVAILABLE, EXERCISES, WORKOUTS, type Area, type Exercise, type Style, type Workout } from './catalog';
import { SET_WORKOUTS } from './sets';

export type Level = 1 | 2 | 3;
export type Equipment = 'weights' | 'band' | 'ball';
export type BuildChoices = { areas: Area[]; minutes: number; level: Level; avoid: ('knees' | 'wrists')[]; seed?: number; style?: Style; equipment?: Equipment[] };

export const STYLES: Record<Style, { label: string; blurb: string; work: Record<Level, number>; rest: Record<Level, number>; maxLevel?: Level }> = {
  mat: { label: 'Mat Pilates', blurb: 'Classic BAYSE mat work: control, breath and core.', work: { 1: 30, 2: 40, 3: 45 }, rest: { 1: 20, 2: 15, 3: 10 } },
  sculpt: { label: 'Sculpt', blurb: 'Pilates with strength work, weights if you have them.', work: { 1: 40, 2: 45, 3: 50 }, rest: { 1: 20, 2: 15, 3: 10 } },
  standing: { label: 'Standing Pilates', blurb: 'Barre-inspired standing work for legs, glutes and posture.', work: { 1: 35, 2: 40, 3: 45 }, rest: { 1: 20, 2: 15, 3: 10 } },
  cardio: { label: 'Cardio Sculpt', blurb: 'Low-impact, heart-rate-raising intervals. No jumping.', work: { 1: 30, 2: 40, 3: 45 }, rest: { 1: 25, 2: 20, 3: 15 } },
  flow: { label: 'Slow Flow & Stretch', blurb: 'Long, slow holds to release and restore.', work: { 1: 50, 2: 60, 3: 60 }, rest: { 1: 8, 2: 5, 3: 5 } },
  gentle: { label: 'Gentle', blurb: 'Kind, simple moves. Good for returning to exercise.', work: { 1: 30, 2: 30, 3: 35 }, rest: { 1: 20, 2: 20, 3: 15 }, maxLevel: 1 },
};
export const EQUIPMENT_LABELS: Record<Equipment, string> = { weights: 'Light weights', band: 'Resistance band', ball: 'Pilates ball' };

export const AREA_LABELS: Record<Area, string> = {
  core: 'Core', glutes: 'Glutes & legs', back: 'Back & posture', upper: 'Arms & upper body', mobility: 'Mobility', full: 'Full body',
};
export const LEVEL_LABELS: Record<Level, string> = { 1: 'Gentle', 2: 'Steady', 3: 'Strong' };
export const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;


/** Small seeded random, so results are repeatable. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function buildWorkout(c: BuildChoices): Workout {
  const style: Style = c.style ?? 'mat';
  const S = STYLES[style];
  const level = (S.maxLevel ? Math.min(c.level, S.maxLevel) : c.level) as Level;
  const areas: Area[] = c.areas.length ? c.areas : ['full'];
  const equipment = c.equipment ?? [];
  const rand = rng(c.seed ?? 1);
  const ok = (e: Exercise) => !(e.loads ?? []).some((l) => c.avoid.includes(l)) && (!e.prop || equipment.includes(e.prop));
  const all = Object.values(AVAILABLE).filter(ok);
  const inStyle = (e: Exercise) => (e.styles ?? []).includes(style);
  const lvlOk = (e: Exercise) => e.level <= level + (level === 3 ? 1 : 0);

  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const warmPool = all.filter((e) => e.role === 'warmup' && lvlOk(e));
  const coolPool = all.filter((e) => e.role === 'cooldown');
  const warm = pick(warmPool.filter(inStyle).length ? warmPool.filter(inStyle) : warmPool) ?? null;
  const cool = pick(coolPool.filter(inStyle).length ? coolPool.filter(inStyle) : coolPool) ?? null;

  // Main pool: in the class style, at the right level, matching the chosen areas. Relax if too small.
  const main = (e: Exercise) => e.role !== 'cooldown' && e.key !== warm?.key;
  let pool = all.filter((e) => main(e) && inStyle(e) && lvlOk(e) && e.areas.some((a) => areas.includes(a)));
  if (pool.length < 4) pool = all.filter((e) => main(e) && inStyle(e) && lvlOk(e));
  if (pool.length < 4) pool = all.filter((e) => main(e) && lvlOk(e) && e.areas.some((a) => areas.includes(a)));
  if (!pool.length) pool = all.filter(main);
  const score = (e: Exercise) => e.areas.filter((a) => areas.includes(a)).length + (e.prop && equipment.includes(e.prop) ? 1.2 : 0) + rand() * 1.5;
  pool = pool.map((e) => ({ e, s: score(e) })).sort((a, b) => b.s - a.s).map((x) => x.e);
  // Keep variety: at most one version of each base move in the first pass.
  const seen = new Set<string>();
  const first = pool.filter((e) => { const k = e.variantOf ?? e.key; if (seen.has(k)) return false; seen.add(k); return true; });
  const order = [...first, ...pool.filter((e) => !first.includes(e))];

  const work = S.work[level], rest = S.rest[level];
  const budget = Math.max(4, c.minutes) * 60;
  const blocks: Workout['blocks'] = [];
  let used = 0;
  const add = (ex: string, seconds: number) => { if (blocks.length) used += rest; blocks.push({ ex, seconds }); used += seconds; };
  if (warm) add(warm.key, style === 'flow' ? 60 : 40);
  const reserve = cool ? 50 + rest : 0;
  const base = (k: string) => EXERCISES[k].variantOf ?? k;
  // Cardio repeats a short circuit; other styles work through the ordered pool.
  const circuit = style === 'cardio' ? order.slice(0, 5) : order;
  let k = 0, guard = 0;
  while (used + rest + work + reserve <= budget && guard++ < 120) {
    const e = circuit[k % circuit.length];
    k++;
    if (blocks.length && base(blocks[blocks.length - 1].ex) === base(e.key) && circuit.length > 1) continue;
    add(e.key, work);
  }
  if (cool) add(cool.key, style === 'flow' ? 60 : 50);

  const names = areas.map((a) => AREA_LABELS[a]);
  return {
    key: 'custom',
    name: `${S.label}: ${names.length > 2 ? 'your mix' : names.join(' + ')}`,
    summary: `${S.blurb} Built for ${names.join(', ').toLowerCase()}.`,
    level: level === 1 ? 'Beginner' : level === 2 ? 'All levels' : 'Intermediate',
    focus: names.join(', '),
    rest,
    blocks,
  };
}

// Ready-made classes for every style, generated from the library so they are always consistent.
const READY_SPECS: { style: Style; minutes: number; areas: Area[]; level: Level; equipment?: Equipment[]; title: string }[] = [
  { style: 'mat', minutes: 15, areas: ['core'], level: 2, title: 'Core Control' },
  { style: 'mat', minutes: 30, areas: ['core', 'glutes', 'back'], level: 2, title: 'Signature Mat' },
  { style: 'mat', minutes: 20, areas: ['core', 'full'], level: 3, title: 'Advanced Mat' },
  { style: 'sculpt', minutes: 20, areas: ['upper', 'core'], level: 2, equipment: ['weights'], title: 'Arms & Core Sculpt' },
  { style: 'sculpt', minutes: 30, areas: ['glutes', 'full'], level: 2, equipment: ['weights', 'band'], title: 'Full Body Sculpt' },
  { style: 'standing', minutes: 15, areas: ['glutes'], level: 1, title: 'Standing Glutes' },
  { style: 'standing', minutes: 25, areas: ['glutes', 'back', 'full'], level: 2, equipment: ['ball'], title: 'Standing Pilates' },
  { style: 'cardio', minutes: 15, areas: ['full'], level: 2, title: 'Cardio Sculpt Express' },
  { style: 'cardio', minutes: 25, areas: ['full', 'core'], level: 2, equipment: ['weights'], title: 'Cardio Sculpt' },
  { style: 'flow', minutes: 15, areas: ['mobility'], level: 1, title: 'Slow Flow' },
  { style: 'flow', minutes: 30, areas: ['mobility', 'back'], level: 1, title: 'Deep Stretch' },
  { style: 'gentle', minutes: 15, areas: ['core', 'back'], level: 1, title: 'Gentle Core & Back' },
  { style: 'gentle', minutes: 20, areas: ['glutes', 'mobility'], level: 1, title: 'Gentle Full Body' },
];

export const READY: Workout[] = READY_SPECS.map((r, i) => {
  const w = buildWorkout({ areas: r.areas, minutes: r.minutes, level: r.level, avoid: [], seed: 11 + i * 7, style: r.style, equipment: r.equipment ?? [] });
  return { ...w, key: `${r.style}-${r.minutes}-${i}`, name: r.title, summary: `${STYLES[r.style].blurb}${r.equipment?.length ? ` Uses: ${r.equipment.map((e) => EQUIPMENT_LABELS[e].toLowerCase()).join(', ')}.` : ' No equipment.'}`, focus: STYLES[r.style].label };
});
export const READY_STYLE: Record<string, Style> = Object.fromEntries(READY_SPECS.map((r, i) => [READY[i].key, r.style]));

/** Any named workout: the original four, a ready-made class, or a hand-picked pathway or challenge class. */
export const findAnyWorkout = (key: string) => WORKOUTS.find((w) => w.key === key) ?? READY.find((w) => w.key === key) ?? SET_WORKOUTS.find((w) => w.key === key);

/** Sensible defaults from the member's onboarding answers. */
export function defaultsFromAnswers(goals: string[] | null | undefined, experience: string | null | undefined, sessionLength: string | null | undefined): BuildChoices {
  const map: Record<string, Area[]> = {
    core: ['core'], posture: ['back'], mobility: ['mobility'], strength_tone: ['glutes', 'full'], fitness: ['full'],
    healthy_weight: ['full'], feel_better: ['mobility'], confidence: ['core'],
  };
  const areas = Array.from(new Set((goals ?? []).flatMap((g) => map[g] ?? []))).slice(0, 3) as Area[];
  const level: Level = experience === 'advanced' ? 3 : experience === 'intermediate' ? 2 : 1;
  const minutes = sessionLength === '10-15' ? 10 : sessionLength === '20-30' ? 20 : sessionLength === '30-45' || sessionLength === '45-60' ? 30 : 15;
  return { areas: areas.length ? areas : ['core', 'glutes'], minutes, level, avoid: [], seed: 1, style: 'mat', equipment: [] };
}
