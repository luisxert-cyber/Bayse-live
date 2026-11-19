import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Completion } from './progress';
import type { LiveSlot } from './next';

/** Everything BAYSE Daily and Progress need for one member, read with their own session (RLS applies). */
export async function loadDaily(userId: string) {
  const supabase = await createClient();
  const [{ data: rows }, { data: answers }, { data: rec }, { data: live }, { data: canLive }, { data: canClasses }] = await Promise.all([
    supabase.from('workout_completions').select('workout_key, minutes, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1000),
    supabase.from('onboarding_answers').select('goals, session_length, sessions_per_week, experience').eq('user_id', userId).maybeSingle(),
    supabase.from('programme_recommendations').select('sessions_per_week').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('live_classes').select('weekday, starts_at, name, minutes').eq('active', true).eq('status', 'live').is('one_off_date', null),
    supabase.rpc('has_entitlement', { k: 'live_classes' }),
    supabase.rpc('has_entitlement', { k: 'on_demand' }),
  ]);
  const completions: Completion[] = (rows ?? []).map((r) => ({ key: r.workout_key as string, minutes: r.minutes as number, at: r.completed_at as string }));
  return {
    completions,
    goals: (answers?.goals as string[] | null) ?? [],
    sessionLength: (answers?.session_length as string | null) ?? null,
    experience: (answers?.experience as string | null) ?? null,
    weeklyGoal: (rec?.sessions_per_week as number | null) ?? (answers?.sessions_per_week as number | null) ?? 3,
    live: (live ?? []) as LiveSlot[],
    canLive: canLive === true,
    canClasses: canClasses === true,
  };
}
