// Stage-of-life programmes: short guided classes put together for where a member is in life.
// Each class is built only from moves that already have a demo, at beginner level, with an easier
// option on every move. BAYSE supports wellbeing and movement: this is not medical or rehabilitation care.
//
// Postnatal and Prenatal were opened on the owner's instruction (19 Nov 2026) before a specialist review.
// They have NOT yet been checked by a qualified pre and postnatal instructor: that review is still wanted.
// Until then they are kept deliberately cautious: Prenatal has nothing lying on the back or front, no
// twists, no planks and no curl-ups; Postnatal has no planks or curl-ups. Both show the checks to make
// first and the signs to stop, and neither says it has been approved by a specialist.
// Set `open: false` on a programme to take it down again.
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

// Cautious first versions. See the note at the top of this file.
const POSTNATAL = [
  w('postnatal-reconnect', 'Reconnect', 'Breath and the gentlest core work, lying comfortably.', 'Core', [['heel-slides', 45], ['knee-hug', 45], ['bridge', 40], ['heel-slides', 45], ['knee-hug', 60]], 15),
  w('postnatal-steady', 'Steady Strength', 'Easy all-fours and bridge work as you rebuild.', 'Strength', [['catcow', 45], ['birddog', 40], ['bridge', 45], ['heel-slides', 45], ['childs', 60]], 15),
  w('postnatal-posture', 'Feeding Posture Reset', 'Open the chest and shoulders after hours of holding and feeding.', 'Posture', [['arm-circles', 45], ['standing-roll-down', 45], ['spine-twist', 45], ['good-morning', 40], ['march', 45]], 15),
];
const PRENATAL = [
  w('prenatal-standing', 'Standing Strength', 'Upright strength for legs and posture. Keep a chair within reach.', 'Strength', [['march', 45], ['arm-circles', 45], ['squat', 40], ['good-morning', 40], ['march', 45]], 20),
  w('prenatal-all-fours', 'All-fours Ease', 'Take the weight off your back on hands and knees.', 'Mobility', [['catcow', 60], ['quad-hip-circle', 45], ['birddog', 40], ['childs', 60]], 20),
  w('prenatal-shoulders', 'Shoulders & Breath', 'Standing work for the upper back and posture, with slow breathing.', 'Posture', [['arm-circles', 45], ['march', 45], ['good-morning', 35], ['arm-circles', 45], ['march', 40]], 20),
];

export type StageProgramme = {
  key: string; name: string; tagline: string; about: string; weeks: number; perWeek: number;
  /** Shown above the classes. Programmes for a life stage with medical considerations must carry one. */
  note: string; open: boolean; classes: Workout[];
  /** Signs to stop and get advice, listed on the programme page. */
  stop?: string[];
  /** How to adapt the general cues for this stage, listed on the programme page. */
  adapt?: string[];
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
  { key: 'postnatal', name: 'BAYSE Postnatal', tagline: 'A gradual return after pregnancy and birth', weeks: 6, perWeek: 3, open: true, classes: POSTNATAL,
    about: 'A gentle, gradual return to movement after having a baby. Very short sessions, with no planks or sit-up style moves.',
    note: 'Only start after your postnatal check and once your GP, midwife or pelvic health physiotherapist has cleared you to exercise. After a caesarean or a difficult birth this is often later than six weeks.',
    adapt: ['Go slower and smaller than the instructions say. There is no rush.', 'Breathe out gently as you make the effort. Never hold your breath or bear down.', 'Feeding or holding your baby a lot? Do the posture session as often as you like.'],
    stop: ['Your tummy bulges or domes down the middle', 'Leaking, or heaviness or dragging in your pelvis', 'Pain in your tummy, scar, back or pelvis', 'Bleeding that gets heavier or starts again', 'Feeling dizzy or unwell'] },
  { key: 'prenatal', name: 'BAYSE Prenatal', tagline: 'Staying strong through pregnancy', weeks: 6, perWeek: 3, open: true, classes: PRENATAL,
    about: 'Gentle strength and mobility through pregnancy. Everything is standing or on hands and knees: nothing lying on your back or front, no twists and no planks.',
    note: 'Only with agreement from your midwife or doctor that exercise is right for you in this pregnancy. If you have been told not to exercise, or have any complication, do not use this programme.',
    adapt: ['Work at a level where you can still hold a conversation.', 'Where an instruction says to draw your belly in, simply stand or kneel tall and breathe normally instead.', 'Keep a chair within reach, squat only as low as is comfortable, and keep your knees wide in child’s pose.', 'Drink water, keep cool and take longer rests whenever you want them.'],
    stop: ['Bleeding or fluid leaking', 'Pain in your tummy, pelvis or chest, or regular tightenings', 'Feeling dizzy, faint or unusually short of breath', 'A bad headache, or pain or swelling in your calf', 'Your baby is moving less than usual'] },
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
