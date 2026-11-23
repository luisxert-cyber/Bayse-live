'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function saveMaxDevices(f: FormData) {
  await requireStaff('overview');
  const n = Math.max(1, Math.min(10, Math.round(Number(f.get('max_devices')) || 2)));
  const supabase = await createClient();
  await supabase.from('site_settings').update({ max_devices: n, updated_at: new Date().toISOString() }).eq('id', true);
  revalidatePath('/admin');
  redirect('/admin?devices=saved#sharing');
}

/** A cancellation the payment system could not apply: an admin has now cancelled it in Stripe and ticks it off. */
export async function markCancellationDone(form: FormData) {
  await requireStaff('members');
  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(id)) redirect('/admin?error=invalid');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('cancellation_requests').update({ status: 'done', done_by: user?.id ?? null, done_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/admin');
  redirect('/admin?cancelled=1#cancellations');
}
