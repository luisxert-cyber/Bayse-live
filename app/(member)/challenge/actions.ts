'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';

/** Join this month's challenge. The database only allows it for plans that include challenges. */
export async function joinChallenge(f: FormData) {
  const id = String(f.get('id') ?? '');
  if (!isUuid(id)) redirect('/challenge');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/challenge');
  const { error } = await supabase.from('challenge_entries').upsert({ challenge_id: id, user_id: user.id }, { onConflict: 'challenge_id,user_id', ignoreDuplicates: true });
  if (error) console.error('[challenge] could not join:', error.message);
  revalidatePath('/challenge');
  redirect(error ? '/challenge?error=1' : '/challenge?joined=1');
}

export async function leaveChallenge(f: FormData) {
  const id = String(f.get('id') ?? '');
  if (!isUuid(id)) redirect('/challenge');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/challenge');
  await supabase.from('challenge_entries').delete().eq('challenge_id', id).eq('user_id', user.id);
  revalidatePath('/challenge');
  redirect('/challenge');
}
