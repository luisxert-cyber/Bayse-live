import { Card } from '@/components/ui/Card';

export function ProgrammeResult({ name, weeks, sessionsPerWeek, reasons }: { name: string; weeks: number; sessionsPerWeek: number; reasons: string[] }) {
  return (
    <Card className="p-6">
      <p className="eyebrow">Recommended for you</p>
      <h2 className="mt-2 text-xl font-semibold">{name}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-bg px-4 py-3"><p className="font-serif text-2xl leading-none">{weeks}</p><p className="mt-1 text-xs text-muted">weeks</p></div>
        <div className="rounded-2xl bg-bg px-4 py-3"><p className="font-serif text-2xl leading-none">{sessionsPerWeek}</p><p className="mt-1 text-xs text-muted">sessions a week</p></div>
      </div>
      <p className="mt-5 text-sm font-medium">Why we chose it</p>
      <ul className="mt-2 space-y-2.5">
        {reasons.map((r) => (
          <li key={r} className="flex gap-3 text-sm"><span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{r}</li>
        ))}
      </ul>
    </Card>
  );
}
