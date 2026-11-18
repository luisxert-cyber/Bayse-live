// Build a guided timer workout from a member's choices: areas, time, level and joints to protect.
// Shape: warm-up → main moves that match the chosen areas → cool-down. Deterministic for a given seed,
// so "Shuffle" gives a fresh order and the same choices + seed always give the same workout.
import { EXERCISES, type Area, type Exercise, type Workout } from './catalog';

export type Level = 1 | 2 | 3;
export type BuildChoices = { areas: Area[]; minutes: number; level: Level; avoid: ('knees' | 'wrists')[]; seed?: number };

export const AREA_LABELS: Record<Area, string> = {
  core: 'Core', glutes: 'Glutes & legs', back: 'Back & posture', mobility: 'Mobility', full: 'Full body',
};
export const LEVEL_LABELS: Record<Level, string> = { 1: 'Gentle', 2: 'Steady', 3: 'Strong' };
export const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;

const WORK: Record<Level, number> = { 1: 30, 2: 40, 3: 45 };
const REST: Record<Level, number> = { 1: 20, 2: 15, 3: 10 };

/** Small seeded random, so results are repeatable. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function buildWorkout(c: BuildChoices): Workout {
  const level = c.level;
  const areas: Area[] = c.areas.length ? c.areas : ['full'];
  const ok = (e: Exercise) => !(e.loads ?? []).some((l) => c.avoid.includes(l));
  const all = Object.values(EXERCISES).filter(ok);
  const rand = rng(c.seed ?? 1);

  const warmups = all.filter((e) => e.role === 'warmup');
  const cooldowns = all.filter((e) => e.role === 'cooldown');
  // Main pool: moves for the chosen areas at or below the level (strong also gets every move).
  let pool = all.filter((e) => e.role !== 'cooldown' && e.level <= Math.max(level, 1) + (level === 3 ? 1 : 0) && e.areas.some((a) => areas.includes(a)));
  if (!pool.length) pool = all.filter((e) => e.role !== 'cooldown');
  // Prefer moves that hit more of the chosen areas, then shuffle within that.
  pool = pool
    .map((e) => ({ e, score: e.areas.filter((a) => areas.includes(a)).length + rand() * 0.9 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e);

  const work = WORK[level], rest = REST[level];
  const budget = Math.max(4, c.minutes) * 60;
  const blocks: Workout['blocks'] = [];
  let used = 0;
  const add = (ex: string, seconds: number) => { if (blocks.length) used += rest; blocks.push({ ex, seconds }); used += seconds; };

  const warm = warmups.length ? warmups[Math.floor(rand() * warmups.length)] : null;
  if (warm) add(warm.key, 40);
  const cool = cooldowns[0] ?? warmups.find((w) => w.key !== warm?.key) ?? null;
  const reserve = cool ? 45 + rest : 0;

  // Fill the middle with rounds through the pool, never the same move twice in a row.
  let k = 0, guard = 0;
  while (used + rest + work + reserve <= budget && guard++ < 60) {
    const e = pool[k % pool.length];
    k++;
    if (blocks.length && blocks[blocks.length - 1].ex === e.key && pool.length > 1) continue;
    add(e.key, work);
  }
  if (cool) add(cool.key, 45);

  const names = areas.map((a) => AREA_LABELS[a]);
  return {
    key: 'custom',
    name: names.length > 2 ? 'Your mix' : names.join(' + '),
    summary: `Built for you: ${names.join(', ').toLowerCase()}, ${LEVEL_LABELS[level].toLowerCase()} pace.`,
    level: level === 1 ? 'Beginner' : level === 2 ? 'All levels' : 'Intermediate',
    focus: names.join(', '),
    rest,
    blocks,
  };
}

/** Sensible defaults from the member's onboarding answers. */
export function defaultsFromAnswers(goals: string[] | null | undefined, experience: string | null | undefined, sessionLength: string | null | undefined): BuildChoices {
  const map: Record<string, Area[]> = {
    core: ['core'], posture: ['back'], mobility: ['mobility'], strength_tone: ['glutes', 'full'], fitness: ['full'],
    healthy_weight: ['full'], feel_better: ['mobility'], confidence: ['core'],
  };
  const areas = Array.from(new Set((goals ?? []).flatMap((g) => map[g] ?? []))).slice(0, 3) as Area[];
  const level: Level = experience === 'advanced' ? 3 : experience === 'intermediate' ? 2 : 1;
  const minutes = sessionLength === '10-15' ? 10 : sessionLength === '20-30' ? 20 : sessionLength === '30-45' || sessionLength === '45-60' ? 30 : 15;
  return { areas: areas.length ? areas : ['core', 'glutes'], minutes, level, avoid: [], seed: 1 };
}
