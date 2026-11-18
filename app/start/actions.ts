'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { STEPS, nextStepId, validateAnswer, PERSONALISE_PATH } from '@/lib/onboarding/steps';
import { getStripe } from '@/lib/billing/stripe';
import { publicEnv } from '@/lib/env';
import { isUuid } from '@/lib/billing/stripe-map';
import { hasAccount } from '@/lib/auth/account';

const CONSENT_VERSION = 'v1-2026-11';
const TERMS_VERSION = 'terms-v1-2026-11';

export type StepState = { error?: string } | undefined;

async function siteUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : publicEnv.siteUrl;
}

async function requireSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/start/welcome?expired=1');
  return { supabase, user };
}

async function markStep(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, stepId: string) {
  await supabase.from('onboarding_answers').upsert({ user_id: userId, current_step: stepId }, { onConflict: 'user_id' });
}

/** Step 1: start a private, anonymous session so answers are saved from the first screen. */
export async function startOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) redirect('/start/welcome?error=anon');
  }
  redirect('/start/name');
}

/** Generic save for single, multi and number questions. */
export async function saveQuestion(stepId: string, _prev: StepState, form: FormData): Promise<StepState> {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step || !step.field || !step.table) return { error: 'Unknown question.' };
  const { supabase, user } = await requireSession();

  const raw = step.kind === 'multi' ? form.getAll('value').map(String) : form.get('value');
  const skip = form.get('skip') === '1';
  const result = skip && step.optional ? { ok: true as const, value: step.kind === 'multi' ? [] : null } : validateAnswer(step, raw);
  if (!result.ok) return { error: result.error };

  const { error } = await supabase.from(step.table).upsert({ user_id: user.id, [step.field]: result.value }, { onConflict: 'user_id' });
  if (error) return { error: 'We could not save that. Please try again.' };
  if (step.later) redirect(`${PERSONALISE_PATH}?saved=${step.id}`);
  const next = nextStepId(stepId)!;
  await markStep(supabase, user.id, next);
  redirect(`/start/${next}`);
}

const NameSchema = z.object({
  first_name: z.string().trim().min(1, 'Please add your first name.').max(60),
  display_name: z.string().trim().min(2, 'Display names need at least 2 characters.').max(40).regex(/^[\p{L}\p{N} .'_-]+$/u, 'Letters, numbers and spaces only.'),
  adult: z.literal('on', { errorMap: () => ({ message: 'BAYSE community features are for adults (18+).' }) }),
});

export async function saveName(_prev: StepState, form: FormData): Promise<StepState> {
  const parsed = NameSchema.safeParse({ first_name: form.get('first_name'), display_name: form.get('display_name'), adult: form.get('adult') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { supabase, user } = await requireSession();
  const { error } = await supabase.from('profiles').update({
    first_name: parsed.data.first_name, display_name: parsed.data.display_name, adult_confirmed: true,
  }).eq('id', user.id);
  if (error) return { error: 'We could not save that. Please try again.' };
  await markStep(supabase, user.id, 'goals');
  redirect('/start/goals');
}

const list = (v: FormDataEntryValue | null) =>
  String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20).map((s) => s.slice(0, 40));

export async function saveDietary(_prev: StepState, form: FormData): Promise<StepState> {
  const { supabase, user } = await requireSession();
  if (form.get('skip') !== '1') {
    const household = form.get('household_size') ? Number(form.get('household_size')) : null;
    const prefs = {
      user_id: user.id,
      dietary_pattern: String(form.get('dietary_pattern') ?? '').slice(0, 40) || null,
      foods_to_avoid: list(form.get('foods_to_avoid')),
      budget: ['tight', 'moderate', 'flexible'].includes(String(form.get('budget'))) ? String(form.get('budget')) : null,
      household_size: household && Number.isInteger(household) && household >= 1 && household <= 12 ? household : null,
      cooking_time: ['15', '30', '45', '60+'].includes(String(form.get('cooking_time'))) ? String(form.get('cooking_time')) : null,
    };
    const { error } = await supabase.from('nutrition_preferences').upsert(prefs, { onConflict: 'user_id' });
    if (error) return { error: 'We could not save that. Please try again.' };

    const allergies = list(form.get('allergies'));
    const intolerances = list(form.get('intolerances'));
    if (allergies.length || intolerances.length) {
      if (form.get('dietary_consent') !== 'on') return { error: 'To save allergies or intolerances, please tick the box to give your permission. Or leave those fields empty.' };
      const c = await supabase.from('consent_records').insert({ user_id: user.id, purpose: 'dietary_needs', version: CONSENT_VERSION, granted: true });
      if (c.error) return { error: 'We could not record your permission. Please try again.' };
      const d = await supabase.from('dietary_needs').upsert({ user_id: user.id, allergies, intolerances }, { onConflict: 'user_id' });
      if (d.error) return { error: 'We could not save that. Please try again.' };
    }
  }
  redirect(`${PERSONALISE_PATH}?saved=dietary`);
}

export async function saveWellness(_prev: StepState, form: FormData): Promise<StepState> {
  const step = STEPS.find((s) => s.id === 'wellness')!;
  const { supabase, user } = await requireSession();
  if (form.get('skip') !== '1') {
    const result = validateAnswer(step, form.getAll('value').map(String));
    if (!result.ok) return { error: result.error };
    const interests = result.value as string[];
    if (interests.length) {
      if (form.get('wellness_consent') !== 'on') return { error: 'Please tick the box to give your permission, or choose “Prefer not to answer”.' };
      const c = await supabase.from('consent_records').insert({ user_id: user.id, purpose: 'wellness_data', version: CONSENT_VERSION, granted: true });
      if (c.error) return { error: 'We could not record your permission. Please try again.' };
      const w = await supabase.from('wellness_preferences').upsert({ user_id: user.id, interests }, { onConflict: 'user_id' });
      if (w.error) return { error: 'We could not save that. Please try again.' };
    }
  }
  redirect(`${PERSONALISE_PATH}?saved=wellness`);
}

export async function acceptProgramme(form: FormData) {
  const { supabase, user } = await requireSession();
  const recId = String(form.get('recommendation_id') ?? '');
  if (isUuid(recId)) {
    await supabase.from('programme_recommendations').update({ accepted_at: new Date().toISOString() }).eq('id', recId).eq('user_id', user.id);
  }
  await markStep(supabase, user.id, 'health');
  const { data: done } = await supabase.rpc('has_health_declaration');
  redirect(done ? (hasAccount(user) ? '/start/membership' : '/start/account') : '/start/health');
}

const AccountSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
  password: z.string().min(10, 'Use at least 10 characters.').max(128),
});

/** Turns the anonymous session into a real account, keeping every answer already saved. */
export async function createAccount(_prev: StepState, form: FormData): Promise<StepState> {
  const parsed = AccountSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (form.get('terms') !== 'on') return { error: 'Please agree to the terms and privacy notice.' };
  const { supabase, user } = await requireSession();
  if (hasAccount(user)) redirect('/start/membership');
  const base = await siteUrl();
  const opts = { emailRedirectTo: `${base}/auth/callback?next=/start/membership` };
  // Supabase links an email to an onboarding session first, then accepts a password.
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email }, opts);
  if (!error) {
    const pw = await supabase.auth.updateUser({ password: parsed.data.password });
    if (pw.error) console.warn('[account] password not set yet (they can set it from Forgot password):', pw.error.message);
  }
  if (error) {
    console.warn('[account] create failed:', error.message);
    if (/already/i.test(error.message)) return { error: 'That email already has a BAYSE account. Sign in instead, and your new answers will be kept on this device until you do.' };
    if (/rate limit/i.test(error.message)) return { error: 'Too many sign-ups in a short time. Please wait a minute and try again.' };
    return { error: 'We could not create your account. Please check your details and try again.' };
  }
  // Keep a dated record of the terms version accepted at sign-up.
  await supabase.from('consent_records').insert({ user_id: user.id, purpose: 'terms', version: TERMS_VERSION, granted: true });
  if (form.get('marketing') === 'on') {
    await supabase.from('consent_records').insert({ user_id: user.id, purpose: 'marketing_email', version: CONSENT_VERSION, granted: true });
  }
  await markStep(supabase, user.id, 'membership');
  redirect('/start/membership?check_email=1');
}

/** Starts Stripe Checkout (test mode until launch) for the chosen price. */
export async function startCheckout(form: FormData) {
  const { supabase, user } = await requireSession();
  if (!hasAccount(user)) redirect('/start/account');
  const priceId = String(form.get('price_id') ?? '');
  if (!isUuid(priceId)) redirect('/start/membership?error=price');

  const { data: price } = await supabase.from('prices').select('id, stripe_price_id, trial_days, plan_id').eq('id', priceId).eq('active', true).maybeSingle();
  if (!price?.stripe_price_id) redirect('/start/membership?error=not_connected');

  const admin = createAdminClient();
  const { data: existing } = await admin.from('stripe_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
  const { data: active } = await admin.from('subscriptions').select('id').eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due']).limit(1);
  if (active?.length) redirect('/you/membership?already=1');

  let url: string | null = null;
  try {
    const stripe = await getStripe();
    const base = await siteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price.stripe_price_id, quantity: 1 }],
      client_reference_id: user.id,
      ...(existing ? { customer: existing.stripe_customer_id } : { customer_email: user.email ?? undefined }),
      subscription_data: {
        ...(price.trial_days > 0 ? { trial_period_days: price.trial_days } : {}),
        metadata: { bayse_user_id: user.id },
      },
      metadata: { bayse_user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${base}/start/done?checkout=success`,
      cancel_url: `${base}/start/membership?checkout=cancelled`,
    });
    url = session.url;
  } catch (e) {
    console.error('[checkout] failed', e instanceof Error ? e.message : e);
    redirect('/start/membership?error=checkout');
  }
  redirect(url ?? '/start/membership?error=checkout');
}

export async function finishOnboarding() {
  const { supabase, user } = await requireSession();
  await supabase.from('onboarding_answers').upsert({ user_id: user.id, current_step: 'done', completed_at: new Date().toISOString() }, { onConflict: 'user_id' });
  const { error } = await supabase.from('profiles').update({ onboarding_completed_at: new Date().toISOString() }).eq('id', user.id);
  if (error) console.error('[onboarding] could not stamp completion:', error.message);
  redirect('/today?welcome=1');
}
