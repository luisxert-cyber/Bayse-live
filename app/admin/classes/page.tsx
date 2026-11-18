import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { WEEKDAYS, input, btn, btnSolid } from '@/lib/teach/format';
import { setClassInstructors, addClass, updateClass, cancelDate, restoreDate, removeClass } from './actions';

export const metadata = { title: 'Live classes' };
export const dynamic = 'force-dynamic';

type Class = { id: string; weekday: number; starts_at: string; name: string; minutes: number; one_off_date: string | null };
type Slot = { class_id: string; class_date: string; booked: number; state: string };

const OK: Record<string, string> = { added: 'Class added.', cancelled: 'That date is cancelled. Members who booked will see it as cancelled.', restored: 'That date is back on.', removed: 'Class removed from the timetable.' };
const nice = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

export default async function Classes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('classes');
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  const [{ data: all }, { data: team }, { data: assigned }, { data: links }, { data: sched }] = await Promise.all([
    supabase.from('live_classes').select('id, weekday, starts_at, name, minutes, one_off_date').eq('active', true).order('weekday').order('starts_at'),
    supabase.from('instructors').select('id, display_name').eq('active', true).order('display_name'),
    supabase.from('live_class_instructors').select('*'),
    supabase.from('live_class_links').select('class_id, join_url'),
    supabase.rpc('live_schedule', { p_days: 14 }),
  ]);
  const classes = ((all ?? []) as Class[]).filter((c) => !c.one_off_date || c.one_off_date >= today);
  const weekly = classes.filter((c) => !c.one_off_date);
  const once = classes.filter((c) => c.one_off_date).sort((a, b) => (a.one_off_date as string).localeCompare(b.one_off_date as string) || a.starts_at.localeCompare(b.starts_at));
  const linkFor = new Map((links ?? []).map((l) => [l.class_id as string, l.join_url as string]));
  const slots = ((sched ?? []) as Slot[]).filter((s) => s.state !== 'finished');
  const who = (id: string) => assigned?.find((a) => a.class_id === id)?.instructor_id ?? '';
  const name = (id: string) => team?.find((t) => t.id === id)?.display_name;
  const teamOptions = team?.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>);

  const Row = ({ c }: { c: Class }) => {
    const lead = who(c.id);
    const dates = slots.filter((s) => s.class_id === c.id);
    const upcoming = dates.filter((s) => s.state !== 'cancelled');
    const cancelled = dates.filter((s) => s.state === 'cancelled');
    const next = upcoming[0];
    return (
      <li id={`c-${c.id}`} className="scroll-mt-16 space-y-3 p-4 text-sm">
        <div>
          <p className="font-bold">{c.one_off_date ? nice(c.one_off_date) : WEEKDAYS[c.weekday - 1]} {c.starts_at.slice(0, 5)} <span className="font-normal text-muted">· {c.one_off_date ? 'one-off' : 'every week'}</span></p>
          <p>{c.name} · {c.minutes} min</p>
          <p className="text-xs text-muted">{linkFor.has(c.id) ? 'Zoom link set' : 'No Zoom link yet'}{lead ? ` · ${name(lead)}` : ' · no instructor yet'}{next ? ` · ${next.booked} booked for ${nice(next.class_date)}` : ''}</p>
          {cancelled.map((x) => (
            <form key={x.class_date} action={restoreDate} className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <input type="hidden" name="class_id" value={c.id} /><input type="hidden" name="class_date" value={x.class_date} />
              <span className="border border-clay px-2 py-0.5 text-clay">Cancelled {nice(x.class_date)}</span><button className="underline">Put back on</button>
            </form>
          ))}
        </div>
        <form action={setClassInstructors} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="class_id" value={c.id} />
          <label className="grid gap-1 text-xs">Instructor<select name="lead" defaultValue={lead} className={`${input} min-w-[170px]`}><option value="">Not set</option>{teamOptions}</select></label>
          <button className={btn}>Save</button>
        </form>
        <details className="border border-stone">
          <summary className="cursor-pointer px-3 py-2 text-xs font-bold uppercase tracking-wide">Edit, cancel a date or remove</summary>
          <div className="space-y-4 border-t border-stone p-3">
            <form action={updateClass} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="class_id" value={c.id} />
              <label className="grid gap-1 text-xs">Class name<input name="name" defaultValue={c.name} required maxLength={60} className={input} /></label>
              <label className="grid gap-1 text-xs">Start time (UK)<input name="starts_at" type="time" defaultValue={c.starts_at.slice(0, 5)} required className={input} /></label>
              <label className="grid gap-1 text-xs">Length (minutes)<input name="minutes" type="number" min={10} max={120} defaultValue={c.minutes} className={input} /></label>
              <label className="grid gap-1 text-xs">Zoom link<input name="join_url" type="url" defaultValue={linkFor.get(c.id) ?? ''} placeholder="https://zoom.us/j/…" className={input} /></label>
              <div><button className={btn}>Save changes</button></div>
            </form>
            {upcoming.length > 0 && (
              <form action={cancelDate} className="flex flex-wrap items-end gap-2 border-t border-stone pt-3">
                <input type="hidden" name="class_id" value={c.id} />
                <label className="grid gap-1 text-xs">Cancel one date<select name="class_date" className={`${input} min-w-[150px]`}>{upcoming.map((s) => <option key={s.class_date} value={s.class_date}>{nice(s.class_date)} · {s.booked} booked</option>)}</select></label>
                <label className="grid flex-1 gap-1 text-xs">Reason (optional)<input name="reason" maxLength={200} className={input} /></label>
                <button className={btn}>Cancel this date</button>
              </form>
            )}
            <form action={removeClass} className="flex flex-wrap items-center gap-3 border-t border-stone pt-3">
              <input type="hidden" name="class_id" value={c.id} />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="confirm" />Remove this class from the timetable for good</label>
              <button className="border border-clay px-3 py-2 text-xs font-bold uppercase text-clay">Remove class</button>
            </form>
          </div>
        </details>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Live classes</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Add weekly or one-off classes, pick the instructor, set the Zoom link, cancel a single date or remove a class. Instructors are paid for each class once it has finished; cancelled dates are not paid.</p>
      </div>
      {sp.ok && <Notice tone="success">{OK[sp.ok] ?? 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">{sp.error === '1' ? 'Could not save that change.' : sp.error}</Notice>}
      {!team?.length && <Notice tone="warning" title="No instructors yet">Add instructors in Staff and instructors first.</Notice>}

      <details className="border border-white" open={!classes.length}>
        <summary className="cursor-pointer p-4 text-sm font-bold uppercase tracking-wide">+ Add a class</summary>
        <form action={addClass} className="grid gap-3 border-t border-stone p-4 text-sm sm:grid-cols-2">
          <label className="grid gap-1">Class name<input name="name" required maxLength={60} placeholder="Mat Pilates" className={input} /></label>
          <label className="grid gap-1">How often<select name="repeat" defaultValue="weekly" className={input}><option value="weekly">Every week</option><option value="once">One time only</option></select></label>
          <label className="grid gap-1">Day (for every week)<select name="weekday" defaultValue="1" className={input}>{WEEKDAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></label>
          <label className="grid gap-1">Date (for one time only)<input name="date" type="date" min={today} className={input} /></label>
          <label className="grid gap-1">Start time (UK)<input name="starts_at" type="time" required className={input} /></label>
          <label className="grid gap-1">Length (minutes)<input name="minutes" type="number" min={10} max={120} defaultValue={45} className={input} /></label>
          <label className="grid gap-1">Instructor<select name="lead" defaultValue="" className={input}><option value="">Not set</option>{teamOptions}</select></label>
          <label className="grid gap-1">Zoom link<input name="join_url" type="url" placeholder="https://zoom.us/j/…" className={input} /></label>
          <div className="sm:col-span-2"><button className={btnSolid}>Add class</button></div>
        </form>
      </details>

      {once.length > 0 && (
        <section>
          <p className="mb-2 font-bold">One-off classes</p>
          <ul className="divide-y divide-stone border border-stone">{once.map((c) => <Row key={c.id} c={c} />)}</ul>
        </section>
      )}
      <section>
        <p className="mb-2 font-bold">Weekly timetable</p>
        <ul className="divide-y divide-stone border border-stone">
          {weekly.map((c) => <Row key={c.id} c={c} />)}
          {!weekly.length && <li className="p-6 text-center text-sm text-muted">No weekly classes yet.</li>}
        </ul>
      </section>
    </div>
  );
}
