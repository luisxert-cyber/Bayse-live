'use client';
import { useActionState } from 'react';
import type { Step } from '@/lib/onboarding/steps';
import { Choice } from '@/components/ui/Choice';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

export function QuestionForm({ step, action, current }: { step: Step; action: Action; current: string | string[] | number | null }) {
  const [state, formAction] = useActionState(action, undefined);
  const selected = new Set(Array.isArray(current) ? current : current == null ? [] : [String(current)]);

  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state?.error} />
      {step.kind === 'number' ? (
        <fieldset>
          <legend className="sr-only">{step.title}</legend>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: (step.max ?? 7) - (step.min ?? 1) + 1 }, (_, i) => String((step.min ?? 1) + i)).map((n) => (
              <label key={n} className="cursor-pointer">
                <input type="radio" name="value" value={n} defaultChecked={selected.has(n) || (!selected.size && n === '3')} className="peer sr-only" />
                <span className="grid aspect-square place-items-center rounded-2xl border border-stone bg-surface font-serif text-xl transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">{n}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">sessions a week</p>
        </fieldset>
      ) : (
        <fieldset className="space-y-3">
          <legend className="sr-only">{step.title}</legend>
          {(step.options ?? []).map((o) => (
            <Choice key={o.id} name="value" value={o.id} label={o.label} hint={o.hint} type={step.kind === 'single' ? 'radio' : 'checkbox'} defaultChecked={selected.has(o.id)} />
          ))}
        </fieldset>
      )}
      <SubmitBar skippable={step.optional} />
    </form>
  );
}
