import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { WEEKDAYS, input, btn } from '@/lib/teach/format';
import { addAvailability, removeAvailability } from '../actions';

export const metadata = { title: 'Availability' };

export default async function TeachAvailability({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { me } = await requireInstructor();
  if (!me) return null;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: avail }, { data: settings }] = await Promise.all([
    supabase.from('instructor_availability').select('*').eq('instructor_id', me.id).order('weekday').order('start_time'),
    supabase.from('booking_settings').select('session_minutes, booking_notice_hours, booking_window_days').single(),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">When members can book you</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Add the weekly times you are free for 1-to-1s (UK time). Members see {settings?.session_minutes}-minute slots on the half hour inside these times, at least {settings?.booking_notice_hours} hours ahead and up to {settings?.booking_window_days} days ahead. Booked times disappear automatically.</p>
      </div>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">Check the times: the end must be after the start.</Notice>}
      {!me.offers_private && <Notice tone="warning">You are not taking 1-to-1 bookings. Switch it on in My profile.</Notice>}
      <ul className="divide-y divide-stone border border-stone">
        {(avail ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between p-3 text-sm">
            <span><b>{WEEKDAYS[a.weekday - 1]}</b> {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}</span>
            <form action={removeAvailability}><input type="hidden" name="id" value={a.id} /><button className="text-xs underline">Remove</button></form>
          </li>
        ))}
        {!avail?.length && <li className="p-4 text-sm text-muted">No times added yet.</li>}
      </ul>
      <form action={addAvailability} className="flex flex-wrap items-end gap-2 border border-stone p-4">
        <label className="grid gap-1 text-xs">Day<select name="weekday" className={`${input} w-auto`}>{WEEKDAYS.map((d, n) => <option key={d} value={n + 1}>{d}</option>)}</select></label>
        <label className="grid gap-1 text-xs">From<input type="time" name="start_time" defaultValue="09:00" step={1800} className={`${input} w-auto`} /></label>
        <label className="grid gap-1 text-xs">To<input type="time" name="end_time" defaultValue="12:00" step={1800} className={`${input} w-auto`} /></label>
        <button className={btn}>Add</button>
      </form>
    </div>
  );
}
