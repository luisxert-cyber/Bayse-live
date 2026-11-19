'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ukToday } from '@/lib/daily/day';

/** Claim a reward. The database checks the member qualifies and that places are left. */
export async function claimReward(f: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('claim_reward', { p_offer: String(f.get('offer_id') ?? '') });
  if (error) redirect(`/you/progress?e=${encodeURIComponent(error.message.length < 120 ? error.message : 'Could not claim that reward.')}`);
  void data;
  redirect('/you/progress?claimed=1');
}

/** Saves today's check-in (one per day; saving again replaces it). The database only lets a member write their own. */
export async function saveCheckin(f: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/you/progress');
  const scale = (k: string) => { const n = Math.round(Number(f.get(k))); return n >= 1 && n <= 5 ? n : null; };
  const hours = Number(String(f.get('sleep_hours') ?? '').replace(',', '.'));
  const row = { sleep_quality: scale('sleep_quality'), energy: scale('energy'), soreness: scale('soreness'), stress: scale('stress'), mood: scale('mood') };
  if (!Number.isFinite(hours) || hours < 0 || hours > 14 || Object.values(row).some((v) => v === null)) redirect('/you/progress?e=Please%20answer%20every%20question.');
  const { error } = await supabase.from('daily_checkins').upsert({ user_id: user.id, day: ukToday(), sleep_hours: Math.round(hours * 2) / 2, ...row });
  if (error) redirect('/you/progress?e=Sorry%2C%20that%20did%20not%20save.%20Please%20try%20again.');
  redirect('/you/progress?checked=1');
}
