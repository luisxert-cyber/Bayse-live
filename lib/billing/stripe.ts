import 'server-only';
import Stripe from 'stripe';
import { stripeEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';

let client: Stripe | null = null;

/** Stripe client. Refuses live keys unless the live_billing flag has been switched on by an admin. */
export async function getStripe(): Promise<Stripe> {
  const env = stripeEnv();
  if (env.isLive) {
    const { data } = await createAdminClient().from('feature_flags').select('enabled').eq('key', 'live_billing').maybeSingle();
    if (!data?.enabled) throw new Error('Live Stripe key found but live billing is switched off. Use a test key until launch is approved.');
  }
  client ??= new Stripe(env.secretKey, { appInfo: { name: 'BAYSE Live' } });
  return client;
}
