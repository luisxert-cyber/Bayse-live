'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireInstructor } from '@/lib/auth/session';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);
const uuid = z.string().uuid();
const back = (f: FormData, fallback: string) => {
  const b = String(f.get('back') ?? '');
  return /^\/(teach|admin)(\/[a-z0-9/-]*)?$/.test(b) ? b : fallback;
};
const err = (e: { message: string } | null) => (e ? encodeURIComponent(e.message.replace(/^.*?:\s*/, '').slice(0, 120)) : '');

// Photos: RLS decides (own profile, or admin). Paths must sit in that instructor's folder.
export async function savePhotos(instructorId: string, photos: string[]) {
  await requireInstructor();
  if (!uuid.safeParse(instructorId).success) return { error: 'Invalid profile.' };
  const clean = photos.filter((p) => p.startsWith(`${instructorId}/`) && /^[0-9a-f-]+\/[0-9a-f-]+\.(jpg|png|webp)$/.test(p)).slice(0, 6);
  const supabase = await createClient();
  const { error, count } = await supabase.from('instructors').update({ photos: clean }, { count: 'exact' }).eq('id', instructorId);
  revalidatePath('/teach/profile');
  return error || !count ? { error: 'Could not save photos.' } : { ok: true };
}

export async function saveProfile(f: FormData) {
  const { me } = await requireInstructor();
  if (!me) redirect('/admin/staff');
  const list = (k: string) => f.getAll(k).map(String).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const submit = f.get('submit') === 'review';
  const supabase = await createClient();
  const { error } = await supabase.from('instructors').update({
    display_name: s(f, 'display_name', 60) || me.display_name,
    headline: s(f, 'headline', 120) || null,
    bio: s(f, 'bio', 1500) || null,
    specialities: list('specialities'),
    studios: list('studios'),
    offers_private: f.get('offers_private') === 'on',
    status: submit || me.status === 'published' ? 'pending' : me.status,
  }).eq('id', me.id);
  const zoom = s(f, 'zoom_url', 300);
  if (!error) {
    const { error: zErr } = await supabase.from('instructor_private').upsert({ instructor_id: me.id, zoom_url: zoom || null });
    if (zErr) redirect('/teach/profile?error=zoom');
  }
  revalidatePath('/teach/profile');
  redirect(`/teach/profile?${error ? 'error=save' : submit ? 'ok=submitted' : 'ok=saved'}`);
}

export async function addAvailability(f: FormData) {
  const { me, isAdmin } = await requireInstructor();
  const instructorId = isAdmin && f.get('instructor_id') ? String(f.get('instructor_id')) : me?.id;
  const weekday = z.coerce.number().int().min(1).max(7).safeParse(f.get('weekday'));
  const start = z.string().regex(/^\d{2}:\d{2}$/).safeParse(f.get('start_time'));
  const end = z.string().regex(/^\d{2}:\d{2}$/).safeParse(f.get('end_time'));
  if (!instructorId || !weekday.success || !start.success || !end.success || end.data <= start.data) redirect(`${back(f, '/teach/availability')}?error=times`);
  const supabase = await createClient();
  const { error } = await supabase.from('instructor_availability').insert({ instructor_id: instructorId, weekday: weekday.data, start_time: start.data, end_time: end.data });
  revalidatePath('/teach/availability');
  redirect(`${back(f, '/teach/availability')}?${error ? 'error=save' : 'ok=added'}`);
}

export async function removeAvailability(f: FormData) {
  await requireInstructor();
  const supabase = await createClient();
  await supabase.from('instructor_availability').delete().eq('id', uuid.parse(f.get('id')));
  revalidatePath('/teach/availability');
  redirect(`${back(f, '/teach/availability')}?ok=removed`);
}

export async function respondSession(f: FormData) {
  await requireInstructor();
  const supabase = await createClient();
  const { error } = await supabase.rpc('respond_private_session', { p_id: uuid.parse(f.get('id')), p_accept: f.get('accept') === '1', p_note: s(f, 'note', 500) || null });
  revalidatePath('/teach');
  redirect(`${back(f, '/teach/sessions')}?${error ? `error=${err(error)}` : `ok=${f.get('accept') === '1' ? 'accepted' : 'declined'}`}`);
}

export async function cancelSessionAsStaff(f: FormData) {
  await requireInstructor();
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_private_session', { p_id: uuid.parse(f.get('id')), p_reason: s(f, 'reason', 300) || null });
  revalidatePath('/teach');
  redirect(`${back(f, '/teach/sessions')}?${error ? `error=${err(error)}` : 'ok=cancelled'}`);
}

export async function markSession(f: FormData) {
  await requireInstructor();
  const supabase = await createClient();
  const { error } = await supabase.rpc('mark_private_session', { p_id: uuid.parse(f.get('id')), p_status: z.enum(['completed', 'no_show']).parse(f.get('status')) });
  revalidatePath('/teach');
  redirect(`${back(f, '/teach/sessions')}?${error ? `error=${err(error)}` : 'ok=marked'}`);
}
