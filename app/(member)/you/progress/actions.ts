'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Claim a reward. The database checks the member qualifies and that places are left. */
export async function claimReward(f: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('claim_reward', { p_offer: String(f.get('offer_id') ?? '') });
  if (error) redirect(`/you/progress?e=${encodeURIComponent(error.message.length < 120 ? error.message : 'Could not claim that reward.')}`);
  void data;
  redirect('/you/progress?claimed=1');
}
