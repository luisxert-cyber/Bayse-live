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
