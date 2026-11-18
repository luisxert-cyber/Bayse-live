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
