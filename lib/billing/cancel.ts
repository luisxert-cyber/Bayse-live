// When a membership ends after the member cancels, following the terms (section 4):
// - On a free trial: it ends when the trial ends and nothing is charged.
// - Paid: 28 days' notice from today. If the current paid period already covers the notice, it ends with
//   that period and no more is taken. Otherwise one final 28-day payment is taken at the next renewal
//   and the membership ends when that period finishes.
// Pure, so it can be unit-tested.
const DAY = 86_400_000;
export const NOTICE_DAYS = 28;
export const PERIOD_DAYS = 28;

export type CancelPlan = { endsAt: string; finalPayment: boolean; finalPaymentOn: string | null; trial: boolean };

export function cancelPlan(status: string, currentPeriodEnd: string | null, trialEnd: string | null, now: Date = new Date()): CancelPlan {
  if (status === 'trialing') {
    const end = trialEnd ?? currentPeriodEnd ?? now.toISOString();
    return { endsAt: end, finalPayment: false, finalPaymentOn: null, trial: true };
  }
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : now;
  const noticeEnds = now.getTime() + NOTICE_DAYS * DAY;
  // An hour's leeway, so cancelling minutes after a payment still counts as covered.
  if (periodEnd.getTime() + 3_600_000 >= noticeEnds) return { endsAt: periodEnd.toISOString(), finalPayment: false, finalPaymentOn: null, trial: false };
  return { endsAt: new Date(periodEnd.getTime() + PERIOD_DAYS * DAY).toISOString(), finalPayment: true, finalPaymentOn: periodEnd.toISOString(), trial: false };
}
