// Hand-picked classes for the women's wellness pathways and the free 7-day challenge.
// Unlike the ready-made classes, every move here is chosen by hand, because the pathways need
// specific moves left out (for example nothing lying flat on the back or front in pregnancy).
// Only moves with a demo clip are used; any move without one is skipped rather than shown blank.
import { AVAILABLE, type Workout } from './catalog';

const mk = (key: string, name: string, summary: string, focus: string, level: Workout['level'], rest: number, blocks: [string, number][]): Workout => ({
  key, name, summary, focus, level, rest,
  blocks: blocks.filter(([ex]) => Boolean(AVAILABLE[ex])).map(([ex, seconds]) => ({ ex, seconds })),
});

// Pregnancy: standing and all-fours work only. No lying flat on the back or front, no planks, curls or deep twists.
const PREGNANCY: Workout[] = [
  mk('bump-stand-strong', 'Stand Strong', 'Ten gentle standing minutes for legs, hips and posture. Hold a chair if you want support.', 'Pregnancy · standing', 'All levels', 20,
    [['march', 40], ['arm-circles', 40], ['squat', 40], ['good-morning', 40], ['chair-pose', 35], ['arm-circles', 40], ['squat', 40], ['good-morning', 40], ['march', 40]]),
  mk('bump-all-fours', 'All-fours Ease', 'Take the weight off your back: slow, easy movement on hands and knees.', 'Pregnancy · mobility', 'All levels', 20,
    [['catcow', 50], ['quad-hip-circle', 50], ['birddog', 40], ['catcow', 45], ['quad-hip-circle', 45], ['childs', 60]]),
  mk('bump-legs-posture', 'Legs & Posture', 'A little longer: steady legs and an open chest for carrying well.', 'Pregnancy · strength', 'All levels', 20,
    [['march', 45], ['arm-circles', 40], ['squat', 40], ['chair-pose', 35], ['good-morning', 40], ['catcow', 45], ['birddog', 40], ['quad-hip-circle', 45], ['squat', 40], ['arm-circles', 40], ['childs', 60]]),
];

// After a baby: breath, pelvic floor and deep core first. No planks, curls or sit-ups until later.
const POSTNATAL: Workout[] = [
  mk('postnatal-reconnect', 'Stage 1: Reconnect', 'Breath, pelvic floor and the gentlest core work. Small movements, done well.', 'Postnatal · stage 1', 'Beginner', 20,
    [['heel-slides', 45], ['knee-hug', 45], ['bridge', 35], ['catcow', 45], ['heel-slides', 45], ['childs', 60]]),
  mk('postnatal-rebuild', 'Stage 2: Rebuild', 'Adding hips, glutes and balance once stage 1 feels easy.', 'Postnatal · stage 2', 'Beginner', 20,
    [['catcow', 45], ['heel-slides', 45], ['bridge', 45], ['birddog', 40], ['quad-hip-circle', 45], ['bridge', 45], ['figure-four', 50], ['childs', 60]]),
  mk('postnatal-stronger', 'Stage 3: Stronger', 'Deeper core and standing strength, for when you feel ready to do more.', 'Postnatal · stage 3', 'All levels', 20,
    [['march', 40], ['squat', 40], ['bridge', 45], ['deadbug', 40], ['birddog', 45], ['chair-pose', 35], ['deadbug', 40], ['sphinx', 40], ['childs', 60]]),
];

// Perimenopause and menopause: load-bearing strength, balance, and something calm for the evening.
const MENOPAUSE: Workout[] = [
  mk('meno-strong-bones', 'Strong Bones', 'Weight-bearing strength for legs, hips and back: the work that matters most now.', 'Menopause · strength', 'All levels', 15,
    [['march', 45], ['squat', 45], ['good-morning', 45], ['chair-pose', 40], ['plank', 30], ['bridge', 50], ['squat', 45], ['birddog', 45], ['good-morning', 45], ['bridge', 50], ['childs', 45]]),
  mk('meno-balance-posture', 'Balance & Posture', 'Stand taller and steadier: back, shoulders and control.', 'Menopause · posture', 'All levels', 15,
    [['arm-circles', 40], ['standing-roll-down', 45], ['good-morning', 45], ['chair-pose', 40], ['birddog', 45], ['sphinx', 40], ['catcow', 45], ['arm-circles', 40], ['standing-roll-down', 45]]),
  mk('meno-wind-down', 'Wind-down for Sleep', 'Slow, cooling stretches for the evening. Dim the lights and breathe out slowly.', 'Menopause · rest', 'Beginner', 10,
    [['catcow', 60], ['childs', 60], ['knee-hug', 60], ['figure-four', 60], ['spine-twist', 50], ['spinestretch', 60], ['childs', 75]]),
];

// Free 7-day challenge: the three days that are not existing classes.
const CHALLENGE: Workout[] = [
  mk('challenge-core', 'Core Foundations', 'The deep core work every BAYSE class is built on.', 'Core', 'All levels', 15,
    [['heel-slides', 40], ['deadbug', 40], ['bridge', 45], ['birddog', 45], ['roll-back', 40], ['deadbug', 40], ['childs', 45]]),
  mk('challenge-posture', 'Posture Reset', 'Undo the desk: open your chest and wake up your back.', 'Back & posture', 'All levels', 15,
    [['catcow', 45], ['sphinx', 40], ['birddog', 45], ['good-morning', 40], ['arm-circles', 40], ['standing-roll-down', 45], ['childs', 45]]),
  mk('challenge-finale', 'Full Body Finale', 'Everything from the week in one class. You have earned this one.', 'Full body', 'All levels', 15,
    [['march', 40], ['squat', 45], ['good-morning', 40], ['plank', 30], ['bridge', 45], ['deadbug', 40], ['birddog', 45], ['chair-pose', 35], ['singleleg', 40], ['squat', 45], ['childs', 50]]),
];

export const PATHWAY_WORKOUTS = { pregnancy: PREGNANCY, postnatal: POSTNATAL, menopause: MENOPAUSE } as const;
export const SET_WORKOUTS: Workout[] = [...PREGNANCY, ...POSTNATAL, ...MENOPAUSE, ...CHALLENGE];
