// Calendar days in UK time, as YYYY-MM-DD. Used by the food diary and the daily check-in.

/** Today's date in the UK. */
export function ukToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export const isDay = (d: string | undefined | null): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime());
/** The day `n` days after (or before, if negative) the given day. */
export function shiftDay(day: string, n: number) {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);
}
/** "Thu 19 Nov" */
export function dayLabel(day: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${day}T00:00:00Z`));
}
