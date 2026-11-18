'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/billing/stripe';

export type YouState = { error?: string; ok?: string } | undefined;

async function me() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/you');
  return { supabase, user };
}

const ProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  display_name: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N} .'_-]+$/u),
});

export async function updateProfile(_prev: YouState, form: FormData): Promise<YouState> {
  const parsed = ProfileSchema.safeParse({ first_name: form.get('first_name'), display_name: form.get('display_name') });
  if (!parsed.success) return { error: 'Please check your name and display name (letters, numbers and spaces).' };
  const { supabase, user } = await me();
  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id);
  if (error) return { error: 'We could not save your changes.' };
  revalidatePath('/you');
  return { ok: 'Saved.' };
}

/** Opens Stripe's customer portal: update card, see invoices, cancel. Cancelling is never blocked. */
export async function openBillingPortal() {
  const { user } = await me();
  const { data: c } = await createAdminClient().from('stripe_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
  if (!c) redirect('/you/membership?error=no_customer');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  let url: string | null = null;
  try {
    const session = await (await getStripe()).billingPortal.sessions.create({
      customer: c.stripe_customer_id,
      return_url: `${h.get('x-forwarded-proto') ?? 'https'}://${host}/you/membership`,
    });
    url = session.url;
  } catch (e) {
    console.error('[portal] failed', e instanceof Error ? e.message : e);
  }
  redirect(url ?? '/you/membership?error=portal');
}

const Purpose = z.enum(['wellness_data', 'dietary_needs', 'marketing_email', 'celebrations', 'share_wellness_with_coach']);

/** Withdrawing consent is a new record; the database then deletes the data it covered. */
export async function withdrawConsent(form: FormData) {
  const purpose = Purpose.safeParse(form.get('purpose'));
  if (!purpose.success) redirect('/you/privacy');
  const { supabase, user } = await me();
  await supabase.from('consent_records').insert({ user_id: user.id, purpose: purpose.data, version: 'v1-2026-11', granted: false });
  revalidatePath('/you/privacy');
  redirect('/you/privacy?withdrawn=1');
}

/** Permanently deletes the account and everything linked to it (cascades). Stripe subscriptions are cancelled first. */
export async function deleteAccount(_prev: YouState, form: FormData): Promise<YouState> {
  if (String(form.get('confirm') ?? '').trim().toUpperCase() !== 'DELETE') return { error: 'Type DELETE to confirm.' };
  const { supabase, user } = await me();
  const admin = createAdminClient();
  const { data: subs } = await admin.from('subscriptions').select('stripe_subscription_id').eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due', 'unpaid', 'paused']);
  if (subs?.length) {
    try {
      const stripe = await getStripe();
      for (const s of subs) await stripe.subscriptions.cancel(s.stripe_subscription_id);
    } catch (e) {
      console.error('[delete] stripe cancel failed', e instanceof Error ? e.message : e);
      return { error: 'We could not cancel your subscription automatically, so nothing was deleted. Please contact us and we will do it for you.' };
    }
  }
  await admin.from('audit_log').insert({ actor_id: user.id, action: 'delete', entity: 'account', entity_id: user.id, detail: {} });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: 'We could not delete your account. Please contact us.' };
  await supabase.auth.signOut();
  redirect('/?deleted=1');
}
