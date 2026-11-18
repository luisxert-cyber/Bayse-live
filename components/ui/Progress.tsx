export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round((Math.max(0, Math.min(value, max)) / max) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-1 w-full overflow-hidden rounded-pill bg-stone">
      <div className="h-full rounded-pill bg-ink transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
