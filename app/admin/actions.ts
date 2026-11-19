'use server';

// Every action uses the signed-in user's Supabase client, so the database's RLS
// policies decide what is allowed (admins cannot grant admin; only super admins can).

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/billing/stripe';

const ROLE = z.enum(['instructor', 'moderator', 'studio_manager', 'virtual_assistant', 'admin', 'super_admin']);
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

/**
 * A studio membership has ended, so the member's half-price Inner Circle or Black membership must not
 * simply carry on, and must never jump to the standard price by itself. It is set to finish at the end
 * of the period already paid for; the member can choose a standard-price plan before or after that.
 * Returns false if a membership could not be updated in Stripe (staff are told to check it).
 */
async function finishStudioPricedMemberships(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: subs } = await admin.from('subscriptions')
    .select('stripe_subscription_id, cancel_at_period_end, prices(audience)')
    .eq('user_id', userId).in('status', ['trialing', 'active', 'past_due']);
  const mine = (subs ?? []).filter((s) => (s.prices as unknown as { audience?: string } | null)?.audience === 'studio' && !s.cancel_at_period_end);
  if (!mine.length) return true;
  try {
    const stripe = await getStripe();
    for (const s of mine) {
      await stripe.subscriptions.update(s.stripe_subscription_id as string, {
        cancel_at_period_end: true,
        metadata: { bayse_end_reason: 'studio_membership_ended' },
      });
    }
    return true;
  } catch (e) {
    console.error('[studio] could not set studio-priced membership to finish:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function setLinkStatus(form: FormData) {
  const id = uuid.safeParse(form.get('link_id'));
  const status = z.enum(['verified', 'rejected', 'ended']).safeParse(form.get('status'));
  const back = String(form.get('back') ?? '/admin/studio-links');
  const safeBack = back === '/studio' ? '/studio' : '/admin/studio-links';
  if (!id.success || !status.success) redirect(`${safeBack}?error=invalid`);
  const supabase = await client();
  // RLS decides: only an admin, or the manager of that studio, changes a row here.
  const { data: changed, error } = await supabase.from('studio_memberships').update({ status: status.data }).eq('id', id.data).select('user_id');
  const userId = changed?.[0]?.user_id as string | undefined;
  let ok: string = status.data;
  if (!error && userId && status.data === 'ended' && !(await finishStudioPricedMemberships(userId))) ok = 'ended_check_billing';
  revalidatePath(safeBack);
  redirect(`${safeBack}?${error || !userId ? 'error=denied' : `ok=${ok}`}`);
}

/** "Still a member": the studio has re-checked an already verified link. Good for another 90 days. */
export async function reconfirmLink(form: FormData) {
  const id = uuid.safeParse(form.get('link_id'));
  const back = String(form.get('back') ?? '/admin/studio-links');
  const safeBack = back === '/studio' ? '/studio' : '/admin/studio-links';
  if (!id.success) redirect(`${safeBack}?error=invalid`);
  const supabase = await client();
  const until = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const { error, count } = await supabase.from('studio_memberships').update({ verified_until: until }, { count: 'exact' }).eq('id', id.data).eq('status', 'verified');
  revalidatePath(safeBack);
  redirect(`${safeBack}?${error || !count ? 'error=denied' : 'ok=reconfirmed'}`);
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
