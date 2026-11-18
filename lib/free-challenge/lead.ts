import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';
import { CHALLENGE_COOKIE } from './days';

export type Lead = { first_name: string; started_on: string; days_done: number[]; today: string };

/** The visitor's challenge, from the private id kept in their browser. Null if they have not started. */
export async function currentLead(): Promise<{ id: string; lead: Lead } | null> {
  const id = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc('challenge_lead', { p_id: id }).maybeSingle();
  return data ? { id, lead: data as Lead } : null;
}
