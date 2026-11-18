'use client';
// The BAYSE illustrated instructor. Pure SVG, eased between two keyframes with requestAnimationFrame.
import { useEffect, useRef, useState } from 'react';
import { MOVES, mix, type P, type Pose } from '@/lib/workouts/poses';

// Styled on the BAYSE instructor look: charcoal long-sleeve zip top and leggings, white grip socks,
// long blonde balayage hair with darker roots and a black headband.
const SKIN = '#EBC3A6';
const TOP = '#3B3B42';
const TOP_FAR = '#55555D';
const LEGS = '#2C2C32';
const LEGS_FAR = '#46464D';
const SOCK = '#F2F2F0';
const HAIR = '#E2C38F';
const HAIR_LIGHT = '#F1DDB5';
const ROOTS = '#8C6B4A';
const BAND = '#111111';
const FLOOR = 171;

type PropSpec = { prop?: 'weights' | 'band' | 'ball'; propAt?: 'hands' | 'knees' | 'ankles' | 'hands-feet' | 'hips' };

function Prop({ p, prop, propAt }: { p: Required<Pose> } & PropSpec) {
  if (!prop) return null;
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (prop === 'weights') {
    const spots = propAt === 'ankles' ? [p.footN, p.footF] : propAt === 'knees' ? [p.kneeF] : [p.handN, p.handF];
    return <g>{spots.map((h, i) => <g key={i} transform={`translate(${h[0]} ${h[1]})`}><rect x={-7} y={-2.5} width={14} height={5} rx={2} fill="#2B2B2B" /><rect x={-8.5} y={-5} width={4} height={10} rx={1.5} fill="#111" /><rect x={4.5} y={-5} width={4} height={10} rx={1.5} fill="#111" /></g>)}</g>;
  }
  if (prop === 'ball') {
    const c = propAt === 'knees' ? mid(p.kneeN, p.kneeF) : propAt === 'ankles' ? mid(p.footN, p.footF) : propAt === 'hips' ? [p.hip[0], p.hip[1] + 10] as P : mid(p.handN, p.handF);
    return <circle cx={c[0]} cy={c[1] - (propAt === 'hands' ? 8 : 0)} r={9} fill="#D9CFC0" stroke="#B8AC99" strokeWidth={1.5} />;
  }
  const BAND = '#C9826B';
  if (propAt === 'hands-feet') return <g stroke={BAND} strokeWidth={2.5} fill="none" strokeLinecap="round"><path d={`M${p.handN[0]} ${p.handN[1]} L${p.footN[0]} ${p.footN[1]}`} /><path d={`M${p.handF[0]} ${p.handF[1]} L${p.footF[0]} ${p.footF[1]}`} /></g>;
  const [a, b] = propAt === 'knees' ? [p.kneeN, p.kneeF] : propAt === 'ankles' ? [p.footN, p.footF] : [p.handN, p.handF];
  const c = mid(a, b);
  return <ellipse cx={c[0]} cy={c[1]} rx={Math.max(6, Math.hypot(a[0] - b[0], a[1] - b[1]) / 2 + 4)} ry={5} fill="none" stroke={BAND} strokeWidth={3} transform={`rotate(${(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI} ${c[0]} ${c[1]})`} />;
}

function Body({ p }: { p: Required<Pose> }) {
  const [sx, sy] = p.shoulder, [hx, hy] = p.hip;
  // Spine as a curve: control point pushed perpendicular to the torso by `bend`.
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, len = Math.hypot(sx - hx, sy - hy) || 1;
  const px = -(sy - hy) / len, py = (sx - hx) / len;
  const cx = mx + px * p.bend, cy = my + py * p.bend;
  const seg = (a: P, b: P, c: P, color: string, w: number) => (
    <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
  // Head orientation along the neck; hair hangs from the back of the head with gravity, resting on the mat.
  const hdx = p.head[0] - sx, hdy = p.head[1] - sy, hl = Math.hypot(hdx, hdy) || 1;
  const ux = hdx / hl, uy = hdy / hl;
  // Face direction: forward when upright, up when lying on the back.
  const fx = -uy, fy = -ux;
  const back: P = [p.head[0] - fx * 6, p.head[1] - fy * 6];
  // Long hair hangs from the back of the head, down the back (or onto the mat), with a little gravity.
  const tip: P = [back[0] - ux * 22, Math.min(back[1] - uy * 22 + 9, FLOOR - 3)];
  const ctrl: P = [back[0] - ux * 8 - fx * 4, back[1] - uy * 8 - fy * 4 + 4];
  const ang = (Math.atan2(hdy, hdx) * 180) / Math.PI + 90;
  const hand = (h: P, far = false) => <circle cx={h[0]} cy={h[1]} r={far ? 3.4 : 3.8} fill={SKIN} />;
  const sock = (f: P, far = false) => <circle cx={f[0]} cy={f[1]} r={far ? 4.6 : 5.2} fill={SOCK} stroke="#D6D6D3" strokeWidth={0.8} />;
  return (
    <g>
      {/* far side */}
      {seg(p.hip, p.kneeF, p.footF, LEGS_FAR, 10)}
      {sock(p.footF, true)}
      {seg(p.shoulder, p.elbowF, p.handF, TOP_FAR, 7.5)}
      {hand(p.handF, true)}
      {/* torso and near leg */}
      <path d={`M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`} stroke={TOP} strokeWidth={19} fill="none" strokeLinecap="round" />
      <path d={`M${(sx * 3 + hx) / 4} ${(sy * 3 + hy) / 4} L${(sx + hx * 3) / 4} ${(sy + hy * 3) / 4}`} stroke="#5A5A62" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <circle cx={hx} cy={hy} r={9.5} fill={LEGS} />
      {seg(p.hip, p.kneeN, p.footN, LEGS, 11)}
      {sock(p.footN)}
      {/* long hair */}
      <path d={`M${back[0]} ${back[1]} Q${ctrl[0]} ${ctrl[1]} ${tip[0]} ${tip[1]}`} stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={`M${back[0] + 1} ${back[1] + 2} Q${ctrl[0] + 2} ${ctrl[1] + 2} ${tip[0] + 2} ${tip[1] - 2}`} stroke={HAIR_LIGHT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* neck and head */}
      <path d={`M${sx} ${sy} L${p.head[0] - ux * 9} ${p.head[1] - uy * 9}`} stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
      <circle cx={p.head[0]} cy={p.head[1]} r={10.5} fill={SKIN} />
      <circle cx={p.head[0] - fx * 4.5} cy={p.head[1] - fy * 4.5} r={8.6} fill={HAIR} />
      <g transform={`rotate(${ang} ${p.head[0]} ${p.head[1]})`}>
        {/* hair cap: darker roots fading to blonde, then the headband */}
        <path d={`M${p.head[0] - 11} ${p.head[1] + 1} a11 11 0 0 1 22 0 q-4 -4 -11 -4.5 q-7 0.5 -11 4.5z`} fill={HAIR} />
        <path d={`M${p.head[0] - 8} ${p.head[1] - 6} a9 6 0 0 1 16 0 q-3.5 -2 -8 -2.2 q-4.5 0.2 -8 2.2z`} fill={ROOTS} opacity={0.85} />
        <path d={`M${p.head[0] - 10.2} ${p.head[1] - 3.2} Q${p.head[0]} ${p.head[1] - 9.5} ${p.head[0] + 10.2} ${p.head[1] - 3.2}`} stroke={BAND} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </g>
      {/* near arm in front */}
      {seg(p.shoulder, p.elbowN, p.handN, TOP, 8)}
      {hand(p.handN)}
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
      <Prop p={mix(m.a, m.b, t)} prop={m.prop} propAt={m.propAt} />
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
      <Prop p={mix(m.a, m.b, t)} prop={m.prop} propAt={m.propAt} />
    </svg>
  );
}
