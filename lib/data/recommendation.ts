import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recommend, type Answers, type Programme } from '@/lib/plan/recommend';

// Not a server action on purpose: server actions are public endpoints, and this must only
// ever run for the signed-in user from server code (the programme page passes user.id).

export type SavedRecommendation = {
  id: string;
  programmeKey: string;
  programmeName: string;
  weeks: number;
  sessionsPerWeek: number;
  reasons: string[];
};

type ProgrammeRow = Programme & { id: string };

/** Returns the member's latest recommendation if it is newer than their answers; otherwise builds a fresh one. */
export async function buildRecommendation(userId: string): Promise<SavedRecommendation> {
  const supabase = await createClient();
  const [{ data: a }, { data: programmes }, { data: latest }] = await Promise.all([
    supabase.from('onboarding_answers').select('goals, experience, preferred_training, equipment, sessions_per_week, session_length, updated_at').eq('user_id', userId).maybeSingle(),
    supabase.from('programmes').select('id, key, name, level, focus, needs_equipment, weeks_options').eq('published', true).order('sort'),
    supabase.from('programme_recommendations').select('id, programme_id, weeks, sessions_per_week, reasons, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const list = (programmes ?? []) as ProgrammeRow[];
  if (!list.length) throw new Error('No published programmes');

  if (latest && a?.updated_at && new Date(latest.created_at) >= new Date(a.updated_at)) {
    const p = list.find((x) => x.id === latest.programme_id);
    if (p) return { id: latest.id, programmeKey: p.key, programmeName: p.name, weeks: latest.weeks, sessionsPerWeek: latest.sessions_per_week, reasons: latest.reasons };
  }

  const answers: Answers = {
    goals: a?.goals ?? [], experience: a?.experience ?? null, preferred_training: a?.preferred_training ?? [],
    equipment: a?.equipment ?? [], sessions_per_week: a?.sessions_per_week ?? null, session_length: a?.session_length ?? null,
  };
  const rec = recommend(answers, list);
  const programme = list.find((p) => p.key === rec.programmeKey)!;
  const { data, error } = await createAdminClient().from('programme_recommendations').insert({
    user_id: userId, programme_id: programme.id, weeks: rec.weeks, sessions_per_week: rec.sessionsPerWeek,
    reasons: rec.reasons, engine_version: rec.engineVersion,
  }).select('id').single();
  if (error) throw error;
  return { id: data.id as string, programmeKey: rec.programmeKey, programmeName: rec.programmeName, weeks: rec.weeks, sessionsPerWeek: rec.sessionsPerWeek, reasons: rec.reasons };
}

/** The member's current (most recently accepted, else latest) programme, for Today. */
export async function currentProgramme(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('programme_recommendations')
    .select('id, weeks, sessions_per_week, accepted_at, created_at, programmes(name, summary, key)')
    .eq('user_id', userId)
    .order('accepted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as null | { id: string; weeks: number; sessions_per_week: number; accepted_at: string | null; created_at: string; programmes: { name: string; summary: string; key: string } | null };
}
