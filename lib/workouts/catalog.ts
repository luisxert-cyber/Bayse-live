// Guided timer workouts with the illustrated instructor.
// Mat-only, beginner-friendly cues with an easier option for every move.

export type Area = 'core' | 'glutes' | 'back' | 'mobility' | 'full' | 'upper';
export type Style = 'mat' | 'sculpt' | 'standing' | 'cardio' | 'flow' | 'gentle';
export type Exercise = { key: string; move: string; name: string; cue: string; easier: string; areas: Area[]; level: 1 | 2 | 3; loads?: ('knees' | 'wrists')[]; role?: 'warmup' | 'cooldown'; styles?: Style[]; prop?: 'weights' | 'band' | 'ball'; variantOf?: string };
export type Block = { ex: string; seconds: number };
export type Workout = { key: string; name: string; summary: string; level: 'Beginner' | 'All levels' | 'Intermediate'; focus: string; rest: number; blocks: Block[]; free?: boolean };

import { LIB_EXERCISES } from './library';

const HAND: Record<string, Exercise> = {
  catcow: { key: 'catcow', move: 'catcow', name: 'Cat-cow', cue: 'Breathe in to lift your chest, breathe out to round your back. Move slowly.', easier: 'Make the movement smaller.', areas: ['back', 'mobility'], level: 1, loads: ['wrists'], role: 'warmup' },
  bridge: { key: 'bridge', move: 'bridge', name: 'Glute bridge', cue: 'Press through your heels, lift your hips, squeeze your glutes at the top. Lower with control.', easier: 'Lift halfway and hold for a breath.', areas: ['glutes', 'back'], level: 1 },
  deadbug: { key: 'deadbug', move: 'deadbug', name: 'Dead bug', cue: 'Keep your lower back heavy on the mat. Reach the opposite arm and leg away, then swap sides.', easier: 'Move only the legs, tapping a heel to the floor.', areas: ['core'], level: 2 },
  birddog: { key: 'birddog', move: 'birddog', name: 'Bird dog', cue: 'Hands under shoulders, knees under hips. Reach the opposite arm and leg long, hips level. Swap sides.', easier: 'Slide just the leg back, toes on the floor.', areas: ['core', 'back', 'glutes'], level: 1, loads: ['wrists'] },
  plank: { key: 'plank', move: 'plank', name: 'Plank', cue: 'Long line from head to heels. Draw your belly in and keep breathing.', easier: 'Drop your knees to the mat.', areas: ['core', 'full'], level: 2, loads: ['wrists'] },
  hundred: { key: 'hundred', move: 'hundred', name: 'The hundred', cue: 'Head and shoulders lifted, pump the arms. Breathe in for five pumps, out for five.', easier: 'Keep your head down and knees bent.', areas: ['core'], level: 2 },
  spinestretch: { key: 'spinestretch', move: 'spinestretch', name: 'Spine stretch forward', cue: 'Sit tall, then peel forward one vertebra at a time, reaching past your toes. Roll back up.', easier: 'Bend your knees or sit on a cushion.', areas: ['mobility', 'back'], level: 1, role: 'warmup' },
  squat: { key: 'squat', move: 'squat', name: 'Squat', cue: 'Feet hip-width, sit back as if into a chair, chest proud. Drive up through your heels.', easier: 'Squat to a chair and stand back up.', areas: ['glutes', 'full'], level: 1, loads: ['knees'] },
  swimming: { key: 'swimming', move: 'swimming', name: 'Swimming', cue: 'Lying on your front, lift the opposite arm and leg a little, then swap with a steady flutter. Keep your neck long.', easier: 'Lift one limb at a time, slowly.', areas: ['back', 'glutes'], level: 1 },
  singleleg: { key: 'singleleg', move: 'singleleg', name: 'Single-leg stretch', cue: 'Head and shoulders lifted, hug one knee in and reach the other leg long. Switch smoothly.', easier: 'Keep your head down and the long leg higher.', areas: ['core'], level: 2 },
  childs: { key: 'childs', move: 'childs', name: "Child's pose", cue: 'Sit back towards your heels, arms long, forehead down. Breathe into your back.', easier: 'Widen your knees or rest on a pillow.', areas: ['mobility', 'back'], level: 1, loads: ['knees'], role: 'cooldown' },
};
for (const [k, st] of Object.entries({catcow: ['mat','flow','gentle'], bridge: ['mat','sculpt','gentle'], deadbug: ['mat'], birddog: ['mat','gentle'], plank: ['mat','sculpt','cardio'], hundred: ['mat'], spinestretch: ['mat','flow','gentle'], squat: ['standing','sculpt','cardio'], childs: ['flow','gentle','mat'], swimming: ['mat'], singleleg: ['mat']} as Record<string, Style[]>)) HAND[k].styles = st;

export const EXERCISES: Record<string, Exercise> = { ...HAND, ...LIB_EXERCISES };

export const WORKOUTS: Workout[] = [
  { key: 'wake-up-6', name: 'Wake-up Flow', summary: 'Six gentle minutes to loosen your spine and switch on your core.', level: 'All levels', focus: 'Mobility', rest: 10, free: true,
    blocks: [{ ex: 'catcow', seconds: 45 }, { ex: 'spinestretch', seconds: 40 }, { ex: 'bridge', seconds: 40 }, { ex: 'birddog', seconds: 45 }, { ex: 'deadbug', seconds: 40 }, { ex: 'childs', seconds: 45 }] },
  { key: 'core-10', name: 'Core Express', summary: 'Ten minutes of deep core work, the BAYSE way.', level: 'Intermediate', focus: 'Core', rest: 15,
    blocks: [{ ex: 'catcow', seconds: 40 }, { ex: 'hundred', seconds: 50 }, { ex: 'deadbug', seconds: 45 }, { ex: 'birddog', seconds: 45 }, { ex: 'plank', seconds: 30 }, { ex: 'hundred', seconds: 40 }, { ex: 'deadbug', seconds: 40 }, { ex: 'plank', seconds: 30 }, { ex: 'childs', seconds: 45 }] },
  { key: 'glutes-12', name: 'Glutes & Legs', summary: 'Twelve minutes for strong glutes and steady legs. No equipment.', level: 'All levels', focus: 'Glutes & legs', rest: 15,
    blocks: [{ ex: 'catcow', seconds: 40 }, { ex: 'squat', seconds: 45 }, { ex: 'bridge', seconds: 50 }, { ex: 'birddog', seconds: 45 }, { ex: 'squat', seconds: 45 }, { ex: 'bridge', seconds: 50 }, { ex: 'plank', seconds: 30 }, { ex: 'squat', seconds: 40 }, { ex: 'spinestretch', seconds: 40 }, { ex: 'childs', seconds: 45 }] },
  { key: 'wind-down-8', name: 'Evening Wind-down', summary: 'Eight slow minutes to release your back and hips before bed.', level: 'Beginner', focus: 'Stretch', rest: 10,
    blocks: [{ ex: 'catcow', seconds: 60 }, { ex: 'childs', seconds: 60 }, { ex: 'spinestretch', seconds: 60 }, { ex: 'bridge', seconds: 45 }, { ex: 'childs', seconds: 75 }] },
];

export const workoutSeconds = (w: Workout) => w.blocks.reduce((n, b) => n + b.seconds, 0) + w.rest * (w.blocks.length - 1);
export const workoutMinutes = (w: Workout) => Math.round(workoutSeconds(w) / 60);
export const findWorkout = (key: string) => WORKOUTS.find((w) => w.key === key);
