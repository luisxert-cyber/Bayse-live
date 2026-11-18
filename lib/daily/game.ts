// BAYSE points, stars and rings: a lighter way to see progress for members who do not want to track numbers.
// Pure functions worked out from finished workouts and joined live classes. Nothing about weight or food.
import { weekIndex, type Completion } from './progress';

export type LiveJoin = { minutes: number; at: string };

export const POINTS = { session: 10, live: 15, goalWeek: 25 } as const;
export const LEVELS = [
  { name: 'Starter', at: 0 }, { name: 'Mover', at: 50 }, { name: 'Regular', at: 150 }, { name: 'Committed', at: 300 },
  { name: 'Strong', at: 500 }, { name: 'Dedicated', at: 800 }, { name: 'Elite', at: 1200 }, { name: 'Icon', at: 1800 }, { name: 'Legend', at: 2500 },
] as const;

export function computeGame(sessions: Completion[], live: LiveJoin[], weeklyGoal: number, now = new Date()) {
  const goal = Math.max(1, weeklyGoal);
  const thisWeek = weekIndex(now);
  const all = [...sessions.map((s) => ({ minutes: s.minutes, at: s.at, live: false })), ...live.map((l) => ({ minutes: l.minutes, at: l.at, live: true }))];
  const byWeek = new Map<number, number>();
  for (const a of all) { const w = weekIndex(new Date(a.at)); byWeek.set(w, (byWeek.get(w) ?? 0) + 1); }
  // A star for every week the weekly goal was met.
  const stars = [...byWeek.values()].filter((n) => n >= goal).length;
  const points = sessions.length * POINTS.session + live.length * POINTS.live + stars * POINTS.goalWeek;
  const levelIndex = LEVELS.reduce((best, l, i) => (points >= l.at ? i : best), 0);
  const nextLevel = LEVELS[levelIndex + 1] ?? null;
  const week = all.filter((a) => weekIndex(new Date(a.at)) === thisWeek);
  const weekMinutes = week.reduce((n, a) => n + a.minutes, 0);
  const weekLive = week.filter((a) => a.live).length;
  const minutesGoal = goal * 20;
  const weekPoints = week.reduce((n, a) => n + (a.live ? POINTS.live : POINTS.session), 0) + (week.length >= goal ? POINTS.goalWeek : 0);
  return {
    points, stars, weekPoints,
    level: LEVELS[levelIndex].name, levelNumber: levelIndex + 1,
    nextLevel: nextLevel ? { name: nextLevel.name, pointsToGo: nextLevel.at - points, progress: (points - LEVELS[levelIndex].at) / (nextLevel.at - LEVELS[levelIndex].at) } : null,
    rings: [
      { key: 'move', label: 'Move', value: week.length, goal, unit: week.length === 1 ? 'session' : 'sessions' },
      { key: 'minutes', label: 'Minutes', value: weekMinutes, goal: minutesGoal, unit: 'min' },
      { key: 'live', label: 'Live', value: weekLive, goal: 1, unit: weekLive === 1 ? 'live class' : 'live classes' },
    ],
    closed: [week.length >= goal, weekMinutes >= minutesGoal, weekLive >= 1].filter(Boolean).length,
  };
}
export type Game = ReturnType<typeof computeGame>;
