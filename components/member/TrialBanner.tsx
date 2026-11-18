import Link from 'next/link';
import type { BillingState } from '@/lib/billing/trial';
import { trialLeftLabel } from '@/lib/billing/trial-math';

/**
 * Sits at the top of the member app.
 * - On the free trial: a quiet line with the days left.
 * - Account but no membership: one tap to the payment screen to start the trial (or come back).
 * - Members (paid, studio-linked or given access by BAYSE): nothing.
 */
export function TrialBanner({ billing }: { billing: BillingState }) {
  const { trial, subscribed, hadMembership, hasOtherAccess } = billing;

  if (trial.active) {
    return (
      <Link href="/you/membership" className="flex items-center justify-between gap-3 border-b border-stone px-4 py-2.5 text-sm hover:bg-stone/30">
        <span><span className="font-bold">Free trial</span> <span className="text-muted">· {trialLeftLabel(trial)}</span></span>
        <span className="text-muted underline">Membership</span>
      </Link>
    );
  }
  if (subscribed || hasOtherAccess) return null;
  return (
    <div className="ink-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4">
      <span>
        <span className="block font-bold uppercase">{hadMembership ? 'Your membership has ended' : 'Start your 7-day free trial'}</span>
        <span className="mt-0.5 block text-sm text-muted">{hadMembership ? 'Choose a membership to get your classes, plan and community back.' : 'Add your card to unlock everything. Nothing is taken for 7 days.'}</span>
      </span>
      <Link href="/join" className="inline-flex min-h-[44px] items-center border-[1.5px] border-ink bg-ink px-5 text-[14px] font-bold uppercase text-bg hover:opacity-90">{hadMembership ? 'Continue' : 'Start free trial'}</Link>
    </div>
  );
}
