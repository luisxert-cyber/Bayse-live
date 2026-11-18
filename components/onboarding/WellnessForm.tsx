'use client';
import { useActionState } from 'react';
import type { Option } from '@/lib/onboarding/steps';
import { Choice } from '@/components/ui/Choice';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

export function WellnessForm({ action, options, current }: { action: Action; options: Option[]; current: string[] }) {
  const [state, formAction] = useActionState(action, undefined);
  const sel = new Set(current);
  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state?.error} />
      <fieldset className="space-y-3">
        <legend className="sr-only">Wellness interests</legend>
        {options.map((o) => <Choice key={o.id} name="value" value={o.id} label={o.label} type="checkbox" defaultChecked={sel.has(o.id)} />)}
      </fieldset>
      <label className="mt-4 flex items-start gap-3 rounded-card border border-stone bg-surface p-4 text-sm">
        <input type="checkbox" name="wellness_consent" defaultChecked={current.length > 0} className="mt-0.5 h-5 w-5 accent-ink" />
        <span>I agree to BAYSE storing these interests to suggest relevant education and sessions. They stay private to me: coaches and other members cannot see them unless I choose to share. I can withdraw at any time, which deletes them.</span>
      </label>
      <p className="text-xs text-muted">Educational content only. BAYSE does not diagnose or treat any condition.</p>
      <SubmitBar skippable skipLabel="Prefer not to answer" />
    </form>
  );
}
