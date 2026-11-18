import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type Challenge = { id: string; month: string; title: string; blurb: string; target: number };

/** First day of this month and of next month in UK time, as YYYY-MM-DD. */
export function ukMonth(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).split('-').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${y}-${pad(m)}-01`, next, daysLeft: daysInMonth - d + 1 };
}

export const monthLabel = (month: string) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}T00:00:00Z`));

/** This month's challenge for one member: whether they have joined, how far they are, and how many others are in. */
export async function loadChallenge(userId: string) {
  const supabase = await createClient();
  const { start, next, daysLeft } = ukMonth();
  const [{ data: challenge }, { data: allowed }] = await Promise.all([
    supabase.from('challenges').select('id, month, title, blurb, target').eq('month', start).maybeSingle(),
    supabase.rpc('has_entitlement', { k: 'challenges' }),
  ]);
  const c = (challenge as Challenge | null) ?? null;
  if (!c) return { challenge: null, allowed: allowed === true, joined: false, done: 0, daysLeft, stats: { joined: 0, finished: 0 } };
  // A day either side covers the hour between UK time and UTC; the exact month is checked below.
  const from = new Date(new Date(`${start}T00:00:00Z`).getTime() - 86_400_000).toISOString();
  const to = new Date(new Date(`${next}T00:00:00Z`).getTime() + 86_400_000).toISOString();
  const [{ data: entry }, { data: workouts }, { data: live }, { data: stats }] = await Promise.all([
    supabase.from('challenge_entries').select('joined_at').eq('challenge_id', c.id).eq('user_id', userId).maybeSingle(),
    supabase.from('workout_completions').select('completed_at').eq('user_id', userId).gte('completed_at', from).lt('completed_at', to),
    supabase.from('live_checkins').select('class_date').eq('user_id', userId).gte('class_date', start).lt('class_date', next),
    supabase.rpc('challenge_stats', { p_id: c.id }).maybeSingle(),
  ]);
  const ukDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  const inMonth = (workouts ?? []).filter((w) => { const d = ukDate(w.completed_at as string); return d >= start && d < next; }).length;
  const s = stats as { joined: number; finished: number } | null;
  return { challenge: c, allowed: allowed === true, joined: Boolean(entry), done: inMonth + (live ?? []).length, daysLeft, stats: { joined: s?.joined ?? 0, finished: s?.finished ?? 0 } };
}
