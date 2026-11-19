/** A score out of 100 as a ring with the number in the middle. Black, white and grey to match the brand. */
export function Dial({ value, label, caption, size = 104 }: { value: number | null; label: string; caption?: string; size?: number }) {
  const width = 9, c = size / 2, r = c - width / 2, len = 2 * Math.PI * r;
  const done = value === null ? 0 : Math.max(0, Math.min(1, value / 100));
  return (
    <div className="flex flex-col items-center text-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${label}: ${value === null ? 'no score yet' : `${value} out of 100`}`}>
        <g transform={`rotate(-90 ${c} ${c})`}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="#ffffff" strokeOpacity={0.16} strokeWidth={width} />
          {done > 0 && <circle cx={c} cy={c} r={r} fill="none" stroke="#ffffff" strokeWidth={width} strokeLinecap="round" strokeDasharray={`${len * done} ${len}`} />}
        </g>
        <text x={c} y={c} textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize={size * 0.3} fontWeight={700}>{value === null ? '–' : value}</text>
      </svg>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
      {caption && <p className="text-xs text-muted">{caption}</p>}
    </div>
  );
}
