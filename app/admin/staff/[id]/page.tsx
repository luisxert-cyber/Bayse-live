import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { PhotoManager } from '@/components/teach/PhotoManager';
import { WEEKDAYS, STUDIOS, SPECIALITIES, input, btn, btnSolid } from '@/lib/teach/format';
import { saveInstructor } from '../actions';
import { addAvailability, removeAvailability } from '@/app/teach/actions';

export const metadata = { title: 'Instructor profile' };
export const dynamic = 'force-dynamic';

export default async function InstructorAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('staff');
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: i }, { data: avail }, { data: classes }, { data: zoom }] = await Promise.all([
    supabase.from('instructors').select('*').eq('id', id).maybeSingle(),
    supabase.from('instructor_availability').select('*').eq('instructor_id', id).order('weekday').order('start_time'),
    supabase.from('live_class_instructors').select('lead, live_classes(name, weekday, starts_at)').eq('instructor_id', id),
    supabase.from('instructor_private').select('zoom_url').eq('instructor_id', id).maybeSingle(),
  ]);
  if (!i) notFound();
  const back = `/admin/staff/${id}`;
  return (
    <div className="space-y-6">
      <p className="text-sm"><Link href="/admin/staff" className="text-muted hover:text-ink">← Staff and instructors</Link></p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{i.display_name}</h1>
        {i.status === 'published' && <Link href={`/instructors/${i.slug}`} className={btn}>View on website</Link>}
      </div>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">That could not be saved. Check the times or fields.</Notice>}

      <section className="space-y-2">
        <p className="font-bold">Photos</p>
        <PhotoManager instructorId={i.id} photos={i.photos ?? []} />
      </section>

      <form action={saveInstructor} className="space-y-4 border border-stone p-4">
        <input type="hidden" name="id" value={i.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Name on website<input name="display_name" defaultValue={i.display_name} required minLength={2} maxLength={60} className={input} /></label>
          <label className="grid gap-1 text-sm">One-line intro<input name="headline" defaultValue={i.headline ?? ''} maxLength={120} className={input} /></label>
        </div>
        <label className="grid gap-1 text-sm">Bio<textarea name="bio" defaultValue={i.bio ?? ''} rows={5} maxLength={1500} className={input} /></label>
        <fieldset className="text-sm"><legend className="mb-1">Specialities</legend>
          <div className="flex flex-wrap gap-2">{SPECIALITIES.map((x) => <label key={x} className="flex items-center gap-1.5 border border-stone px-2 py-1"><input type="checkbox" name="specialities" value={x} defaultChecked={i.specialities?.includes(x)} />{x}</label>)}</div>
        </fieldset>
        <fieldset className="text-sm"><legend className="mb-1">Studios</legend>
          <div className="flex flex-wrap gap-2">{STUDIOS.map((x) => <label key={x} className="flex items-center gap-1.5 border border-stone px-2 py-1"><input type="checkbox" name="studios" value={x} defaultChecked={i.studios?.includes(x)} />{x}</label>)}</div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">Website status
            <select name="status" defaultValue={i.status} className={input}>
              <option value="draft">Draft (not on website)</option>
              <option value="pending">Waiting for approval</option>
              <option value="published">Published on website</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">Order on website<input name="sort" type="number" min={0} max={999} defaultValue={i.sort} className={input} /></label>
          <div className="grid content-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="offers_private" defaultChecked={i.offers_private} />Takes 1-to-1 bookings</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={i.active} />Active</label>
          </div>
        </div>
        <p className="text-xs text-muted">1-to-1 Zoom room: {zoom?.zoom_url ? 'set' : 'not set yet (the instructor adds it in their portal)'}</p>
        <button className={btnSolid}>Save</button>
      </form>

      <section className="space-y-2">
        <p className="font-bold">Live classes they teach</p>
        <ul className="text-sm text-muted">
          {(classes ?? []).map((c, n) => {
            const lc = c.live_classes as unknown as { name: string; weekday: number; starts_at: string } | null;
            return lc ? <li key={n}>{WEEKDAYS[lc.weekday - 1]} {lc.starts_at.slice(0, 5)} · {lc.name}</li> : null;
          })}
          {!classes?.length && <li>None yet. Assign classes in <Link href="/admin/classes" className="underline">Live classes</Link>.</li>}
        </ul>
      </section>

      <section className="space-y-2">
        <p className="font-bold">1-to-1 availability</p>
        <ul className="space-y-1 text-sm">
          {(avail ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between border border-stone px-3 py-2">
              <span>{WEEKDAYS[a.weekday - 1]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}</span>
              <form action={removeAvailability}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="back" value={back} /><button className="text-xs underline">Remove</button></form>
            </li>
          ))}
        </ul>
        <form action={addAvailability} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="instructor_id" value={i.id} /><input type="hidden" name="back" value={back} />
          <select name="weekday" className={`${input} w-auto`}>{WEEKDAYS.map((d, n) => <option key={d} value={n + 1}>{d}</option>)}</select>
          <input type="time" name="start_time" defaultValue="09:00" step={1800} className={`${input} w-auto`} />
          <input type="time" name="end_time" defaultValue="12:00" step={1800} className={`${input} w-auto`} />
          <button className={btn}>Add time</button>
        </form>
      </section>
    </div>
  );
}
