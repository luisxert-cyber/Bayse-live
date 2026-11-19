// BAYSE daily scores without a wearable. The member answers a 20-second check-in each morning
// (sleep, energy, soreness, stress, mood) and BAYSE turns it, with what they have done in the app,
// into three scores out of 100: Recovery, Sleep and Effort. Pure functions, so the app and tests agree.
// Built so real data from a watch or phone could replace the check-in answers later without changing the screens.

export type Checkin = { day: string; sleep_hours: number; sleep_quality: number; energy: number; soreness: number; stress: number; mood: number };

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
/** A 1 to 5 answer as 0 to 100. */
const five = (n: number) => clamp(((n - 1) / 4) * 100);

/** Sleep score: mostly how long (8 hours is full marks, and a long lie-in does not score extra), partly how good it felt. */
export function sleepScore(c: Pick<Checkin, 'sleep_hours' | 'sleep_quality'>) {
  const hours = clamp((Math.min(c.sleep_hours, 8) / 8) * 100);
  return Math.round(hours * 0.6 + five(c.sleep_quality) * 0.4);
}

/** Recovery score: sleep, energy and mood lift it; soreness and stress pull it down. */
export function recoveryScore(c: Checkin) {
  return Math.round(sleepScore(c) * 0.35 + five(c.energy) * 0.25 + (100 - five(c.soreness)) * 0.2 + (100 - five(c.stress)) * 0.15 + five(c.mood) * 0.05);
}

/** Effort score: minutes moved in the last 7 days against the member's own weekly goal. 100 means the goal is met. */
export function effortScore(minutesLast7Days: number, weeklyGoalSessions: number) {
  const goalMinutes = Math.max(1, weeklyGoalSessions) * 20;
  return Math.round(clamp((minutesLast7Days / goalMinutes) * 100));
}

export type Zone = 'ready' | 'steady' | 'restore';
export const ZONES: Record<Zone, { label: string; advice: string; href: string; cta: string }> = {
  ready: { label: 'Ready', advice: 'You are well recovered. A good day for a stronger session or a live class.', href: '/train', cta: 'Pick a session' },
  steady: { label: 'Steady', advice: 'A normal day. Train as planned and listen to your body.', href: '/today', cta: 'See today’s session' },
  restore: { label: 'Restore', advice: 'Your body is asking for an easier day. Try mobility or a gentle stretch, and an early night.', href: '/train', cta: 'Find something gentle' },
};
export const zoneFor = (recovery: number): Zone => (recovery >= 67 ? 'ready' : recovery >= 34 ? 'steady' : 'restore');

/** Average of the scores that exist, or null when there are none. */
export function average(values: number[]) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** Days in a row with a check-in, ending today (or yesterday, so the streak is not lost before this morning's check-in). */
export function checkinStreak(days: string[], today: string) {
  const set = new Set(days);
  const prev = (d: string) => new Date(new Date(`${d}T00:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10);
  let n = 0;
  for (let d = set.has(today) ? today : prev(today); set.has(d); d = prev(d)) n++;
  return n;
}
