import { buttonClass } from '@/components/ui';
import type { Checkin } from '@/lib/daily/readiness';
import { saveCheckin } from '@/app/(member)/you/progress/actions';

const SCALES: { name: keyof Omit<Checkin, 'day' | 'sleep_hours'>; label: string; low: string; high: string }[] = [
  { name: 'sleep_quality', label: 'How well did you sleep?', low: 'Badly', high: 'Really well' },
  { name: 'energy', label: 'How is your energy?', low: 'Flat', high: 'Full of it' },
  { name: 'soreness', label: 'How sore are your muscles?', low: 'Not at all', high: 'Very' },
  { name: 'stress', label: 'How stressed do you feel?', low: 'Calm', high: 'Very' },
  { name: 'mood', label: 'How is your mood?', low: 'Low', high: 'Great' },
];

/** The 20-second daily check-in that stands in for a wearable. Works without JavaScript. */
export function CheckinForm({ today }: { today: Checkin | null }) {
  return (
    <form action={saveCheckin} className="space-y-4">
      <label className="grid gap-1 text-sm"><span className="font-bold">Hours of sleep last night</span>
        <input name="sleep_hours" type="number" inputMode="decimal" min={0} max={14} step={0.5} required defaultValue={today?.sleep_hours ?? ''} placeholder="e.g. 7.5" className="min-h-[44px] w-32 border border-stone bg-bg px-3 text-base" /></label>
      <div className="grid gap-4 md:grid-cols-2">
        {SCALES.map((s) => (
          <fieldset key={s.name}>
            <legend className="text-sm font-bold">{s.label}</legend>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer border border-stone py-2 text-center text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:font-bold has-[:checked]:text-bg">
                  <input type="radio" name={s.name} value={n} required defaultChecked={(today?.[s.name] ?? 3) === n} className="sr-only" />{n}
                </label>
              ))}
            </div>
            <p className="mt-1 flex justify-between text-[11px] text-muted"><span>{s.low}</span><span>{s.high}</span></p>
          </fieldset>
        ))}
      </div>
      <button className={buttonClass('solid')}>{today ? 'Update today’s check-in' : 'Save my check-in'}</button>
    </form>
  );
}
