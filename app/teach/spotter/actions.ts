'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';

const EMOJI = ['👏', '💪', '🔥', '⭐', '❤️'];

/** Send a member a cheer for today's class. The database checks you teach the class and they joined it. */
export async function sendCheer(f: FormData) {
  await requireInstructor();
  const classId = String(f.get('class') ?? '');
  const userId = String(f.get('user') ?? '');
  const emoji = String(f.get('emoji') ?? '');
  const note = String(f.get('note') ?? '').trim().slice(0, 140);
  if (!isUuid(classId)) redirect('/teach/spotter');
  if (!isUuid(userId) || !EMOJI.includes(emoji)) redirect(`/teach/spotter/${classId}?error=1`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('send_shoutout', { p_class: classId, p_user: userId, p_emoji: emoji, p_note: note || null });
  if (error) console.error('[spotter] could not send cheer:', error.message);
  revalidatePath(`/teach/spotter/${classId}`);
  redirect(`/teach/spotter/${classId}?${!error && data === true ? 'sent=1' : 'error=1'}`);
}
