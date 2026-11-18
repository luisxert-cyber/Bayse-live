// Illustrated BAYSE instructor: side-view poses as joint positions in a 320 x 200 scene.
// Each exercise has two keyframes; the figure eases between them at the exercise's tempo.
// Near limbs are drawn in front, far limbs slightly lighter behind.

export type P = [number, number];
export type Pose = {
  head: P; shoulder: P; hip: P;
  elbowN: P; handN: P; kneeN: P; footN: P;
  elbowF?: P; handF?: P; kneeF?: P; footF?: P;
  /** Spine curve: positive sags (cow), negative rounds (cat). */
  bend?: number;
};
export type Move = { a: Pose; b: Pose; /** seconds for one full rep (a → b → a) */ tempo: number; prop?: 'weights' | 'band' | 'ball'; propAt?: 'hands' | 'knees' | 'ankles' | 'hands-feet' | 'hips' };

const far = (p: P, dx = 4, dy = 1): P => [p[0] + dx, p[1] + dy];

const lying = { head: [214, 160] as P, shoulder: [196, 163] as P, hip: [132, 163] as P };

import { LIB_MOVES } from './library';

const HAND_MOVES: Record<string, Move> = {
  bridge: {
    tempo: 4,
    a: { ...lying, elbowN: [170, 165], handN: [146, 166], kneeN: [108, 134], footN: [92, 166], kneeF: [113, 136], footF: [97, 166] },
    b: { head: [214, 160], shoulder: [194, 162], hip: [130, 136], elbowN: [170, 165], handN: [146, 166], kneeN: [100, 124], footN: [92, 166], kneeF: [105, 126], footF: [97, 166] },
  },
  deadbug: {
    tempo: 4,
    a: { ...lying, elbowN: [196, 135], handN: [196, 108], elbowF: [200, 136], handF: [200, 109], kneeN: [134, 127], footN: [100, 127], kneeF: [138, 128], footF: [104, 128] },
    b: { ...lying, elbowN: [222, 150], handN: [248, 158], elbowF: [200, 136], handF: [200, 109], kneeN: [134, 127], footN: [100, 127], kneeF: [104, 150], footF: [70, 158] },
  },
  birddog: {
    tempo: 5,
    a: { hip: [110, 118], shoulder: [180, 118], head: [198, 110], elbowN: [180, 142], handN: [180, 166], elbowF: [185, 142], handF: [185, 166], kneeN: [110, 164], footN: [74, 166], kneeF: [114, 164], footF: [78, 166] },
    b: { hip: [110, 118], shoulder: [180, 118], head: [198, 110], elbowN: [206, 113], handN: [233, 109], elbowF: [185, 142], handF: [185, 166], kneeN: [110, 164], footN: [74, 166], kneeF: [76, 117], footF: [40, 115] },
  },
  plank: {
    tempo: 4,
    a: { head: [222, 112], shoulder: [204, 118], hip: [132, 132], elbowN: [204, 142], handN: [204, 166], elbowF: [208, 142], handF: [208, 166], kneeN: [96, 146], footN: [60, 160], kneeF: [98, 147], footF: [62, 161] },
    b: { head: [222, 113], shoulder: [204, 119], hip: [132, 129], elbowN: [204, 142], handN: [204, 166], elbowF: [208, 142], handF: [208, 166], kneeN: [96, 145], footN: [60, 160], kneeF: [98, 146], footF: [62, 161] },
  },
  hundred: {
    tempo: 1.2,
    a: { hip: [132, 163], shoulder: [188, 152], head: [204, 142], elbowN: [166, 158], handN: [142, 160], elbowF: [168, 157], handF: [144, 159], kneeN: [108, 140], footN: [84, 118], kneeF: [111, 142], footF: [87, 120] },
    b: { hip: [132, 163], shoulder: [188, 152], head: [204, 142], elbowN: [166, 154], handN: [142, 151], elbowF: [168, 153], handF: [144, 150], kneeN: [108, 140], footN: [84, 118], kneeF: [111, 142], footF: [87, 120] },
  },
  catcow: {
    tempo: 6,
    a: { hip: [110, 118], shoulder: [180, 118], head: [199, 103], bend: 12, elbowN: [180, 142], handN: [180, 166], elbowF: [185, 142], handF: [185, 166], kneeN: [110, 164], footN: [74, 166], kneeF: [114, 164], footF: [78, 166] },
    b: { hip: [110, 116], shoulder: [180, 116], head: [193, 126], bend: -16, elbowN: [180, 142], handN: [180, 166], elbowF: [185, 142], handF: [185, 166], kneeN: [110, 164], footN: [74, 166], kneeF: [114, 164], footF: [78, 166] },
  },
  spinestretch: {
    tempo: 6,
    a: { hip: [110, 160], shoulder: [116, 102], head: [120, 84], elbowN: [144, 104], handN: [170, 106], elbowF: [146, 106], handF: [172, 108], kneeN: [150, 164], footN: [190, 164], kneeF: [152, 165], footF: [192, 165] },
    b: { hip: [110, 160], shoulder: [146, 118], head: [162, 114], bend: -12, elbowN: [176, 134], handN: [204, 150], elbowF: [178, 136], handF: [206, 152], kneeN: [150, 164], footN: [190, 164], kneeF: [152, 165], footF: [192, 165] },
  },
  squat: {
    tempo: 4,
    a: { hip: [150, 98], shoulder: [151, 44], head: [152, 26], elbowN: [176, 52], handN: [202, 54], kneeN: [150, 134], footN: [150, 168], kneeF: [154, 134], footF: [154, 168] },
    b: { hip: [122, 126], shoulder: [152, 80], head: [163, 64], elbowN: [178, 82], handN: [204, 82], kneeN: [162, 128], footN: [150, 168], kneeF: [166, 129], footF: [154, 168] },
  },
  swimming: {
    tempo: 2.4,
    a: { head: [216, 158], shoulder: [196, 163], hip: [132, 163], elbowN: [222, 164], handN: [248, 165], elbowF: [224, 163], handF: [250, 164], kneeN: [96, 165], footN: [60, 166], kneeF: [98, 165], footF: [62, 166] },
    b: { head: [216, 154], shoulder: [196, 162], hip: [132, 163], elbowN: [222, 152], handN: [248, 146], elbowF: [224, 163], handF: [250, 164], kneeN: [96, 165], footN: [60, 166], kneeF: [96, 156], footF: [60, 148] },
  },
  singleleg: {
    tempo: 3,
    a: { hip: [132, 163], shoulder: [188, 152], head: [204, 142], elbowN: [170, 138], handN: [154, 128], elbowF: [172, 139], handF: [156, 129], kneeN: [152, 130], footN: [130, 118], kneeF: [100, 150], footF: [66, 140] },
    b: { hip: [132, 163], shoulder: [188, 152], head: [204, 142], elbowN: [170, 139], handN: [156, 129], elbowF: [172, 138], handF: [154, 128], kneeN: [100, 150], footN: [66, 140], kneeF: [152, 130], footF: [130, 118] },
  },
  childs: {
    tempo: 6,
    a: { hip: [100, 140], shoulder: [160, 157], head: [178, 160], elbowN: [192, 164], handN: [222, 166], elbowF: [194, 163], handF: [224, 165], kneeN: [126, 166], footN: [76, 166], kneeF: [130, 166], footF: [80, 166] },
    b: { hip: [100, 135], shoulder: [160, 153], head: [178, 158], elbowN: [192, 164], handN: [222, 166], elbowF: [194, 163], handF: [224, 165], kneeN: [126, 166], footN: [76, 166], kneeF: [130, 166], footF: [80, 166] },
  },
};

export const MOVES: Record<string, Move> = { ...HAND_MOVES, ...LIB_MOVES };

/** Fill in far limbs that were not drawn explicitly. */
export function complete(p: Pose): Required<Pose> {
  return {
    ...p,
    bend: p.bend ?? 0,
    elbowF: p.elbowF ?? far(p.elbowN), handF: p.handF ?? far(p.handN),
    kneeF: p.kneeF ?? far(p.kneeN), footF: p.footF ?? far(p.footN),
  };
}

/** Pose between a and b at t (0..1). */
export function mix(a: Pose, b: Pose, t: number): Required<Pose> {
  const A = complete(a), B = complete(b);
  const l = (x: P, y: P): P => [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t];
  return {
    head: l(A.head, B.head), shoulder: l(A.shoulder, B.shoulder), hip: l(A.hip, B.hip),
    elbowN: l(A.elbowN, B.elbowN), handN: l(A.handN, B.handN), kneeN: l(A.kneeN, B.kneeN), footN: l(A.footN, B.footN),
    elbowF: l(A.elbowF, B.elbowF), handF: l(A.handF, B.handF), kneeF: l(A.kneeF, B.kneeF), footF: l(A.footF, B.footF),
    bend: A.bend + (B.bend - A.bend) * t,
  };
}
