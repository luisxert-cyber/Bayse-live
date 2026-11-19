// BAYSE Daily: the one next best thing for a member to do today, and why.
// Uses their goals, usual session length, weekly goal, what they have already done and the live timetable.
import { WORKOUTS, workoutMinutes, type Style, type Workout } from '@/lib/workouts/catalog';
import { READY, READY_STYLE, READY_LEVEL } from '@/lib/workouts/builder';
import { weekIndex, type Completion } from './progress';

export type LiveSlot = { weekday: number; starts_at: string; name: string; minutes: number };
export type DailyInput = {
  goals: string[];
  sessionLength: string | null;   // '10-15' | '20-30' | '30-45' | '45-60'
  experience?: string | null;     // 'new' | 'beginner' | 'intermediate' | 'advanced'
  weeklyGoal: number;
  completions: Completion[];
  live: LiveSlot[];
  canLive: boolean;
  /** False for Foundation: no class library, so the pick is the workout builder. Defaults to true. */
  canClasses?: boolean;
  now?: Date;
};
export type NextAction = { kind: 'live' | 'class' | 'recover' | 'welcome-back'; title: string; why: string; href: string; minutes: number; workout?: Workout };

const STYLE_FOR_GOAL: Record<string, Style[]> = {
  core: ['mat'], confidence: ['gentle', 'mat'], posture: ['mat', 'standing'], mobility: ['flow'], feel_better: ['flow', 'gentle'],
  strength_tone: ['sculpt', 'standing'], fitness: ['cardio', 'standing'], healthy_weight: ['cardio', 'sculpt'], consistency: ['mat', 'gentle'],
};
const QUICK_STYLE: Record<string, Style> = { 'wake-up-6': 'flow', 'core-10': 'mat', 'glutes-12': 'mat', 'wind-down-8': 'flow' };
const ALL = [...WORKOUTS, ...READY].map((w) => ({ w, style: READY_STYLE[w.key] ?? QUICK_STYLE[w.key] ?? 'mat', min: workoutMinutes(w), level: READY_LEVEL[w.key] ?? (w.level === 'Intermediate' ? 2 : 1) }));
// Never suggest a class above the member's level. No answer yet means we treat them as a beginner.
const maxLevel = (experience: string | null | undefined) => (experience === 'advanced' ? 3 : experience === 'intermediate' ? 2 : 1);
// A class that runs over the time they have is a worse fit than one that is a little short.
const timeCost = (min: number, t: number) => (min > t ? (min - t) * 2 : t - min);
const target = (len: string | null) => (len === '10-15' ? 12 : len === '20-30' ? 25 : len === '30-45' || len === '45-60' ? 30 : 15);

function ukNow(now: Date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.find((x) => x.type === 'weekday')!.value) + 1;
  return { wd, mins: Number(p.find((x) => x.type === 'hour')!.value) * 60 + Number(p.find((x) => x.type === 'minute')!.value) };
}
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const pretty = (t: string) => { const h = Number(t.slice(0, 2)); const m = t.slice(3, 5); return `${h % 12 || 12}${m === '00' ? '' : `:${m}`}${h < 12 ? 'am' : 'pm'}`; };

export function nextBestAction(i: DailyInput): NextAction {
  const now = i.now ?? new Date();
  const { wd, mins } = ukNow(now);
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' })).toDateString();
  const doneToday = i.completions.some((c) => new Date(new Date(c.at).toLocaleString('en-US', { timeZone: 'Europe/London' })).toDateString() === today);
  const thisWeek = i.completions.filter((c) => weekIndex(new Date(c.at)) === weekIndex(now)).length;
  const last = [...i.completions].sort((a, b) => b.at.localeCompare(a.at))[0];
  const daysSince = last ? (now.getTime() - new Date(last.at).getTime()) / 86_400_000 : null;
  const pick = (w: Workout) => ({ href: `/train/${w.key}`, minutes: workoutMinutes(w), workout: w });

  // 1. A live class starting in the next three hours (or on now), if their plan includes live classes.
  if (i.canLive && !doneToday) {
    const slot = i.live.filter((l) => l.weekday === wd && toMin(l.starts_at) + l.minutes > mins && toMin(l.starts_at) - mins <= 180)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
    if (slot) {
      const on = toMin(slot.starts_at) <= mins;
      return { kind: 'live', title: `${on ? 'On now' : `Live at ${pretty(slot.starts_at)}`}: ${slot.name}`, why: 'Two BAYSE instructors, one watching your form. The best session of the day to do together.', href: '/live', minutes: slot.minutes };
    }
  }
  // Foundation has the workout builder, not the class library: send them to build today's session.
  if (i.canClasses === false) {
    const t = target(i.sessionLength);
    return doneToday
      ? { kind: 'recover', title: 'Done for today', why: 'You have already trained today. Rest, or say hello in the community.', href: '/community', minutes: 0 }
      : { kind: 'class', title: 'Build today’s workout', why: `${thisWeek} of ${i.weeklyGoal} this week. A ${t}-minute class made for your goals, level and kit in seconds.`, href: '/train/build', minutes: t };
  }
  // 2. Already moved today: recovery, not more.
  if (doneToday) {
    const w = ALL.find((x) => x.w.key === 'wind-down-8')!.w;
    return { kind: 'recover', title: 'Done for today. Wind down?', why: 'You have already trained today. An easy stretch helps you recover for next time.', ...pick(w) };
  }
  // 3. Back after a break: start gently.
  if (daysSince !== null && daysSince >= 7) {
    const w = ALL.find((x) => x.w.key === 'wake-up-6')!.w;
    return { kind: 'welcome-back', title: 'Welcome back. Start gently', why: `It has been ${Math.floor(daysSince)} days. Six easy minutes gets you moving again, no pressure.`, ...pick(w) };
  }
  // 4. Weekly goal reached: something lighter and different.
  const styles = [...new Set(i.goals.flatMap((g) => STYLE_FOR_GOAL[g] ?? []))];
  const lvl = maxLevel(i.experience);
  const base = thisWeek >= i.weeklyGoal ? ['flow', 'gentle'] as Style[] : styles.length ? styles : ['mat'] as Style[];
  // Beginners also get the gentle classes, so there is always something at their level for their goal.
  const want = lvl === 1 && !base.includes('gentle') ? [...base, 'gentle'] as Style[] : base;
  const t = thisWeek >= i.weeklyGoal ? 15 : target(i.sessionLength);
  const recent = new Set([...i.completions].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3).map((c) => c.key));
  const fits = ALL.filter((x) => x.level <= lvl);
  const fresh = fits.filter((x) => !recent.has(x.w.key));
  const pool = fresh.filter((x) => want.includes(x.style));
  const ranked = (pool.length ? pool : fresh.length ? fresh : fits).sort((a, b) => timeCost(a.min, t) - timeCost(b.min, t));
  // Rotate through the closest few by day, so it does not suggest the same class every day,
  // but only among classes that are about as good a fit for time as the best one.
  const close = ranked.filter((x) => timeCost(x.min, t) <= timeCost(ranked[0].min, t) + 4).slice(0, 3);
  const choice = close[(wd + thisWeek) % close.length] ?? ranked[0] ?? ALL[0];
  const known = [i.goals.length ? 'your goals' : null, i.experience ? 'your level' : null, i.sessionLength ? `the ${t} minutes you usually have` : null].filter(Boolean) as string[];
  const picked = known.length ? `Picked for ${known.length > 1 ? `${known.slice(0, -1).join(', ')} and ${known[known.length - 1]}` : known[0]}.` : 'A beginner-friendly class to start with. Build your plan and we will pick for your goals and level.';
  const why = thisWeek >= i.weeklyGoal
    ? `Weekly goal reached (${thisWeek} of ${i.weeklyGoal}). Something easy keeps the habit without tiring you out.`
    : `${thisWeek} of ${i.weeklyGoal} this week. ${picked}`;
  return { kind: 'class', title: choice.w.name, why, ...pick(choice.w) };
}
