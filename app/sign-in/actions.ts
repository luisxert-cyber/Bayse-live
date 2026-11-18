'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createClient as createLinkClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';
import { safeNext, getRoles, isStaff } from '@/lib/auth/session';

export type AuthState = { error?: string; sent?: boolean } | undefined;

// Email links (password reset, sign-in link) must work in whichever browser opens them,
// e.g. the Gmail app's own browser. The default PKCE flow only works in the browser that asked,
// so these emails use the implicit flow: the session arrives in the link and /auth/link picks it up.
function linkClient() {
  return createLinkClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false } });
}

const Creds = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(128) });

async function origin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `${h.get('x-forwarded-proto') ?? 'https'}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? '';
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = Creds.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: 'Please enter your email and password.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Same message whether the email exists or not, so accounts cannot be discovered.
  if (error) return { error: 'That email and password do not match. Try again or reset your password.' };
  redirect(safeNext(String(form.get('next') ?? '')));
}

export async function sendMagicLink(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get('email'));
  if (!email.success) return { error: 'Please enter a valid email address.' };
  const next = safeNext(String(form.get('next') ?? ''));
  await linkClient().auth.signInWithOtp({ email: email.data, options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` } });
  return { sent: true };
}

export async function sendReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get('email'));
  if (!email.success) return { error: 'Please enter a valid email address.' };
  await linkClient().auth.resetPasswordForEmail(email.data, { redirectTo: `${await origin()}/auth/callback?next=/auth/reset` });
  return { sent: true };
}

export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const pw = z.string().min(10).max(128).safeParse(form.get('password'));
  if (!pw.success) return { error: 'Use at least 10 characters.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: 'We could not update your password. The link may have expired.' };
  // Staff go straight back to the back office; members to their Today page.
  const staff = isStaff(await getRoles().catch(() => []));
  redirect(staff ? '/admin' : '/today?password=updated');
}
