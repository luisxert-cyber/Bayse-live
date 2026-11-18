'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

export async function createOffer(f: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from('reward_offers').insert({
    title: s(f, 'title', 80), description: s(f, 'description', 500), partner: s(f, 'partner', 80) || null,
    min_classes: Math.max(1, Math.min(1000, Number(f.get('min_classes')) || 10)),
    max_claims: Math.max(1, Math.min(100000, Number(f.get('max_claims')) || 50)),
    code: s(f, 'code', 80) || null, how_to_use: s(f, 'how_to_use', 300) || null,
    ends_at: f.get('ends_at') ? new Date(String(f.get('ends_at'))).toISOString() : null, active: false,
  });
  revalidatePath('/admin/rewards');
}
export async function setActive(f: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from('reward_offers').update({ active: f.get('active') === '1' }).eq('id', String(f.get('id')));
  revalidatePath('/admin/rewards');
}
