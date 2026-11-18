'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';
import { CHALLENGE_COOKIE, CHALLENGE_DAYS } from '@/lib/free-challenge/days';

/** Start (or come back to) the free challenge: name, email and the health agreement. No account or password. */
export async function startChallenge(f: FormData) {
  const first = String(f.get('first_name') ?? '').trim().slice(0, 60);
  const email = String(f.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  if (!first || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect('/free-challenge?error=details#start');
  if (f.get('health') !== 'on') redirect('/free-challenge?error=health#start');
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc('challenge_signup', { p_email: email, p_first: first, p_marketing: f.get('marketing') === 'on' });
  if (error || !isUuid(id)) {
    if (error) console.error('[free-challenge] could not sign up:', error.message);
    redirect('/free-challenge?error=failed#start');
  }
  (await cookies()).set(CHALLENGE_COOKIE, id, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90 });
  redirect('/free-challenge');
}

/** Tick off a finished day. The database only accepts days that have opened. */
export async function markDay(day: number) {
  const n = Math.round(Number(day));
  if (!Number.isFinite(n) || n < 1 || n > CHALLENGE_DAYS) return;
  const id = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc('challenge_mark_day', { p_id: id, p_day: n });
  if (error) console.error('[free-challenge] could not mark day:', error.message);
}
