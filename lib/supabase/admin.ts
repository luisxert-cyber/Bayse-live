import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicEnv, serverEnv } from '@/lib/env';

/**
 * Service-role client. Bypasses RLS, so it is used ONLY in server code for things
 * members must never do themselves: writing subscriptions from the Stripe webhook,
 * saving programme recommendations, deleting an account. Never import from a client component.
 */
export function createAdminClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv().supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
