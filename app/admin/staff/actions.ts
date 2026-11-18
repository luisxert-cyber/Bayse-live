'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { linkClient, siteOrigin } from '@/lib/supabase/link';

const ROLE = z.enum(['instructor', 'moderator', 'studio_manager', 'admin']);
const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

// Add a member of staff. The database grants the role (now, or when their account is created),
// then we email them a sign-in link that opens their back end.
export async function inviteStaff(f: FormData) {
  await requireStaff('staff');
  const email = z.string().trim().toLowerCase().email().safeParse(f.get('email'));
  const role = ROLE.safeParse(f.get('role'));
  if (!email.success || !role.success) redirect('/admin/staff?error=invalid');
  const supabase = await createClient();
  const { error } = await supabase.rpc('invite_staff', { p_email: email.data, p_role: role.data });
  if (error) redirect(`/admin/staff?error=${encodeURIComponent(error.message.includes('super admin') ? 'admin' : 'denied')}`);
  const next = role.data === 'instructor' ? '/teach/profile' : '/admin';
  const { error: mailError } = await linkClient().auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: true, emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  revalidatePath('/admin/staff');
  redirect(`/admin/staff?ok=${mailError ? 'added_no_email' : 'invited'}&email=${encodeURIComponent(email.data)}`);
}

export async function resendLink(f: FormData) {
  await requireStaff('staff');
  const email = z.string().trim().toLowerCase().email().safeParse(f.get('email'));
  if (!email.success) redirect('/admin/staff?error=invalid');
  const { error } = await linkClient().auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: true, emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/teach` },
  });
  redirect(`/admin/staff?ok=${error ? 'rate' : 'resent'}&email=${encodeURIComponent(email.data)}`);
}

export async function removeRole(f: FormData) {
  await requireStaff('staff');
  const userId = z.string().uuid().safeParse(f.get('user_id'));
  const role = ROLE.safeParse(f.get('role'));
  if (!userId.success || !role.success) redirect('/admin/staff?error=invalid');
  const supabase = await createClient();
  const { error, count } = await supabase.from('user_roles').delete({ count: 'exact' }).eq('user_id', userId.data).eq('role', role.data);
  if (role.data === 'instructor' && !error && count) await supabase.from('instructors').update({ active: false, status: 'hidden' }).eq('user_id', userId.data);
  revalidatePath('/admin/staff');
  redirect(`/admin/staff?${error || !count ? 'error=denied' : 'ok=removed'}`);
}

export async function cancelInvite(f: FormData) {
  await requireStaff('staff');
  const supabase = await createClient();
  await supabase.from('staff_invites').delete().eq('email', s(f, 'email', 200).toLowerCase()).is('accepted_at', null);
  revalidatePath('/admin/staff');
  redirect('/admin/staff?ok=cancelled');
}

// Admin edits an instructor: publish, hide, order, and any profile field.
export async function saveInstructor(f: FormData) {
  await requireStaff('staff');
  const id = z.string().uuid().parse(f.get('id'));
  const status = z.enum(['draft', 'pending', 'published', 'hidden']).parse(f.get('status'));
  const list = (k: string) => f.getAll(k).map(String).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const supabase = await createClient();
  const { error } = await supabase.from('instructors').update({
    display_name: s(f, 'display_name', 60),
    headline: s(f, 'headline', 120) || null,
    bio: s(f, 'bio', 1500) || null,
    specialities: list('specialities'),
    studios: list('studios'),
    offers_private: f.get('offers_private') === 'on',
    status,
    sort: Math.max(0, Math.min(999, Number(f.get('sort')) || 100)),
    active: f.get('active') === 'on',
  }).eq('id', id);
  revalidatePath('/admin/staff');
  revalidatePath('/instructors');
  redirect(`/admin/staff/${id}?${error ? 'error=save' : 'ok=saved'}`);
}

export async function setInstructorStatus(f: FormData) {
  await requireStaff('staff');
  const id = z.string().uuid().parse(f.get('id'));
  const status = z.enum(['draft', 'pending', 'published', 'hidden']).parse(f.get('status'));
  const supabase = await createClient();
  await supabase.from('instructors').update({ status }).eq('id', id);
  revalidatePath('/admin/staff');
  revalidatePath('/instructors');
  redirect(`/admin/staff?ok=${status}`);
}
