'use server';
import { createClient } from '@/lib/supabase/server';
import { workoutMinutes } from '@/lib/workouts/catalog';
import { findAnyWorkout } from '@/lib/workouts/builder';

/** Record a finished guided workout for the signed-in member. */
export async function recordCompletion(key: string) {
  const w = findAnyWorkout(key);
  if (!w) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('workout_completions').insert({ user_id: user.id, workout_key: w.key.slice(0, 40), minutes: workoutMinutes(w) });
  if (error) console.error('[workout] could not record completion:', error.message);
}

/** Record a finished workout the member built themselves. */
export async function recordCustom(minutes: number) {
  const m = Math.round(Number(minutes));
  if (!Number.isFinite(m) || m < 1 || m > 120) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('workout_completions').insert({ user_id: user.id, workout_key: 'custom', minutes: m });
  if (error) console.error('[workout] could not record custom completion:', error.message);
}
