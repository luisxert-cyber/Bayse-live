import 'server-only';
import type { createClient } from '@/lib/supabase/server';
import { trialInfo, type TrialInfo } from '@/lib/billing/trial-math';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type BillingState = {
  /** The running trial, if the member is in one. */
  trial: TrialInfo;
  /** A Stripe membership that is running (on trial, active, or a payment being retried). */
  subscribed: boolean;
  /** Has had a membership before (any status), so the one free trial has been used. */
  hadMembership: boolean;
  /** Access that does not come from a paid membership: a studio link or access given by BAYSE. */
  hasOtherAccess: boolean;
};

/** Where this member stands: no membership yet, on trial, or a member. Used for the banner and the payment screen. */
export async function loadBilling(supabase: Supabase, userId: string): Promise<BillingState> {
  const [{ data: subs }, { data: ents }] = await Promise.all([
    supabase.from('subscriptions').select('status, trial_end').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('entitlements').select('source, ends_at').eq('user_id', userId).eq('entitlement_key', 'on_demand').neq('source', 'subscription'),
  ]);
  const rows = (subs ?? []) as { status: string; trial_end: string | null }[];
  const current = rows.find((s) => ['trialing', 'active', 'past_due'].includes(s.status)) ?? null;
  const now = Date.now();
  return {
    trial: trialInfo(current?.status, current?.trial_end, now),
    subscribed: Boolean(current),
    hadMembership: rows.length > 0,
    hasOtherAccess: (ents ?? []).some((e) => !e.ends_at || new Date(e.ends_at as string).getTime() > now),
  };
}
