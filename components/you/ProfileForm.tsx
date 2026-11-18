'use client';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { updateProfile, type YouState } from '@/app/(member)/you/actions';

export function ProfileForm({ firstName, displayName }: { firstName: string; displayName: string }) {
  const [state, action, pending] = useActionState<YouState, FormData>(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field id="first_name" name="first_name" label="First name" defaultValue={firstName} required maxLength={60} />
      <Field id="display_name" name="display_name" label="Community display name" defaultValue={displayName} required minLength={2} maxLength={40} />
      <div className="flex items-center gap-3">
        <button disabled={pending} className={buttonClass('secondary')}>{pending ? 'Saving…' : 'Save'}</button>
        {state?.ok && <span role="status" className="text-sm text-sage">{state.ok}</span>}
        {state?.error && <span role="alert" className="text-sm text-clay">{state.error}</span>}
      </div>
    </form>
  );
}
