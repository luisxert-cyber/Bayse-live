// Shared shapes and labels for the live timetable (website and member app). Times are UK time.
export type TimetableClass = {
  id: string; weekday: number; starts_at: string; name: string; minutes: number; status: 'live' | 'coming_soon';
  level: string | null; equipment: 'none' | 'mat' | 'optional' | 'required'; equipment_detail: string | null;
  class_type: string | null; description: string | null; instructors: string[];
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const EQUIPMENT_LABEL: Record<TimetableClass['equipment'], string> = {
  none: 'No equipment',
  mat: 'Mat only',
  optional: 'Optional equipment',
  required: 'Equipment required',
};
export const equipmentText = (c: Pick<TimetableClass, 'equipment' | 'equipment_detail'>) =>
  c.equipment_detail ?? (c.equipment === 'none' ? 'No equipment: a clear, safe space' : c.equipment === 'mat' ? 'Mat' : c.equipment === 'optional' ? 'Mat. Light dumbbells or a band optional' : 'Mat + light 1–2 kg dumbbells');

/** "6:00 AM" style, as in the brief. */
export function clock(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
export const partOfDay = (t: string) => { const h = Number(t.slice(0, 2)); return h < 11 ? 'Morning' : h < 14 ? 'Lunchtime' : h < 17 ? 'Afternoon' : 'Evening'; };
