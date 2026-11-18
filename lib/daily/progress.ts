// BAYSE Progress: totals, weekly streaks, sessions per week and milestones, worked out from
// finished workouts. Pure functions, so the app, the website preview and tests all agree.
// Deliberately nothing about weight: consistency and milestones are the measure of success.

export type Completion = { key: string; minutes: number; at: string };

const DAY = 86_400_000;
/** Monday-based week number in UK time (close enough for streaks: BST shifts by an hour at most). */
export function weekIndex(d: Date) {
  const uk = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const days = Math.floor(Date.UTC(uk.getFullYear(), uk.getMonth(), uk.getDate()) / DAY);
  return Math.floor((days + 3) / 7); // 1 Jan 1970 was a Thursday; +3 makes weeks start on Monday
}

export type Milestone = { key: string; label: string; detail: string; earned: boolean };

export const CLASS_MILESTONES = [1, 5, 10, 25, 50, 100, 200] as const;
export const STREAK_MILESTONES = [3, 6, 12] as const;

export function computeProgress(rows: Completion[], now = new Date()) {
  const sorted = [...rows].sort((a, b) => a.at.localeCompare(b.at));
  const classes = sorted.length;
  const minutes = sorted.reduce((n, r) => n + r.minutes, 0);
  const thisWeek = weekIndex(now);
  const weeks = new Set(sorted.map((r) => weekIndex(new Date(r.at))));

  // Current streak: consecutive weeks with at least one session, ending this week (or last week, so a
  // streak is not "lost" on Monday morning before you have had the chance to train).
  let streak = 0;
  for (let w = weeks.has(thisWeek) ? thisWeek : thisWeek - 1; weeks.has(w); w--) streak++;
  let best = 0, run = 0, prev = -99;
  for (const w of [...weeks].sort((a, b) => a - b)) { run = w === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = w; }

  const perWeek = Array.from({ length: 8 }, (_, i) => sorted.filter((r) => weekIndex(new Date(r.at)) === thisWeek - 7 + i).length);
  const last = sorted[sorted.length - 1];
  const daysSince = last ? Math.floor((now.getTime() - new Date(last.at).getTime()) / DAY) : null;

  // Coming back after a break of two weeks or more counts as a milestone of its own.
  let comeback = false;
  for (let i = 1; i < sorted.length; i++) if (new Date(sorted[i].at).getTime() - new Date(sorted[i - 1].at).getTime() >= 14 * DAY) comeback = true;

  const milestones: Milestone[] = [
    ...CLASS_MILESTONES.map((n) => ({ key: `classes-${n}`, label: n === 1 ? 'First class' : `${n} classes`, detail: n === 1 ? 'You showed up. The hardest part.' : `${n} BAYSE sessions finished.`, earned: classes >= n })),
    ...STREAK_MILESTONES.map((n) => ({ key: `streak-${n}`, label: `${n}-week streak`, detail: `Moved at least once a week for ${n} weeks in a row.`, earned: best >= n })),
    { key: 'hours-10', label: '10 hours', detail: 'Ten hours of Pilates and counting.', earned: minutes >= 600 },
    { key: 'comeback', label: 'Welcome back', detail: 'Came back after a break. That takes more than starting.', earned: comeback },
  ];
  return { classes, minutes, hours: Math.round((minutes / 60) * 10) / 10, streak, best, perWeek, daysSince, milestones };
}

export type Progress = ReturnType<typeof computeProgress>;
