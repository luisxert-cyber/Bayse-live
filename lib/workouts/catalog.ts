// Guided timer workouts with the illustrated instructor.
// Mat-only, beginner-friendly cues with an easier option for every move.

export type Exercise = { key: string; move: string; name: string; cue: string; easier: string };
export type Block = { ex: string; seconds: number };
export type Workout = { key: string; name: string; summary: string; level: 'Beginner' | 'All levels' | 'Intermediate'; focus: string; rest: number; blocks: Block[]; free?: boolean };

export const EXERCISES: Record<string, Exercise> = {
  catcow: { key: 'catcow', move: 'catcow', name: 'Cat-cow', cue: 'Breathe in to lift your chest, breathe out to round your back. Move slowly.', easier: 'Make the movement smaller.' },
  bridge: { key: 'bridge', move: 'bridge', name: 'Glute bridge', cue: 'Press through your heels, lift your hips, squeeze your glutes at the top. Lower with control.', easier: 'Lift halfway and hold for a breath.' },
  deadbug: { key: 'deadbug', move: 'deadbug', name: 'Dead bug', cue: 'Keep your lower back heavy on the mat. Reach the opposite arm and leg away, then swap sides.', easier: 'Move only the legs, tapping a heel to the floor.' },
  birddog: { key: 'birddog', move: 'birddog', name: 'Bird dog', cue: 'Hands under shoulders, knees under hips. Reach the opposite arm and leg long, hips level. Swap sides.', easier: 'Slide just the leg back, toes on the floor.' },
  plank: { key: 'plank', move: 'plank', name: 'Plank', cue: 'Long line from head to heels. Draw your belly in and keep breathing.', easier: 'Drop your knees to the mat.' },
  hundred: { key: 'hundred', move: 'hundred', name: 'The hundred', cue: 'Head and shoulders lifted, pump the arms. Breathe in for five pumps, out for five.', easier: 'Keep your head down and knees bent.' },
  spinestretch: { key: 'spinestretch', move: 'spinestretch', name: 'Spine stretch forward', cue: 'Sit tall, then peel forward one vertebra at a time, reaching past your toes. Roll back up.', easier: 'Bend your knees or sit on a cushion.' },
  squat: { key: 'squat', move: 'squat', name: 'Squat', cue: 'Feet hip-width, sit back as if into a chair, chest proud. Drive up through your heels.', easier: 'Squat to a chair and stand back up.' },
  childs: { key: 'childs', move: 'childs', name: "Child's pose", cue: 'Sit back towards your heels, arms long, forehead down. Breathe into your back.', easier: 'Widen your knees or rest on a pillow.' },
};

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
