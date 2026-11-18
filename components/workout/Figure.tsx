'use client';
// The BAYSE illustrated instructor. Pure SVG, eased between two keyframes with requestAnimationFrame.
import { useEffect, useRef, useState } from 'react';
import { MOVES, mix, type P, type Pose } from '@/lib/workouts/poses';

const SKIN = '#E7B99A';
const SKIN_FAR = '#D9A786';
const KIT = '#141414';
const KIT_FAR = '#3A3A3A';
const HAIR = '#4A2E22';

function Body({ p }: { p: Required<Pose> }) {
  const [sx, sy] = p.shoulder, [hx, hy] = p.hip;
  // Spine as a curve: control point pushed perpendicular to the torso by `bend`.
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, len = Math.hypot(sx - hx, sy - hy) || 1;
  const px = -(sy - hy) / len, py = (sx - hx) / len; // perpendicular, 'below' a head-right torso
  const cx = mx + px * p.bend, cy = my + py * p.bend;
  const limb = (a: P, b: P, c: P, color: string, w: number) => (
    <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
  // Head faces along the neck direction; ponytail trails behind it.
  const hdx = p.head[0] - sx, hdy = p.head[1] - sy, hl = Math.hypot(hdx, hdy) || 1;
  const back: P = [p.head[0] - (hdx / hl) * 9 - (hdy / hl) * 3, p.head[1] - (hdy / hl) * 9 + (hdx / hl) * 3];
  return (
    <g>
      {limb(p.hip, p.kneeF, p.footF, KIT_FAR, 10)}
      {limb(p.shoulder, p.elbowF, p.handF, SKIN_FAR, 7.5)}
      <path d={`M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`} stroke={KIT} strokeWidth={19} fill="none" strokeLinecap="round" />
      {limb(p.hip, p.kneeN, p.footN, KIT, 11)}
      <path d={`M${sx} ${sy} L${p.head[0] - (hdx / hl) * 9} ${p.head[1] - (hdy / hl) * 9}`} stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
      <circle cx={back[0]} cy={back[1]} r={5.5} fill={HAIR} />
      <circle cx={p.head[0]} cy={p.head[1]} r={10.5} fill={SKIN} />
      <path d={`M${p.head[0] - 10.5} ${p.head[1]} a10.5 10.5 0 0 1 21 0 q-4 -6 -10.5 -6 q-6.5 0 -10.5 6z`} fill={HAIR} transform={`rotate(${(Math.atan2(hdy, hdx) * 180) / Math.PI + 90} ${p.head[0]} ${p.head[1]})`} />
      {limb(p.shoulder, p.elbowN, p.handN, SKIN, 8)}
    </g>
  );
}

export function Figure({ move, playing = true, className = '' }: { move: keyof typeof MOVES | string; playing?: boolean; className?: string }) {
  const m = MOVES[move] ?? MOVES.childs;
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const tick = (ts: number) => {
      if (start.current === null) start.current = ts;
      const phase = (((ts - start.current) / 1000) % m.tempo) / m.tempo; // 0..1
      setT((1 - Math.cos(phase * 2 * Math.PI)) / 2); // ease a → b → a
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [m, playing]);
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Illustrated instructor demonstrating the exercise">
      <rect x="0" y="0" width="320" height="200" fill="transparent" />
      <rect x="30" y="171" width="260" height="7" rx="3.5" fill="#CFCFCC" />
      <Body p={mix(m.a, m.b, t)} />
    </svg>
  );
}

/** Static render for previews and tests. */
export function FigureStill({ move, t = 0, className = '' }: { move: string; t?: number; className?: string }) {
  const m = MOVES[move] ?? MOVES.childs;
  return (
    <svg viewBox="0 0 320 200" className={className}>
      <rect x="30" y="171" width="260" height="7" rx="3.5" fill="#CFCFCC" />
      <Body p={mix(m.a, m.b, t)} />
    </svg>
  );
}
