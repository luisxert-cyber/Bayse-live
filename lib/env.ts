// Reads environment variables once, with a clear error when one is missing.
// Server-only values are read lazily so a missing Stripe key never breaks pages that do not need it.

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  // Stripe publishable key (pk_test_… or pk_live_…). Needed for the in-app payment form.
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
};

/**
 * The Stripe publishable key, read when the page is requested (server only). The value built into the
 * site at build time is the fallback, so a key added in Netlify works without waiting for a rebuild.
 * Publishable keys are meant to be public; only values that look like one (pk_…) are accepted.
 */
export function stripePublishableKey(): string {
  const names = ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_PUBLISHABLE_KEY'];
  for (const n of names) {
    const v = (process.env[n] ?? '').trim();
    if (v.startsWith('pk_')) return v;
  }
  const built = publicEnv.stripePublishableKey.trim();
  return built.startsWith('pk_') ? built : '';
}

export function serverEnv() {
  return {
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

export function stripeEnv() {
  const secretKey = required('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
  // Safety rail: live keys are refused unless the live_billing flag is switched on (checked in lib/billing/stripe.ts).
  return {
    secretKey,
    webhookSecret: required('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET),
    isLive: secretKey.startsWith('sk_live_') || secretKey.startsWith('rk_live_'),
  };
}
