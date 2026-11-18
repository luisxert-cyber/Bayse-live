'use client';
import { useActionState, useState } from 'react';
import { PARQ, AGREEMENT, CLEARANCE_TEXT } from '@/lib/health/parq';

type Action = (prev: { error?: string } | undefined, form: FormData) => Promise<{ error?: string } | undefined>;

// The health check and agreement. Every question needs a yes or no; any yes asks for medical clearance.
export function HealthForm({ action, next, defaultName }: { action: Action; next?: string; defaultName?: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const yes = PARQ.some((q) => answers[q.id]);
  return (
    <form action={formAction} className="space-y-6" data-health-form>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && <p role="alert" className="border border-white p-3 text-sm">{state.error}</p>}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Health check</legend>
        {PARQ.map((q, i) => (
          <div key={q.id} className="border border-stone p-3">
            <p className="text-[15px]">{i + 1}. {q.q}</p>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label={q.q}>
              {[['no', 'No'], ['yes', 'Yes']].map(([v, l]) => (
                <label key={v} className="cursor-pointer">
                  <input type="radio" name={`q_${q.id}`} value={v} required className="peer sr-only" onChange={() => setAnswers((a) => ({ ...a, [q.id]: v === 'yes' }))} />
                  <span className="inline-flex min-h-[40px] min-w-[72px] items-center justify-center border border-stone px-4 text-sm font-bold peer-checked:border-white peer-checked:bg-white peer-checked:text-black peer-focus-visible:outline peer-focus-visible:outline-2">{l}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      {yes && (
        <div className="space-y-3 border-2 border-white p-4">
          <p className="font-bold">Please get advice before you start</p>
          <p className="text-sm text-muted">Because you answered yes, check with your GP, midwife or physiotherapist that Pilates is right for you, and tell your instructor before live classes or 1-to-1s. Start with Gentle classes and use the easier options.</p>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="clearance" required className="mt-0.5 h-5 w-5 shrink-0 accent-white" /><span>{CLEARANCE_TEXT}</span></label>
        </div>
      )}

      <section className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Health and safety agreement</p>
        <div className="max-h-72 space-y-3 overflow-y-auto border border-stone p-4 text-sm" tabIndex={0} aria-label="Health and safety agreement">
          {AGREEMENT.map((a, i) => <div key={a.title}><p className="font-bold">{i + 1}. {a.title}</p><p className="text-muted">{a.body}</p></div>)}
        </div>
      </section>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-white" /><span>I agree to BAYSE keeping my health check answers to help keep me safe. Only I and BAYSE’s admin team can see my answers. If I book a 1-to-1, my instructor is told only whether I have a health condition to discuss. Other members and advertisers never see any of it.</span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="agree" required className="mt-0.5 h-5 w-5 shrink-0 accent-white" /><span>I have read and agree to the health and safety agreement, and my answers are true.</span></label>
        <label className="grid gap-1 text-sm">Type your full name to sign
          <input name="signed_name" required minLength={2} maxLength={100} autoComplete="name" defaultValue={defaultName} className="w-full border border-stone bg-bg px-3 py-3 text-base" />
        </label>
      </div>
      <button disabled={pending} className="inline-flex min-h-[52px] w-full items-center justify-center bg-white px-6 text-[15px] font-bold uppercase text-black disabled:opacity-50">{pending ? 'Saving…' : 'Agree and continue'}</button>
    </form>
  );
}
