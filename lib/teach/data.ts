import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type Session = { id: string; starts_at: string; minutes: number; status: string; payment: string; member_note: string | null; instructor_note: string | null; cancel_reason: string | null; member_name?: string; health_flag?: boolean };

/** This instructor's sessions with the member's first name (via a function that checks access). */
export async function mySessions(instructorId: string, opts: { from?: string; to?: string; limit?: number } = {}) {
  const supabase = await createClient();
  await supabase.rpc('expire_unpaid_sessions');
  let q = supabase.from('private_sessions').select('id, starts_at, minutes, status, payment, member_note, instructor_note, cancel_reason').eq('instructor_id', instructorId).order('starts_at');
  if (opts.from) q = q.gte('starts_at', opts.from);
  if (opts.to) q = q.lte('starts_at', opts.to);
  const { data } = await q.limit(opts.limit ?? 100);
  const rows = (data ?? []) as Session[];
  await Promise.all(rows.map(async (r) => {
    const { data: p } = await supabase.rpc('session_people', { p_id: r.id }).maybeSingle();
    r.member_name = (p as { member_name?: string } | null)?.member_name ?? 'Member';
    r.health_flag = Boolean((p as { health_flag?: boolean } | null)?.health_flag);
  }));
  return rows;
}

/** Live classes this instructor teaches, with the next date each one runs. */
export async function myClasses(instructorId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('live_class_instructors').select('lead, live_classes(id, name, weekday, starts_at, minutes)').eq('instructor_id', instructorId);
  const { data: links } = await supabase.from('live_class_links').select('class_id, join_url');
  const now = new Date();
  const ukToday = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const isoDow = ((ukToday.getDay() + 6) % 7) + 1;
  return (data ?? []).map((row) => {
    const c = row.live_classes as unknown as { id: string; name: string; weekday: number; starts_at: string; minutes: number };
    const ahead = (c.weekday - isoDow + 7) % 7;
    const next = new Date(ukToday); next.setDate(ukToday.getDate() + ahead);
    return { ...c, lead: row.lead, nextDate: next.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }), daysAhead: ahead, joinUrl: links?.find((l) => l.class_id === c.id)?.join_url ?? null };
  }).sort((a, b) => a.daysAhead - b.daysAhead || a.starts_at.localeCompare(b.starts_at));
}
