'use server';
import { createClient } from '@/lib/supabase/server';
import { findWorkout, workoutMinutes } from '@/lib/workouts/catalog';

/** Record a finished guided workout for the signed-in member. */
export async function recordCompletion(key: string) {
  const w = findWorkout(key);
  if (!w) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('workout_completions').insert({ user_id: user.id, workout_key: w.key, minutes: workoutMinutes(w) });
  if (error) console.error('[workout] could not record completion:', error.message);
}
