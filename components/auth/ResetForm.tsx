'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { updatePassword, type AuthState } from '@/app/sign-in/actions';

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field id="password" name="password" type="password" label="New password" autoComplete="new-password" required minLength={10} />
      <button disabled={pending} className={buttonClass('primary', true)}>{pending ? 'Saving…' : 'Save password'}</button>
    </form>
  );
}
