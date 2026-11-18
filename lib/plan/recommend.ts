// BAYSE programme recommendation engine (spec sections 6.15 and 10).
// Simple, explainable rules: it scores each published programme against the member's
// answers and explains why it picked one. It is a sensible training suggestion,
// not a medical or "AI-validated" prescription, and the UI must say so.

export const ENGINE_VERSION = 'rules-1';

export type Experience = 'new' | 'beginner' | 'intermediate' | 'advanced';

export type Answers = {
  goals: string[];
  experience: Experience | null;
  preferred_training: string[];
  equipment: string[];
  sessions_per_week: number | null;
  session_length?: string | null;
};

export type Programme = {
  key: string;
  name: string;
  level: Experience | 'all';
  focus: string[];
  needs_equipment: string[];
  weeks_options: number[];
};

export type Recommendation = {
  programmeKey: string;
  programmeName: string;
  weeks: number;
  sessionsPerWeek: number;
  reasons: string[];
  alternatives: string[];
  engineVersion: string;
};

const GOAL_TO_FOCUS: Record<string, string[]> = {
  strength_tone: ['strength', 'tone'],
  fitness: ['fitness'],
  core: ['core'],
  posture: ['posture'],
  mobility: ['mobility', 'recovery'],
  confidence: ['confidence'],
  healthy_eating: ['healthy_eating'],
  healthy_weight: ['healthy_weight'],
  consistency: ['consistency'],
  feel_better: ['feel_better'],
};

const GOAL_LABEL: Record<string, string> = {
  strength_tone: 'build strength and tone',
  fitness: 'improve your fitness',
  core: 'strengthen your core',
  posture: 'improve your posture',
  mobility: 'move more freely',
  confidence: 'build confidence',
  healthy_eating: 'eat well',
  healthy_weight: 'support a healthy weight',
  consistency: 'be more consistent',
  feel_better: 'feel better day to day',
};

const TRAINING_TO_PROGRAMME: Record<string, string> = {
  reformer: 'reformer_progression',
  walking: 'move_more',
  strength: 'strong_sculpt',
  sculpt: 'strong_sculpt',
  mobility: 'mobility_restore',
};

const LEVEL_RANK: Record<Experience, number> = { new: 0, beginner: 1, intermediate: 2, advanced: 3 };

// Equipment we treat as easy to improvise at home (a towel works for a mat).
const SOFT_EQUIPMENT = new Set(['mat']);

export function hasEquipmentFor(p: Programme, equipment: string[]): boolean {
  const have = new Set(equipment);
  return p.needs_equipment.every((e) => SOFT_EQUIPMENT.has(e) || have.has(e));
}

function scoreProgramme(p: Programme, a: Answers): { score: number; matchedGoals: string[] } {
  if (!hasEquipmentFor(p, a.equipment)) return { score: -Infinity, matchedGoals: [] };
  let score = 0;
  const matchedGoals: string[] = [];
  for (const g of a.goals) {
    const tags = GOAL_TO_FOCUS[g] ?? [];
    if (tags.some((t) => p.focus.includes(t))) {
      score += 3;
      matchedGoals.push(g);
    }
  }
  for (const t of a.preferred_training) {
    if (TRAINING_TO_PROGRAMME[t] === p.key) score += 3;
  }
  const exp = a.experience ?? 'beginner';
  if (p.level !== 'all') {
    const gap = LEVEL_RANK[p.level as Experience] - LEVEL_RANK[exp];
    if (gap === 0) score += 2;
    else if (gap > 0) score -= 4 * gap; // too hard: strongly avoid
    else score -= 1 * -gap;            // a bit easy: mild penalty
  } else {
    score += 1;
  }
  return { score, matchedGoals };
}

export function pickWeeks(p: Programme, exp: Experience): number {
  const target = exp === 'new' || exp === 'beginner' ? 6 : 8;
  const opts = [...p.weeks_options].sort((x, y) => x - y);
  if (opts.length === 0) return target;
  return opts.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best), opts[0]);
}

export function pickSessions(a: Answers): number {
  const asked = a.sessions_per_week ?? 3;
  const exp = a.experience ?? 'beginner';
  const cap = exp === 'new' ? 3 : exp === 'beginner' ? 4 : 5;
  return Math.max(1, Math.min(asked, cap));
}

export function recommend(a: Answers, programmes: Programme[]): Recommendation {
  if (programmes.length === 0) throw new Error('No programmes to recommend from');
  const exp = a.experience ?? 'beginner';
  const scored = programmes
    .map((p, i) => ({ p, i, ...scoreProgramme(p, a) }))
    .filter((s) => s.score > -Infinity)
    .sort((x, y) => y.score - x.score || x.i - y.i);

  // Nothing fits the equipment (should not happen: Move More needs nothing). Fall back to the first no-equipment programme.
  const best = scored[0] ?? { p: programmes.find((p) => p.needs_equipment.length === 0) ?? programmes[0], matchedGoals: [] as string[] };
  const p = best.p;
  const weeks = pickWeeks(p, exp);
  const sessionsPerWeek = pickSessions(a);

  const reasons: string[] = [];
  const goals = best.matchedGoals.slice(0, 2).map((g) => GOAL_LABEL[g]).filter(Boolean);
  if (goals.length) reasons.push(`It is designed to help you ${goals.join(' and ')}.`);
  if (p.level !== 'all') {
    const fit = LEVEL_RANK[p.level as Experience] === LEVEL_RANK[exp];
    reasons.push(fit ? 'It matches your experience level.' : 'It starts gently and builds week by week.');
  } else {
    reasons.push('It suits every level and adapts as you go.');
  }
  if (sessionsPerWeek < (a.sessions_per_week ?? sessionsPerWeek)) {
    reasons.push(`We have started you on ${sessionsPerWeek} sessions a week so you can build the habit, and you can add more any time.`);
  } else {
    reasons.push(`${sessionsPerWeek} session${sessionsPerWeek === 1 ? '' : 's'} a week fits what you told us.`);
  }
  if (p.needs_equipment.filter((e) => !SOFT_EQUIPMENT.has(e)).length === 0) reasons.push('You will not need any special equipment.');

  return {
    programmeKey: p.key,
    programmeName: p.name,
    weeks,
    sessionsPerWeek,
    reasons,
    alternatives: scored.slice(1, 3).map((s) => s.p.key),
    engineVersion: ENGINE_VERSION,
  };
}
