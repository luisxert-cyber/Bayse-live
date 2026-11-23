// The "next live class" countdown bar at the top of the member app.
// Pure logic only (no React, no database) so it can be unit tested. Class times are UK time.

/** One row of the live_schedule database function (the parts the bar needs). */
export type ScheduleRow = {
  class_id: string; class_date: string; starts_at: string; name: string; minutes: number;
  starts_ts: string; mine: boolean; state: 'upcoming' | 'open' | 'finished' | 'cancelled';
};
export type BarSlot = { key: string; name: string; date: string; time: string; startsMs: number; endsMs: number; mine: boolean };
export type BarPhase = 'upcoming' | 'open' | 'on';

/** The Zoom room opens this long before the start (matches join_live_class in the database). */
export const ROOM_OPENS_MS = 15 * 60_000;

/** Classes still to come or on now, soonest first. Cancelled and finished classes are left out. */
export function upcomingSlots(rows: ScheduleRow[], nowMs: number): BarSlot[] {
  return rows
    .filter((r) => r.state !== 'cancelled' && r.state !== 'finished')
    .map((r) => {
      const startsMs = Date.parse(r.starts_ts);
      return { key: `${r.class_id}-${r.class_date}`, name: r.name, date: r.class_date, time: r.starts_at, startsMs, endsMs: startsMs + r.minutes * 60_000, mine: r.mine };
    })
    .filter((s) => Number.isFinite(s.startsMs) && s.endsMs > nowMs)
    .sort((a, b) => a.startsMs - b.startsMs);
}

/** The class the bar should show right now: the one that is on, otherwise the next to start. */
export const currentSlot = (slots: BarSlot[], nowMs: number): BarSlot | null => slots.find((s) => s.endsMs > nowMs) ?? null;

export const phaseOf = (s: BarSlot, nowMs: number): BarPhase => (nowMs >= s.startsMs ? 'on' : nowMs >= s.startsMs - ROOM_OPENS_MS ? 'open' : 'upcoming');

const two = (n: number) => String(n).padStart(2, '0');

/** "1d 4h 05m" over a day away, "02:14:36" inside a day, "14:36" inside an hour. */
export function countdownText(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86_400), h = Math.floor((total % 86_400) / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  if (d > 0) return `${d}d ${h}h ${two(m)}m`;
  if (h > 0) return `${two(h)}:${two(m)}:${two(s)}`;
  return `${two(m)}:${two(s)}`;
}

/** "7pm", "9:30am" from a database time such as "19:00:00". */
export const prettyTime = (t: string) => { const h = Number(t.slice(0, 2)); const m = t.slice(3, 5); return `${h % 12 || 12}${m === '00' ? '' : `:${m}`}${h < 12 ? 'am' : 'pm'}`; };

/** Today's date in the UK as YYYY-MM-DD, whatever time zone the phone is in. */
export const ukDate = (nowMs: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(nowMs));

/** "Today 7pm", "Tomorrow 7am", "Sat 9am". */
export function whenLabel(s: BarSlot, nowMs: number): string {
  const today = ukDate(nowMs);
  const tomorrow = new Date(Date.parse(`${today}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  const day = s.date === today ? 'Today' : s.date === tomorrow ? 'Tomorrow' : new Date(`${s.date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
  return `${day} ${prettyTime(s.time)}`;
}
