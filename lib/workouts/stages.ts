// Stage-of-life programmes: short guided classes put together for where a member is in life.
// Each class is built only from moves that already have a demo, at beginner level, with an easier
// option on every move. BAYSE supports wellbeing and movement: this is not medical or rehabilitation care.
//
// Postnatal and Prenatal are written here as DRAFTS and are not shown or playable (`open: false`).
// They open only after a suitably qualified pre and postnatal instructor has checked every move and cue.
import type { Workout } from './catalog';

const w = (key: string, name: string, summary: string, focus: string, blocks: [string, number][], rest = 12): Workout =>
  ({ key, name, summary, level: 'Beginner', focus, rest, blocks: blocks.map(([ex, seconds]) => ({ ex, seconds })) });

const BEGIN = [
  w('begin-first-steps', 'First Steps', 'Your very first BAYSE class. Slow, simple and nothing to get wrong.', 'Full body',
    [['march', 45], ['arm-circles', 40], ['standing-roll-down', 45], ['catcow', 45], ['heel-slides', 45], ['bridge', 40], ['knee-hug', 45], ['childs', 45]]),
  w('begin-core-basics', 'Core Basics', 'Find your deep core muscles and learn to breathe with the movement.', 'Core',
    [['catcow', 45], ['heel-slides', 45], ['bridge', 45], ['birddog', 45], ['roll-back', 40], ['spine-twist', 40], ['knee-hug', 45], ['childs', 45]]),
  w('begin-stand-tall', 'Stand Tall', 'Standing work for posture, legs and confidence. No getting down to the floor.', 'Posture',
    [['march', 45], ['arm-circles', 45], ['good-morning', 45], ['squat', 40], ['chair-pose', 30], ['standing-roll-down', 45], ['march', 40], ['arm-circles', 40]]),
];

const STRONGER = [
  w('stronger-balance', 'Balance & Steady Legs', 'Standing strength and balance. Keep a chair or worktop within reach.', 'Balance',
    [['march', 60], ['arm-circles', 45], ['chair-pose', 30], ['good-morning', 45], ['squat', 40], ['march', 45], ['chair-pose-hold', 30], ['standing-roll-down', 45]], 15),
  w('stronger-strength', 'Everyday Strength', 'The strength for stairs, shopping bags and getting up from the floor.', 'Strength',
    [['march', 45], ['squat', 45], ['good-morning', 45], ['bridge', 45], ['heel-slides', 45], ['squat', 40], ['bridge', 45], ['knee-hug', 45], ['figure-four', 45]], 15),
  w('stronger-mobility', 'Loosen Up', 'Ease stiff shoulders, hips and back. Gentle enough for every day.', 'Mobility',
    [['arm-circles', 45], ['standing-roll-down', 45], ['spine-twist', 45], ['spinestretch', 45], ['heel-slides', 45], ['knee-hug', 45], ['figure-four-hold', 45]], 15),
];

const MIDLIFE = [
  w('midlife-strong', 'Midlife Strong', 'Strength work for legs, glutes and core: the kind that matters most through midlife.', 'Strength',
    [['march', 45], ['squat', 45], ['good-morning', 45], ['chair-pose', 35], ['bridge', 50], ['birddog', 45], ['plank', 25], ['squat', 45], ['bridge', 50], ['childs', 45]], 15),
  w('midlife-core-back', 'Core & Back Care', 'A steady core and a happier back, without rushing.', 'Core',
    [['catcow', 45], ['deadbug', 40], ['birddog', 45], ['bridge', 45], ['sphinx', 40], ['roll-back', 40], ['spine-twist', 40], ['childs', 45]]),
  w('midlife-unwind', 'Unwind', 'Slow stretches and long breaths for the end of the day, or a restless night.', 'Stretch',
    [['catcow', 60], ['spine-twist', 45], ['spinestretch', 60], ['knee-hug', 60], ['figure-four-hold', 60], ['childs', 75]], 10),
];

const AT_HOME = [
  w('home-gentle-start', 'Gentle Start', 'Low impact and all standing. A chair nearby is all you need.', 'Full body',
    [['march', 45], ['arm-circles', 45], ['standing-roll-down', 45], ['good-morning', 45], ['squat', 40], ['march', 45], ['arm-circles', 40]], 15),
  w('home-floor-flow', 'Floor Flow', 'A quiet session on the mat. Use a cushion wherever it helps.', 'Mobility',
    [['catcow', 45], ['heel-slides', 45], ['bridge', 45], ['knee-hug', 45], ['spine-twist', 45], ['sphinx', 40], ['childs', 60]]),
  w('home-full-body', 'Living Room Full Body', 'A bit of everything, in the space beside the sofa.', 'Full body',
    [['march', 45], ['squat', 45], ['good-morning', 45], ['bridge', 45], ['birddog', 45], ['roll-back', 40], ['figure-four', 45], ['knee-hug', 45]]),
];

// DRAFTS, not open. Awaiting review by a qualified pre and postnatal instructor before any member sees them.
const POSTNATAL = [
  w('postnatal-reconnect', 'Reconnect', 'Breath and the gentlest core work, lying comfortably.', 'Core', [['heel-slides', 45], ['knee-hug', 45], ['bridge', 40], ['heel-slides', 45], ['knee-hug', 60]], 15),
  w('postnatal-steady', 'Steady Strength', 'Easy all-fours and bridge work as you rebuild.', 'Strength', [['catcow', 45], ['birddog', 40], ['bridge', 45], ['heel-slides', 45], ['childs', 60]], 15),
  w('postnatal-posture', 'Feeding Posture Reset', 'Open the chest and shoulders after hours of holding and feeding.', 'Posture', [['arm-circles', 45], ['standing-roll-down', 45], ['spine-twist', 45], ['good-morning', 40], ['march', 45]], 15),
];
const PRENATAL = [
  w('prenatal-standing', 'Standing Strength', 'Upright strength for legs and posture. Keep a chair within reach.', 'Strength', [['march', 45], ['arm-circles', 45], ['squat', 40], ['good-morning', 40], ['march', 45]], 20),
  w('prenatal-all-fours', 'All-fours Ease', 'Take the weight off your back on hands and knees.', 'Mobility', [['catcow', 60], ['quad-hip-circle', 45], ['birddog', 40], ['childs', 60]], 20),
  w('prenatal-shoulders', 'Shoulders & Breath', 'Seated and standing work for the upper back, with slow breathing.', 'Posture', [['arm-circles', 45], ['spine-twist', 40], ['march', 45], ['arm-circles', 45]], 20),
];

export type StageProgramme = {
  key: string; name: string; tagline: string; about: string; weeks: number; perWeek: number;
  /** Shown above the classes. Programmes for a life stage with medical considerations must carry one. */
  note: string; open: boolean; classes: Workout[];
};

export const STAGE_PROGRAMMES: StageProgramme[] = [
  { key: 'begin', name: 'BAYSE Begin', tagline: 'For beginners and women coming back to movement', weeks: 4, perWeek: 3, open: true, classes: BEGIN,
    about: 'Start from the very first breath. Three short classes a week teach you the basics at your own pace, so nothing later feels out of reach.',
    note: 'New to exercise, or back after a long break? Go at your own pace and take the easier option whenever you want it.' },
  { key: 'stronger-years', name: 'BAYSE Stronger Years', tagline: 'For women over 50', weeks: 6, perWeek: 3, open: true, classes: STRONGER,
    about: 'Strength, balance and mobility for staying active and independent. Mostly standing, with a chair within reach and plenty of rest.',
    note: 'Keep a sturdy chair or worktop within reach for balance. If you have osteoporosis, a joint replacement, a heart condition or dizziness, check with your doctor or physiotherapist first.' },
  { key: 'midlife', name: 'BAYSE Midlife', tagline: 'Through perimenopause and menopause', weeks: 6, perWeek: 3, open: true, classes: MIDLIFE,
    about: 'Strength for legs, glutes and core, care for your back, and a slow session for the days when sleep and energy are not on your side.',
    note: 'Energy changes from day to day in midlife. Swap any class for Unwind when you need to. This supports your wellbeing; it does not replace advice from your GP.' },
  { key: 'at-home', name: 'BAYSE At Home', tagline: 'Low impact, in your own space', weeks: 4, perWeek: 3, open: true, classes: AT_HOME,
    about: 'Adaptable sessions with nothing to jump over and nothing to buy. One class is all standing, for days when the floor is not for you.',
    note: 'Reduced mobility or recovering from an injury or illness? Only start once you have been cleared to exercise, and use the easier options.' },
  { key: 'postnatal', name: 'BAYSE Postnatal', tagline: 'A gradual return after pregnancy and birth', weeks: 6, perWeek: 3, open: false, classes: POSTNATAL,
    about: 'A gentle, gradual return to movement after having a baby.',
    note: 'Only after your postnatal check and clearance to exercise from your GP, midwife or pelvic health physiotherapist.' },
  { key: 'prenatal', name: 'BAYSE Prenatal', tagline: 'Staying strong through pregnancy', weeks: 6, perWeek: 3, open: false, classes: PRENATAL,
    about: 'Gentle strength and mobility through pregnancy.',
    note: 'Only with agreement from your midwife or doctor that exercise is right for you in this pregnancy.' },
];

export const OPEN_STAGE_PROGRAMMES = STAGE_PROGRAMMES.filter((p) => p.open);
/** Classes members can play: only those in an open programme. */
export const STAGE_WORKOUTS: Workout[] = OPEN_STAGE_PROGRAMMES.flatMap((p) => p.classes);
export const findStageProgramme = (key: string) => OPEN_STAGE_PROGRAMMES.find((p) => p.key === key);
export const isStageWorkout = (key: string) => STAGE_WORKOUTS.some((x) => x.key === key);

/** The class for each session of the programme, in order: the programme's classes in rotation, week by week. */
export function stageSchedule(p: StageProgramme) {
  return Array.from({ length: p.weeks }, (_, week) => ({
    week: week + 1,
    sessions: Array.from({ length: p.perWeek }, (_, s) => p.classes[(week * p.perWeek + s) % p.classes.length]),
  }));
}
