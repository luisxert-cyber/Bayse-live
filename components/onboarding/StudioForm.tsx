'use client';
import { useActionState, useState } from 'react';
import type { Studio } from '@/lib/types';
import { Field } from '@/components/ui/Field';
import { Choice } from '@/components/ui/Choice';
import { FormError } from './FormError';
import { SubmitBar } from './SubmitBar';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

export function StudioForm({ action, studios, current }: { action: Action; studios: Studio[]; current: { studio_id: string; tier: string; member_ref: string | null; status: string } | null }) {
  const [state, formAction] = useActionState(action, undefined);
  const [studio, setStudio] = useState(current?.studio_id ?? '');
  const isMember = studio && studio !== 'none';
  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Your BAYSE studio</span>
        <select name="studio_id" value={studio} onChange={(e) => setStudio(e.target.value)} className="block min-h-tap w-full rounded-2xl border border-stone bg-surface px-4 text-base">
          <option value="">Choose a studio</option>
          {studios.map((s) => <option key={s.id} value={s.id}>{s.name}{s.status === 'opening' ? ' (opening soon)' : ''}</option>)}
          <option value="none">I train online only</option>
        </select>
      </label>
      {isMember && (
        <>
          <fieldset className="space-y-3">
            <legend className="mb-1.5 text-sm font-medium">Your studio membership</legend>
            <Choice name="tier" value="studio_148" label="£148 membership" type="radio" defaultChecked={current?.tier === 'studio_148'} />
            <Choice name="tier" value="studio_99" label="£99 membership" type="radio" defaultChecked={current?.tier === 'studio_99'} />
            <Choice name="tier" value="other" label="Another membership or class pack" type="radio" defaultChecked={!current || current.tier === 'other'} />
          </fieldset>
          <Field id="member_ref" name="member_ref" label="Name or email on your studio booking account" hint="Optional. Helps your studio confirm it is you." defaultValue={current?.member_ref ?? ''} maxLength={80} />
          <p className="text-sm text-muted">{current?.status === 'verified' ? 'Your studio has confirmed your membership.' : 'Your studio will confirm your membership. Studio benefits switch on as soon as they do.'}</p>
        </>
      )}
      <SubmitBar skippable skipLabel="Skip for now" />
    </form>
  );
}
