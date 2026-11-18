'use client';
import { useActionState } from 'react';
import { signIn } from '@/app/sign-in/actions';
import { Field } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui';

export function StaffSignIn() {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value="/admin" />
      <Field id="email" name="email" type="email" label="Staff email" autoComplete="username" required />
      <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
      {state?.error && <p role="alert" className="text-sm">{state.error}</p>}
      <button disabled={pending} className={buttonClass('solid', true)}>{pending ? 'Signing in…' : 'Sign in to the back office'}</button>
    </form>
  );
}
