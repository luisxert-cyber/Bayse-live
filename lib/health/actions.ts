'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { PARQ, PARQ_VERSION, AGREEMENT_VERSION, anyYes, type ParqAnswers } from './parq';

type State = { error?: string } | undefined;

async function save(form: FormData): Promise<{ error?: string; userId?: string; isAccount?: boolean }> {
  const answers: ParqAnswers = {};
  for (const q of PARQ) {
    const v = form.get(`q_${q.id}`);
    if (v !== 'yes' && v !== 'no') return { error: 'Please answer every health question.' };
    answers[q.id] = v === 'yes';
  }
  const yes = anyYes(answers);
  if (yes && form.get('clearance') !== 'on') return { error: 'Please confirm you will get medical advice before exercising.' };
  if (form.get('consent') !== 'on') return { error: 'Please agree to BAYSE keeping your health check answers.' };
  if (form.get('agree') !== 'on') return { error: 'Please agree to the health and safety agreement.' };
  const name = String(form.get('signed_name') ?? '').trim().slice(0, 100);
  if (name.length < 2) return { error: 'Please type your full name to sign.' };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Your session has expired. Please start again.' };
  const { error: cErr } = await supabase.from('consent_records').insert({ user_id: user.id, purpose: 'health_screening', version: PARQ_VERSION, granted: true });
  if (cErr) return { error: 'We could not save that. Please try again.' };
  const { error } = await supabase.from('health_declarations').insert({
    user_id: user.id, parq_version: PARQ_VERSION, answers, any_yes: yes, clearance_confirmed: yes, agreement_version: AGREEMENT_VERSION, signed_name: name,
  });
  if (error) { console.error('[health] save failed', error.message); return { error: 'We could not save that. Please try again.' }; }
  return { userId: user.id, isAccount: hasAccount(user) };
}

/** During sign-up (step "health"). */
export async function saveHealthOnboarding(_prev: State, form: FormData): Promise<State> {
  const r = await save(form);
  if (r.error) return { error: r.error };
  const supabase = await createClient();
  await supabase.from('onboarding_answers').upsert({ user_id: r.userId, current_step: 'account' }, { onConflict: 'user_id' });
  redirect(r.isAccount ? '/join' : '/start/account');
}

/** From My BAYSE, or when a class asks for it first. */
export async function saveHealthMember(_prev: State, form: FormData): Promise<State> {
  const r = await save(form);
  if (r.error) return { error: r.error };
  redirect(safeNext(String(form.get('next') ?? ''), '/you/health?saved=1'));
}
