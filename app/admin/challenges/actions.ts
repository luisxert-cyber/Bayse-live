'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

/** Create or change the challenge for one month (one challenge per month). */
export async function saveChallenge(f: FormData) {
  await requireAdmin();
  const month = s(f, 'month', 7); // YYYY-MM from the month picker
  const title = s(f, 'title', 80);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || title.length < 2) return;
  const supabase = await createClient();
  const { error } = await supabase.from('challenges').upsert({
    month: `${month}-01`, title, blurb: s(f, 'blurb', 300),
    target: Math.max(1, Math.min(60, Math.round(Number(f.get('target')) || 12))),
  }, { onConflict: 'month' });
  if (error) console.error('[admin] could not save challenge:', error.message);
  revalidatePath('/admin/challenges');
}
