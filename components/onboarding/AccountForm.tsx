'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

export function AccountForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" required />
      <Field id="password" name="password" type="password" label="Password" hint="At least 10 characters." autoComplete="new-password" required minLength={10} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 accent-ink" />
        <span>I agree to the <a href="/terms" className="underline">terms</a> and have read the <a href="/privacy" className="underline">privacy notice</a>.</span>
      </label>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="marketing" className="mt-0.5 h-5 w-5 accent-ink" />
        <span>Send me occasional BAYSE news and offers by email. Optional.</span>
      </label>
      <SubmitBar label="Create my account" />
    </form>
  );
}
