// Row shapes used by the app. Kept in step with supabase/migrations by hand for Phase 1;
// switch to `supabase gen types` once the CLI runs in CI.

export type Studio = { id: string; slug: string; name: string; town: string | null; status: 'open' | 'opening' | 'closed' };

export type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  display_name: string | null;
  home_studio_id: string | null;
  adult_confirmed: boolean;
  onboarding_completed_at: string | null;
};

export type Plan = { id: string; key: string; name: string; description: string | null; sort: number; is_hypothesis: boolean };
export type Price = { id: string; plan_id: string; stripe_price_id: string | null; billing_interval: 'month' | 'year' | '28_days'; amount_pence: number; currency: string; trial_days: number };

export type OnboardingRow = {
  user_id: string;
  current_step: string | null;
  goals: string[];
  experience: 'new' | 'beginner' | 'intermediate' | 'advanced' | null;
  preferred_training: string[];
  equipment: string[];
  sessions_per_week: number | null;
  session_length: string | null;
  coaching_style: string[];
  community_interests: string[];
  completed_at: string | null;
};

export type StudioLink = {
  id: string;
  user_id: string;
  studio_id: string;
  tier: 'studio_99' | 'studio_148' | 'other';
  member_ref: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'ended';
  requested_at: string;
  verified_at: string | null;
};

export const formatPence = (p: number, currency = 'gbp') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(p / 100);
