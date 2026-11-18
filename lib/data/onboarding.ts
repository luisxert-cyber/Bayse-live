import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { OnboardingRow, Profile } from '@/lib/types';

export async function loadOnboarding(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: answers }, { data: nutrition }, { data: wellness }, { data: dietary }, { data: links }] = await Promise.all([
    supabase.from('profiles').select('id, email, first_name, display_name, home_studio_id, adult_confirmed, onboarding_completed_at').eq('id', userId).maybeSingle(),
    supabase.from('onboarding_answers').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('nutrition_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('wellness_preferences').select('interests').eq('user_id', userId).maybeSingle(),
    supabase.from('dietary_needs').select('allergies, intolerances').eq('user_id', userId).maybeSingle(),
    supabase.from('studio_memberships').select('id, studio_id, tier, member_ref, status').eq('user_id', userId),
  ]);
  return {
    profile: profile as Profile | null,
    answers: answers as OnboardingRow | null,
    nutrition: nutrition as { goals: string[]; dietary_pattern: string | null; foods_to_avoid: string[]; budget: string | null; household_size: number | null; cooking_time: string | null } | null,
    wellness: (wellness?.interests as string[] | undefined) ?? [],
    dietary: dietary as { allergies: string[]; intolerances: string[] } | null,
    links: (links ?? []) as Array<{ id: string; studio_id: string; tier: string; member_ref: string | null; status: string }>,
  };
}
