'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { deleteAccount, type YouState } from '@/app/(member)/you/actions';

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<YouState, FormData>(deleteAccount, undefined);
  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-muted">This permanently deletes your account, answers, wellness information and community content, and cancels any subscription. It cannot be undone.</p>
      <Field id="confirm" name="confirm" label="Type DELETE to confirm" autoComplete="off" error={state?.error} />
      <button disabled={pending} className={buttonClass('danger')}>{pending ? 'Deleting…' : 'Delete my account'}</button>
    </form>
  );
}
