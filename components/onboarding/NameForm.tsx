'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

export function NameForm({ action, firstName, displayName, adult }: { action: Action; firstName: string; displayName: string; adult: boolean }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />
      <Field id="first_name" name="first_name" label="First name" autoComplete="given-name" defaultValue={firstName} required maxLength={60} />
      <Field id="display_name" name="display_name" label="Community display name" hint="Shown to other members. You can use a nickname." defaultValue={displayName} required minLength={2} maxLength={40} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="adult" defaultChecked={adult} required className="mt-0.5 h-5 w-5 rounded border-stone accent-ink" />
        <span>I am 18 or over. <span className="text-muted">BAYSE community and clubs are for adults.</span></span>
      </label>
      <SubmitBar />
    </form>
  );
}
