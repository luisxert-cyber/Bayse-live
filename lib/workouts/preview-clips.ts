// Temporary demo clips (AI-generated from BAYSE studio stills), shipped with the site in /public/clips/preview.
// Shown with a "Preview demo" label until filmed clips are uploaded in Admin → Move videos, which always win.
// Instructor review pending: these show the shape of each move, not coaching-grade technique.
const FILES = [
  'arm-circles', 'bear-hold', 'birddog', 'bridge', 'catcow', 'chair-pose', 'chair-pose-hold', 'childs', 'deadbug',
  'figure-four-hold', 'good-morning', 'heel-slides', 'knee-hug', 'march', 'plank', 'quad-hip-circle', 'roll-back',
  'singleleg', 'sphinx-hold', 'spine-twist', 'spinestretch', 'squat', 'standing-roll-down',
] as const;

/** Moves that look the same as one we have (holds of the same position). */
const SAME_AS: Record<string, string> = { sphinx: 'sphinx-hold', 'figure-four': 'figure-four-hold', 'bear-hold-hold': 'bear-hold' };

const SET = new Set<string>(FILES);
export function previewClip(move: string): string | null {
  const k = SET.has(move) ? move : SAME_AS[move];
  return k && SET.has(k) ? `/clips/preview/${k}.mp4` : null;
}
export const PREVIEW_MOVES = [...FILES, ...Object.keys(SAME_AS)];

/** A still from the preview demo, for thumbnails. */
export function previewPoster(move: string): string | null {
  const clip = previewClip(move);
  return clip ? clip.replace(/\.mp4$/, '.jpg') : null;
}
