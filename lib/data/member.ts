import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function loadMember(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: ents }, { data: subs }, { data: links }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('first_name, display_name, home_studio_id, onboarding_completed_at, studios:home_studio_id(name)').eq('id', userId).maybeSingle(),
    supabase.from('entitlements').select('entitlement_key, source, ends_at').eq('user_id', userId),
    supabase.from('subscriptions').select('status, trial_end, current_period_end, cancel_at_period_end, cancel_at, plans(name)').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('studio_memberships').select('status, tier, studios(name)'),
    supabase.from('user_roles').select('role, studio_id'),
  ]);
  return {
    profile: profile as unknown as null | { first_name: string | null; display_name: string | null; home_studio_id: string | null; onboarding_completed_at: string | null; studios: { name: string } | null },
    entitlements: new Set((ents ?? []).map((e) => e.entitlement_key as string)),
    subscription: ((subs ?? [])[0] ?? null) as unknown as null | { status: string; trial_end: string | null; current_period_end: string | null; cancel_at_period_end: boolean; cancel_at: string | null; plans: { name: string } | null },
    links: (links ?? []) as unknown as Array<{ status: string; tier: string; studios: { name: string } | null }>,
    roles: (roles ?? []) as Array<{ role: string; studio_id: string | null }>,
  };
}

export function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/London' }).format(now));
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export const fmtDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'Europe/London' }).format(new Date(iso));
