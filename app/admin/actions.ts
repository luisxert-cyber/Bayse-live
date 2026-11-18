'use server';

// Every action uses the signed-in user's Supabase client, so the database's RLS
// policies decide what is allowed (admins cannot grant admin; only super admins can).

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ROLE = z.enum(['instructor', 'moderator', 'studio_manager', 'admin', 'super_admin']);
const uuid = z.string().uuid();

async function client() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/admin');
  return supabase;
}

export async function grantRole(form: FormData) {
  const userId = uuid.safeParse(form.get('user_id'));
  const role = ROLE.safeParse(form.get('role'));
  const studioRaw = String(form.get('studio_id') ?? '');
  if (!userId.success || !role.success) redirect('/admin/members?error=invalid');
  const studioId = studioRaw ? uuid.safeParse(studioRaw) : null;
  if (role.data === 'studio_manager' && !studioId?.success) redirect(`/admin/members/${userId.data}?error=studio`);
  const supabase = await client();
  const { error } = await supabase.from('user_roles').insert({ user_id: userId.data, role: role.data, studio_id: studioId?.success ? studioId.data : null });
  revalidatePath(`/admin/members/${userId.data}`);
  redirect(`/admin/members/${userId.data}?${error ? 'error=denied' : 'ok=granted'}`);
}

export async function revokeRole(form: FormData) {
  const id = uuid.safeParse(form.get('role_id'));
  const userId = uuid.safeParse(form.get('user_id'));
  if (!id.success || !userId.success) redirect('/admin/members?error=invalid');
  const supabase = await client();
  const { error, count } = await supabase.from('user_roles').delete({ count: 'exact' }).eq('id', id.data);
  revalidatePath(`/admin/members/${userId.data}`);
  redirect(`/admin/members/${userId.data}?${error || !count ? 'error=denied' : 'ok=revoked'}`);
}

export async function setLinkStatus(form: FormData) {
  const id = uuid.safeParse(form.get('link_id'));
  const status = z.enum(['verified', 'rejected', 'ended']).safeParse(form.get('status'));
  const back = String(form.get('back') ?? '/admin/studio-links');
  const safeBack = back === '/studio' ? '/studio' : '/admin/studio-links';
  if (!id.success || !status.success) redirect(`${safeBack}?error=invalid`);
  const supabase = await client();
  const { error, count } = await supabase.from('studio_memberships').update({ status: status.data }, { count: 'exact' }).eq('id', id.data);
  revalidatePath(safeBack);
  redirect(`${safeBack}?${error || !count ? 'error=denied' : `ok=${status.data}`}`);
}

export async function setFlag(form: FormData) {
  const key = z.string().regex(/^[a-z_]+$/).safeParse(form.get('key'));
  const enabled = form.get('enabled') === 'true';
  if (!key.success) redirect('/admin/flags?error=invalid');
  // Two flags control real-world effects; they need an explicit typed confirmation.
  if (enabled && ['live_billing', 'member_emails'].includes(key.data) && form.get('confirm') !== key.data) {
    redirect(`/admin/flags?error=confirm&key=${key.data}`);
  }
  const supabase = await client();
  const { error } = await supabase.from('feature_flags').update({ enabled }).eq('key', key.data);
  revalidatePath('/admin/flags');
  redirect(`/admin/flags?${error ? 'error=denied' : 'ok=1'}`);
}

export async function setStripePrice(form: FormData) {
  const id = uuid.safeParse(form.get('price_id'));
  const stripeId = z.string().regex(/^price_[A-Za-z0-9]+$/).or(z.literal('')).safeParse(String(form.get('stripe_price_id') ?? '').trim());
  if (!id.success || !stripeId.success) redirect('/admin/plans?error=invalid');
  const supabase = await client();
  const { error } = await supabase.from('prices').update({ stripe_price_id: stripeId.data || null }).eq('id', id.data);
  revalidatePath('/admin/plans');
  redirect(`/admin/plans?${error ? 'error=denied' : 'ok=1'}`);
}
