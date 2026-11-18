'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;
type Prefs = { dietary_pattern: string | null; foods_to_avoid: string[]; budget: string | null; household_size: number | null; cooking_time: string | null } | null;

const select = 'block min-h-tap w-full rounded-2xl border border-stone bg-surface px-4 text-base text-ink';

export function DietaryForm({ action, prefs, needs }: { action: Action; prefs: Prefs; needs: { allergies: string[]; intolerances: string[] } | null }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Way of eating</span>
        <select name="dietary_pattern" defaultValue={prefs?.dietary_pattern ?? ''} className={select}>
          <option value="">No particular pattern</option>
          <option>Vegetarian</option><option>Vegan</option><option>Pescatarian</option><option>Flexitarian</option><option>Halal</option><option>Kosher</option>
        </select>
      </label>
      <Field id="foods_to_avoid" name="foods_to_avoid" label="Foods you would rather avoid" hint="Separate with commas, for example: mushrooms, olives" defaultValue={prefs?.foods_to_avoid.join(', ') ?? ''} />
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Budget</span>
          <select name="budget" defaultValue={prefs?.budget ?? ''} className={select}>
            <option value="">Any</option><option value="tight">Tight</option><option value="moderate">Moderate</option><option value="flexible">Flexible</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Cooking for</span>
          <select name="household_size" defaultValue={prefs?.household_size?.toString() ?? ''} className={select}>
            <option value="">—</option>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Time</span>
          <select name="cooking_time" defaultValue={prefs?.cooking_time ?? ''} className={select}>
            <option value="">Any</option><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60+">60+ min</option>
          </select>
        </label>
      </div>

      <fieldset className="rounded-card border border-stone bg-surface p-4">
        <legend className="px-1 text-sm font-medium">Allergies and intolerances (private)</legend>
        <p className="mb-4 text-sm text-muted">This is health information. Only you can see it, and we only use it to filter recipes.</p>
        <div className="space-y-4">
          <Field id="allergies" name="allergies" label="Allergies" hint="For example: peanuts, shellfish" defaultValue={needs?.allergies.join(', ') ?? ''} />
          <Field id="intolerances" name="intolerances" label="Intolerances" hint="For example: lactose" defaultValue={needs?.intolerances.join(', ') ?? ''} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="dietary_consent" className="mt-0.5 h-5 w-5 accent-ink" />
            <span>I agree to BAYSE storing my allergies and intolerances to tailor recipes. I can delete them at any time.</span>
          </label>
        </div>
      </fieldset>
      <p className="text-xs text-muted">Recipes are general guidance, not medical advice. If you have a medical condition, check with a qualified professional.</p>
      <SubmitBar skippable />
    </form>
  );
}
