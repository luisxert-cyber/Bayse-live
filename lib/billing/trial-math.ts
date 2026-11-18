// Pure helpers for the 7-day free trial. No imports, so they can be unit-tested without a network.
// The trial is a Stripe trial: the member adds a card to start, nothing is taken for 7 days,
// then the membership they chose begins automatically unless they cancel first.

const DAY_MS = 24 * 60 * 60 * 1000;

export const TRIAL_DAYS = 7;

export type TrialInfo = {
  /** The trial is still running. */
  active: boolean;
  /** Whole days left, rounded up. 0 once it has ended. */
  daysLeft: number;
  endsAt: string | null;
};

/** Where a trial stands, from the subscription's status and trial end. */
export function trialInfo(status: string | null | undefined, trialEnd: string | null | undefined, now: number = Date.now()): TrialInfo {
  if (status !== 'trialing' || !trialEnd) return { active: false, daysLeft: 0, endsAt: null };
  const left = new Date(trialEnd).getTime() - now;
  if (!Number.isFinite(left) || left <= 0) return { active: false, daysLeft: 0, endsAt: trialEnd };
  return { active: true, daysLeft: Math.ceil(left / DAY_MS), endsAt: trialEnd };
}

/** "3 days left", "Ends today". */
export function trialLeftLabel(t: TrialInfo): string {
  if (!t.active) return 'Ended';
  return t.daysLeft <= 1 ? 'Ends today' : `${t.daysLeft} days left`;
}

/**
 * One free trial per account. A member who has never had a membership gets the price's trial days;
 * anyone coming back after cancelling pays from day one.
 */
export function trialDaysFor(hadMembershipBefore: boolean, priceTrialDays: number | null | undefined): number {
  if (hadMembershipBefore) return 0;
  const d = Number(priceTrialDays ?? 0);
  return Number.isInteger(d) && d > 0 ? d : 0;
}

/** When the first payment will be taken, in ms. null means today. */
export function firstPaymentAt(trialDays: number, now: number = Date.now()): number | null {
  return trialDays > 0 ? now + trialDays * DAY_MS : null;
}
