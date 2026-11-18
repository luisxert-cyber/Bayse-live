// BAYSE women's wellness pathways: pregnancy, after a baby, and perimenopause to menopause.
// General exercise guidance written for healthy adults. It is not medical advice and does not
// replace a midwife, GP or women's health physiotherapist; every pathway says so on screen.
import { PATHWAY_WORKOUTS } from '@/lib/workouts/sets';
import type { Workout } from '@/lib/workouts/catalog';

export type PathwayKey = keyof typeof PATHWAY_WORKOUTS;
export type Pathway = {
  key: PathwayKey; name: string; tag: string; intro: string;
  /** Read before starting: who to check with first. */
  first: string;
  focus: string[]; avoid: string[]; stop: string[];
  week: string;
  workouts: Workout[];
  notes: [string, string][];
};

export const PATHWAYS: Pathway[] = [
  {
    key: 'pregnancy', name: 'Pregnancy', tag: 'Move well through every trimester',
    intro: 'Short, gentle classes to keep you strong and comfortable while you are pregnant. Everything is standing or on hands and knees.',
    first: 'Tell your midwife or GP that you are exercising, and check with them before you start if you have been told your pregnancy is higher risk or you have any complications.',
    focus: ['Legs, hips and glutes for carrying and for labour', 'An open chest and strong upper back', 'Easy movement on all fours to take the weight off your back', 'Breathing out on the effort, and pelvic floor exercises every day'],
    avoid: ['Lying flat on your back for more than a few minutes after about 16 weeks', 'Lying on your front', 'Planks, sit-ups, curls and anything that makes your tummy dome or bulge down the middle', 'Deep twists and stretching to your limit: your joints are looser than usual', 'Getting very hot, breathless or holding your breath'],
    stop: ['Bleeding or fluid from the vagina', 'Dizziness, feeling faint or a headache that will not go', 'Chest pain or unusual shortness of breath', 'Calf pain or swelling', 'Regular painful tightenings', 'Your baby moving less than usual'],
    week: 'Aim for three short sessions a week with walking on the other days. You should be able to hold a conversation the whole way through.',
    workouts: PATHWAY_WORKOUTS.pregnancy,
    notes: [
      ['First trimester', 'Tiredness and sickness are normal. Do less on hard days: ten minutes still counts.'],
      ['Second trimester', 'Often the best you will feel. Keep the classes as they are and add a walk.'],
      ['Third trimester', 'Slow everything down, use a chair for balance, and favour All-fours Ease.'],
    ],
  },
  {
    key: 'postnatal', name: 'After your baby', tag: 'Rebuild from the inside out',
    intro: 'Three stages that start with breath and pelvic floor and build back to full classes, at your pace, not the calendar’s.',
    first: 'Wait until you have had your postnatal check (usually six to eight weeks) and been told you can exercise. After a caesarean or a difficult birth, expect to wait longer and ask before you begin.',
    focus: ['Pelvic floor exercises every day, from the first days', 'Breathing that gently draws your deep core in', 'Glutes and hips, which do a lot of the work your core cannot yet', 'Posture for feeding and carrying'],
    avoid: ['Planks, sit-ups, curls and double-leg lifts until stage 3 feels comfortable', 'Running and jumping for at least the first 12 weeks', 'Anything that makes your tummy dome down the middle or causes heaviness or leaking', 'Rushing: move up a stage only when the one before feels easy'],
    stop: ['Heavier or bright red bleeding after exercise', 'Pain in your pelvis, tummy or scar', 'A feeling of heaviness or dragging in your vagina', 'Leaking that is getting worse', 'Pain or redness in a calf, chest pain or breathlessness'],
    week: 'Start with stage 1 three or four times a week. Stay on a stage for at least two weeks. If you have a gap between your tummy muscles, leaking or heaviness that is not improving, ask your GP for a women’s health physiotherapist.',
    workouts: PATHWAY_WORKOUTS.postnatal,
    notes: [
      ['Stage 1: Reconnect', 'From your postnatal check. Small, slow movements with your breath.'],
      ['Stage 2: Rebuild', 'When stage 1 feels easy and causes no heaviness or leaking.'],
      ['Stage 3: Stronger', 'From about 12 weeks if stage 2 feels comfortable. Then move on to Gentle and Mat classes.'],
    ],
  },
  {
    key: 'menopause', name: 'Perimenopause and menopause', tag: 'Strength, balance and better sleep',
    intro: 'Hormone changes affect muscle, bone, joints, sleep and mood. Regular strength work is one of the most useful things you can do about all of them.',
    first: 'If you have been told you have osteoporosis or low bone density, check with your GP or physiotherapist first, and skip forward bends and roll-downs.',
    focus: ['Weight-bearing strength for legs, hips and back to look after your bones', 'Balance and posture', 'Keeping muscle: slow, controlled work with good form', 'A calm routine in the evening to help with sleep'],
    avoid: ['Skipping strength work in favour of stretching only', 'Rolling down or folding forward if you have osteoporosis', 'Training hard in a hot room if flushes are bad: keep cool and keep water close', 'Doing nothing on low-energy days: a short session usually helps'],
    stop: ['Chest pain, palpitations or unusual breathlessness', 'Sudden sharp back pain', 'Dizziness or feeling faint', 'Joint pain that is sharp rather than achy'],
    week: 'Two strength sessions and one balance session a week, with Wind-down for Sleep on any evening you like. Add walking most days.',
    workouts: PATHWAY_WORKOUTS.menopause,
    notes: [
      ['Joints feel stiff', 'Warm up for longer and start with Balance & Posture.'],
      ['Sleep is poor', 'Train earlier in the day and do the wind-down class before bed.'],
      ['Energy is low', 'Do the first five minutes. You can stop there, and most days you will not want to.'],
    ],
  },
];

export const findPathway = (key: string) => PATHWAYS.find((p) => p.key === key);
