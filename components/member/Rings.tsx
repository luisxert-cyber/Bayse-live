import type { Game } from '@/lib/daily/game';

const STROKE = ['#ffffff', '#b9b9b9', '#7d7d7d'];

/** Three weekly rings (move, minutes, live) that close as the member trains. Black, white and grey to match the brand. */
export function Rings({ rings, size = 148 }: { rings: Game['rings']; size?: number }) {
  const width = 13, gap = 4, c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img"
      aria-label={rings.map((r) => `${r.label}: ${r.value} of ${r.goal} ${r.unit}`).join('. ')}>
      {rings.map((r, i) => {
        const radius = c - width / 2 - i * (width + gap);
        const len = 2 * Math.PI * radius;
        const done = Math.max(0, Math.min(1, r.value / r.goal));
        return (
          <g key={r.key} transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={radius} fill="none" stroke={STROKE[i]} strokeOpacity={0.16} strokeWidth={width} />
            {done > 0 && <circle cx={c} cy={c} r={radius} fill="none" stroke={STROKE[i]} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${len * done} ${len}`} />}
          </g>
        );
      })}
    </svg>
  );
}
