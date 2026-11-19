// Stage-of-life programmes: short guided classes put together for where a member is in life.
// Each class is built only from moves that already have a demo, at beginner level, with an easier
// option on every move. BAYSE supports wellbeing and movement: this is not medical or rehabilitation care.
//
// Postnatal and Prenatal were opened on the owner's instruction (19 Nov 2026) before a specialist review.
// They have NOT yet been checked by a qualified pre and postnatal instructor: that review is still wanted.
// Until then they are kept deliberately cautious: Prenatal has nothing lying on the back or front, no
// twists, no planks and no curl-ups; Postnatal has no planks or curl-ups. Every move has its own wording
// for that stage (POSTNATAL_CUES, PRENATAL_CUES). Both show the checks to make
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
// Every move in these two programmes has its own wording, written for that stage, in place of the general cue.
type Cues = Record<string, [cue: string, easier: string]>;
const withCues = (list: Workout[], cues: Cues): Workout[] => list.map((x) => ({ ...x, blocks: x.blocks.map((b) => ({ ...b, cue: cues[b.ex]?.[0], easier: cues[b.ex]?.[1] })) }));

export const POSTNATAL_CUES: Cues = {
  'heel-slides': ['Lie on your back with your knees bent. Breathe out gently and slide one heel away along the mat, then draw it back. Keep your tummy soft and flat, with no bulging down the middle.', 'Slide only part of the way.'],
  'knee-hug': ['Bring one knee at a time towards your chest and hold it lightly. Breathe slowly and let your lower back rest on the mat.', 'Keep the other foot on the floor, and hold behind your thigh if that is kinder on your tummy.'],
  bridge: ['Knees bent, feet hip-width apart. Breathe out, gently lift your pelvic floor and peel your hips up a little way. Lower slowly. Keep it low and easy.', 'Just tilt your pelvis without lifting your hips.'],
  catcow: ['On hands and knees, breathe out to round your back gently, then breathe in to come back to a flat back. Move slowly and do not let your tummy hang or dome.', 'Make the movement smaller.'],
  birddog: ['On hands and knees, slide one leg straight back with your toes on the floor. Lift it to hip height only if your tummy stays flat. Swap sides, keeping both hands down.', 'Keep your toes on the floor.'],
  childs: ['Knees apart, sit back towards your heels and rest your arms forward. Breathe into your back and ribs.', 'Rest on a pillow. After a caesarean, stay higher if your scar feels tender.'],
  'arm-circles': ['Stand tall with your arms out to the sides and draw small, slow circles forwards, then backwards. Let your chest open and your shoulders drop.', 'Lower your arms a little.'],
  'standing-roll-down': ['Soft knees. Nod your chin and roll down only halfway, letting your arms hang, then roll back up slowly. Breathe out on the way down.', 'Roll down just a little, sliding your hands down your thighs.'],
  'spine-twist': ['Sit tall on a cushion or a chair with your arms crossed over your chest. Turn gently to one side, come back to the middle, then turn to the other. Small and slow.', 'Turn only as far as is comfortable.'],
  'good-morning': ['Hands on your hips, knees soft. Tip forward from your hips with a long back, then stand tall. Breathe out as you stand.', 'Tip only a little.'],
  march: ['March gently on the spot, standing tall. Breathe normally.', 'Lift your feet only a little, or hold a chair.'],
};

export const PRENATAL_CUES: Cues = {
  march: ['March gently on the spot, standing tall with soft knees. Breathe normally and keep to a pace you could chat at.', 'Hold a chair or worktop and lift your feet only a little.'],
  'arm-circles': ['Stand with your feet hip-width apart and your arms out to the sides. Draw small, slow circles forwards, then backwards, with your shoulders relaxed.', 'Lower your arms, or do one arm at a time.'],
  squat: ['Feet a little wider than your hips, toes turned slightly out to make room for your bump. Sit back towards a chair behind you, only as low as is comfortable, then stand. Breathe out as you stand.', 'Hold a worktop, or sit right down on the chair between each one.'],
  'good-morning': ['Hands on your hips, feet hip-width apart, knees soft. Tip forward a little from your hips with a long back, then stand tall. Keep it small and slow.', 'Rest your hands on a worktop and tip only slightly.'],
  catcow: ['On hands and knees, breathe out and gently round your back, then breathe in and return to a long, flat back. Do not let your back dip down.', 'Make the movement smaller, or rest your forearms on a chair seat.'],
  'quad-hip-circle': ['On hands and knees, draw slow, easy circles with your hips. Change direction halfway and keep your breathing relaxed.', 'Make smaller circles, or put a cushion under your knees.'],
  birddog: ['On hands and knees, slide one leg straight back and lift it only to hip height. Keep your hips level and your back long, and leave both hands on the floor. Swap sides.', 'Keep your toes on the floor and just slide the leg back.'],
  childs: ['Take your knees wide apart to leave room for your bump, sit back towards your heels and rest your arms forward. Breathe slowly.', 'Rest your head and arms on a stack of pillows, or stay higher.'],
};
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
  /** How the weeks change. 'build': longer holds and extra rounds each week. 'gentle': slightly longer holds only.
   *  'steady': the same classes every week, on purpose (pregnancy is not the time to push harder). */
  progress: 'build' | 'gentle' | 'steady';
  /** Signs to stop and get advice, listed on the programme page. */
  stop?: string[];
  /** How to adapt the general cues for this stage, listed on the programme page. */
  adapt?: string[];
};

export const STAGE_PROGRAMMES: StageProgramme[] = [
  { key: 'begin', progress: 'build', name: 'BAYSE Begin', tagline: 'For beginners and women coming back to movement', weeks: 4, perWeek: 3, open: true, classes: BEGIN,
    about: 'Start from the very first breath. Three short classes a week teach you the basics at your own pace, so nothing later feels out of reach.',
    note: 'New to exercise, or back after a long break? Go at your own pace and take the easier option whenever you want it.' },
  { key: 'stronger-years', progress: 'build', name: 'BAYSE Stronger Years', tagline: 'For women over 50', weeks: 6, perWeek: 3, open: true, classes: STRONGER,
    about: 'Strength, balance and mobility for staying active and independent. Mostly standing, with a chair within reach and plenty of rest.',
    note: 'Keep a sturdy chair or worktop within reach for balance. If you have osteoporosis, a joint replacement, a heart condition or dizziness, check with your doctor or physiotherapist first.' },
  { key: 'midlife', progress: 'build', name: 'BAYSE Midlife', tagline: 'Through perimenopause and menopause', weeks: 6, perWeek: 3, open: true, classes: MIDLIFE,
    about: 'Strength for legs, glutes and core, care for your back, and a slow session for the days when sleep and energy are not on your side.',
    note: 'Energy changes from day to day in midlife. Swap any class for Unwind when you need to. This supports your wellbeing; it does not replace advice from your GP.' },
  { key: 'at-home', progress: 'build', name: 'BAYSE At Home', tagline: 'Low impact, in your own space', weeks: 4, perWeek: 3, open: true, classes: AT_HOME,
    about: 'Adaptable sessions with nothing to jump over and nothing to buy. One class is all standing, for days when the floor is not for you.',
    note: 'Reduced mobility or recovering from an injury or illness? Only start once you have been cleared to exercise, and use the easier options.' },
  { key: 'postnatal', progress: 'gentle', name: 'BAYSE Postnatal', tagline: 'A gradual return after pregnancy and birth', weeks: 6, perWeek: 3, open: true, classes: withCues(POSTNATAL, POSTNATAL_CUES),
    about: 'A gentle, gradual return to movement after having a baby. Very short sessions, with no planks or sit-up style moves.',
    note: 'Only start after your postnatal check and once your GP, midwife or pelvic health physiotherapist has cleared you to exercise. After a caesarean or a difficult birth this is often later than six weeks.',
    adapt: ['Every move has its own instructions written for after birth. Follow those, not what you may know from other classes.', 'Go slower and smaller than you think you need to. There is no rush.', 'Breathe out gently as you make the effort. Never hold your breath or bear down.', 'Feeding or holding your baby a lot? Do the posture session as often as you like.'],
    stop: ['Your tummy bulges or domes down the middle', 'Leaking, or heaviness or dragging in your pelvis', 'Pain in your tummy, scar, back or pelvis', 'Bleeding that gets heavier or starts again', 'Feeling dizzy or unwell'] },
  { key: 'prenatal', progress: 'steady', name: 'BAYSE Prenatal', tagline: 'Staying strong through pregnancy', weeks: 6, perWeek: 3, open: true, classes: withCues(PRENATAL, PRENATAL_CUES),
    about: 'Gentle strength and mobility through pregnancy. Everything is standing or on hands and knees: nothing lying on your back or front, no twists and no planks.',
    note: 'Only with agreement from your midwife or doctor that exercise is right for you in this pregnancy. If you have been told not to exercise, or have any complication, do not use this programme.',
    adapt: ['Every move has its own instructions written for pregnancy. Follow those, not what you may know from other classes.', 'Work at a level where you can still hold a conversation.', 'Keep a chair within reach, squat only as low as is comfortable, and keep your knees wide in child’s pose.', 'Drink water, keep cool and take longer rests whenever you want them.'],
    stop: ['Bleeding or fluid leaking', 'Pain in your tummy, pelvis or chest, or regular tightenings', 'Feeling dizzy, faint or unusually short of breath', 'A bad headache, or pain or swelling in your calf', 'Your baby is moving less than usual'] },
];

export const OPEN_STAGE_PROGRAMMES = STAGE_PROGRAMMES.filter((p) => p.open);

// ---- Week-by-week progression ---------------------------------------------------------------------
// The moves never change from week to week (every one has a demo and, for pregnancy and postnatal, its own
// wording). What changes is how much of them there is: each week holds a little longer, and 'build'
// programmes add an extra round of the main moves. Week 1 is the class exactly as written above.
export type WeekPlan = { week: number; label: string; detail: string; sessions: Workout[] };

const round5 = (n: number) => Math.round(n / 5) * 5;

function weekClass(p: StageProgramme, base: Workout, week: number): { w: Workout; extraSeconds: number; extraMoves: number } {
  if (week === 1 || p.progress === 'steady') return { w: week === 1 ? base : { ...base, key: `${base.key}-w${week}` }, extraSeconds: 0, extraMoves: 0 };
  const f = (week - 1) / Math.max(1, p.weeks - 1); // 0 in week 1, 1 in the last week
  const extraSeconds = round5(f * (p.progress === 'gentle' ? 10 : 15));
  // Main moves are everything between the first (warm-up) and last (cool-down). Repeat up to half of them.
  const main = base.blocks.slice(1, -1);
  const extraMoves = p.progress === 'build' ? Math.round(f * Math.ceil(main.length / 2)) : 0;
  const longer = (b: Workout['blocks'][number]) => ({ ...b, seconds: b.seconds + extraSeconds });
  const blocks = [longer(base.blocks[0]), ...main.map(longer), ...main.slice(0, extraMoves).map(longer), longer(base.blocks[base.blocks.length - 1])];
  const how = [extraSeconds ? `${extraSeconds} seconds longer on every move` : null, extraMoves ? `a second round of ${extraMoves} move${extraMoves > 1 ? 's' : ''}` : null].filter(Boolean).join(' and ');
  return { w: { ...base, key: `${base.key}-w${week}`, summary: `Week ${week}: ${how || 'the same class'}. ${base.summary}`, blocks }, extraSeconds, extraMoves };
}

const PHASE = ['Learn the moves', 'Hold a little longer', 'Add a second round', 'Longer and stronger', 'Build', 'Your strongest week'];

/** The class for each session of the programme, in order, week by week. Later weeks are longer versions of the same classes. */
export function stageSchedule(p: StageProgramme): WeekPlan[] {
  return Array.from({ length: p.weeks }, (_, i) => {
    const week = i + 1;
    const made = Array.from({ length: p.perWeek }, (_, s) => weekClass(p, p.classes[(i * p.perWeek + s) % p.classes.length], week));
    const { extraSeconds, extraMoves } = made[0];
    const rounds = made.some((m) => m.extraMoves > 0);
    const label = p.progress === 'steady' ? 'Keep moving'
      : week === 1 ? PHASE[0]
      : p.progress === 'gentle' ? (week === p.weeks ? 'Steady and confident' : extraSeconds ? PHASE[1] : 'Settle in')
      : week === p.weeks ? PHASE[5] : !rounds ? PHASE[1] : extraMoves > 1 ? PHASE[3] : PHASE[2];
    const detail = p.progress === 'steady' ? 'The same three classes, at your own pace'
      : week === 1 ? 'Short classes, plenty of rest'
      : [extraSeconds ? `+${extraSeconds}s on every move` : null, rounds ? (extraMoves > 1 ? 'a longer second round' : 'a short second round') : null].filter(Boolean).join(' · ') || 'The same classes again, a little more familiar';
    return { week, label, detail, sessions: made.map((m) => m.w) };
  });
}

/** Classes members can play: every week's version of every class in an open programme. */
export const STAGE_WORKOUTS: Workout[] = [...new Map(OPEN_STAGE_PROGRAMMES.flatMap((p) => stageSchedule(p).flatMap((wk) => wk.sessions)).map((x) => [x.key, x])).values()];
export const findStageProgramme = (key: string) => OPEN_STAGE_PROGRAMMES.find((p) => p.key === key);
export const isStageWorkout = (key: string) => STAGE_WORKOUTS.some((x) => x.key === key);
/** The programme a class belongs to, so the player can lead back to it. */
export const programmeOfWorkout = (key: string) => OPEN_STAGE_PROGRAMMES.find((p) => stageSchedule(p).some((wk) => wk.sessions.some((x) => x.key === key)));
