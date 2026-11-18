// The free 7-day Pilates challenge: one short class a day, open to anyone with an email address.
import { findAnyWorkout } from '@/lib/workouts/builder';
import type { Workout } from '@/lib/workouts/catalog';

export const CHALLENGE_COOKIE = 'bayse_challenge';
export const CHALLENGE_DAYS = 7;

const PLAN: [string, string][] = [
  ['wake-up-6', 'Start gently: loosen your spine and switch on your core.'],
  ['challenge-core', 'The deep core work every BAYSE class is built on.'],
  ['glutes-12', 'Strong glutes and steady legs, no equipment.'],
  ['challenge-posture', 'Undo the desk: open your chest and wake up your back.'],
  ['core-10', 'Back to the core, a little stronger than day 2.'],
  ['wind-down-8', 'A slow stretch to let the week settle in.'],
  ['challenge-finale', 'Everything from the week in one class.'],
];

export type ChallengeDay = { day: number; workout: Workout; line: string };
export const DAYS: ChallengeDay[] = PLAN.map(([key, line], i) => ({ day: i + 1, workout: findAnyWorkout(key)!, line }));

/** Day 1 opens on the start date, day 2 the next day, and so on. */
export function openDay(startedOn: string, today: string) {
  const diff = Math.round((new Date(`${today}T00:00:00Z`).getTime() - new Date(`${startedOn}T00:00:00Z`).getTime()) / 86_400_000);
  return Math.max(1, Math.min(CHALLENGE_DAYS, diff + 1));
}
