import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { WEEKDAYS, input, btn } from '@/lib/teach/format';
import { setClassInstructors } from './actions';

export const metadata = { title: 'Live classes' };
export const dynamic = 'force-dynamic';

export default async function Classes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('classes');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: classes }, { data: team }, { data: assigned }, { data: links }] = await Promise.all([
    supabase.from('live_classes').select('*').eq('active', true).order('weekday').order('starts_at'),
    supabase.from('instructors').select('id, display_name').eq('active', true).order('display_name'),
    supabase.from('live_class_instructors').select('*'),
    supabase.from('live_class_links').select('class_id'),
  ]);
  const hasLink = new Set((links ?? []).map((l) => l.class_id));
  const who = (id: string, lead: boolean) => assigned?.find((a) => a.class_id === id && a.lead === lead)?.instructor_id ?? '';
  const name = (id: string) => team?.find((t) => t.id === id)?.display_name;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Live classes</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Pick the instructor for each weekly class. They are paid for each class once it has finished. Instructors see their classes and the Zoom link in their portal.</p>
      </div>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">Could not save that change.</Notice>}
      {!team?.length && <Notice tone="warning" title="No instructors yet">Add instructors in Staff and instructors first.</Notice>}
      <ul className="divide-y divide-stone border border-stone">
        {(classes ?? []).map((c) => {
          const lead = who(c.id, true);
          return (
            <li key={c.id} id={`c-${c.id}`} className="grid gap-3 p-4 text-sm md:grid-cols-[220px_1fr]">
              <div>
                <p className="font-bold">{WEEKDAYS[c.weekday - 1]} {c.starts_at.slice(0, 5)}</p>
                <p>{c.name} · {c.minutes} min</p>
                <p className="text-xs text-muted">{hasLink.has(c.id) ? 'Zoom link set' : 'No Zoom link yet'}{lead ? ` · ${name(lead)}` : ' · no instructor yet'}</p>
              </div>
              <form action={setClassInstructors} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="class_id" value={c.id} />
                <label className="grid gap-1 text-xs">Instructor<select name="lead" defaultValue={lead} className={`${input} min-w-[170px]`}><option value="">Not set</option>{team?.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></label>
                <button className={btn}>Save</button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
