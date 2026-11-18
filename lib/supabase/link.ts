import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { publicEnv } from '@/lib/env';

// Email links (password reset, sign-in link, staff invites) must work in whichever browser opens them,
// e.g. the Gmail app's own browser. The default PKCE flow only works in the browser that asked,
// so these emails use the implicit flow: the session arrives in the link and /auth/link picks it up.
export function linkClient() {
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false } });
}

export async function siteOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `${h.get('x-forwarded-proto') ?? 'https'}://${host}` : publicEnv.siteUrl;
}
