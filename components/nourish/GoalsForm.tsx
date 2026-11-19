import { buttonClass } from '@/components/ui';
import { GOALS, TRACKING, type Goal, type Tracking } from '@/lib/nourish/plan';
import { saveGoals } from '@/app/(member)/nourish/actions';

export type NourishSettings = { goals: Goal[]; tracking: Tracking; protein_target: number | null; calorie_target: number | null };

/** Asks what the member wants from their food, and how (or whether) they want to keep track. Works without JavaScript. */
export function GoalsForm({ settings, back }: { settings: NourishSettings | null; back: string }) {
  const tracking = settings?.tracking ?? 'none';
  return (
    <form action={saveGoals} className="space-y-5 border border-stone p-4">
      <input type="hidden" name="back" value={back} />
      <fieldset>
        <legend className="font-bold">What would you like from your food?</legend>
        <p className="mt-1 text-sm text-muted">Pick as many as you like. Your weekly plan leans towards them.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(GOALS) as Goal[]).map((g) => (
            <label key={g} className="cursor-pointer border border-stone px-3 py-2 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
              <input type="checkbox" name="goals" value={g} defaultChecked={settings?.goals.includes(g) ?? false} className="sr-only" />{GOALS[g].label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-bold">Would you like to keep track of what you eat?</legend>
        <p className="mt-1 text-sm text-muted">Completely up to you, and you can change it at any time.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(TRACKING) as Tracking[]).map((t) => (
            <label key={t} className="flex cursor-pointer items-start gap-3 border border-stone p-3 has-[:checked]:border-ink">
              <input type="radio" name="tracking" value={t} defaultChecked={tracking === t} className="mt-1 h-4 w-4 accent-ink" />
              <span><span className="block font-bold">{TRACKING[t].label}</span><span className="block text-sm text-muted">{TRACKING[t].about}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <details className="border border-stone p-3" open={Boolean(settings?.protein_target || settings?.calorie_target)}>
        <summary className="cursor-pointer text-sm font-bold">Add my own daily targets (optional)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Protein a day (g)</span>
            <input name="protein_target" type="number" inputMode="numeric" min={20} max={300} defaultValue={settings?.protein_target ?? ''} className="min-h-[44px] border border-stone bg-bg px-3 text-base" /></label>
          <label className="grid gap-1 text-sm"><span>Calories a day</span>
            <input name="calorie_target" type="number" inputMode="numeric" min={1200} max={6000} defaultValue={settings?.calorie_target ?? ''} className="min-h-[44px] border border-stone bg-bg px-3 text-base" /></label>
        </div>
        <p className="mt-2 text-xs text-muted">BAYSE never sets a calorie target for you. Only add numbers a doctor, dietitian or qualified coach has agreed with you, or leave them blank. Protein is used if you track protein or macros; calories only if you track calories and macros.</p>
      </details>
      <button className={buttonClass('solid')}>{settings ? 'Save' : 'Build my plan'}</button>
    </form>
  );
}
