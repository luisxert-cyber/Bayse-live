'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const opt = z.string().uuid().or(z.literal(''));

// Every live class has one instructor. The database logs classes already taught before the timetable changes.
export async function setClassInstructors(f: FormData) {
  await requireStaff('classes');
  const classId = z.string().uuid().parse(f.get('class_id'));
  const lead = opt.parse(String(f.get('lead') ?? ''));
  const supabase = await createClient();
  const { error: delErr } = await supabase.from('live_class_instructors').delete().eq('class_id', classId);
  const rows = [lead && { class_id: classId, instructor_id: lead, lead: true }].filter(Boolean);
  const { error } = rows.length ? await supabase.from('live_class_instructors').insert(rows as object[]) : { error: null };
  revalidatePath('/admin/classes');
  revalidatePath('/live-classes');
  redirect(`/admin/classes?${delErr || error ? 'error=1' : 'ok=1'}#c-${classId}`);
}

const back = (q: string, id?: string) => redirect(`/admin/classes?${q}${id ? `#c-${id}` : ''}`);
const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);
const isoDow = (date: string) => { const d = new Date(`${date}T12:00:00Z`).getUTCDay(); return d === 0 ? 7 : d; };
const ZOOM = /^https:\/\/([a-z0-9-]+\.)*zoom\.us\//;
const fields = (f: FormData) => ({
  name: text(f, 'name', 60),
  starts_at: z.string().regex(/^\d{2}:\d{2}$/).safeParse(f.get('starts_at')),
  minutes: Math.max(10, Math.min(120, Math.round(Number(f.get('minutes')) || 45))),
});

async function setLink(supabase: Awaited<ReturnType<typeof createClient>>, classId: string, url: string) {
  if (!url) return null;
  if (!ZOOM.test(url)) return 'The Zoom link should start with https:// and be a zoom.us link.';
  const { error } = await supabase.from('live_class_links').upsert({ class_id: classId, join_url: url, zoom_meeting_id: url.match(/\/j\/(\d+)/)?.[1] ?? 'link' });
  return error ? 'The Zoom link could not be saved.' : null;
}

// Add a class: every week on a weekday, or once on a date.
export async function addClass(f: FormData) {
  await requireStaff('classes');
  const v = fields(f);
  const once = f.get('repeat') === 'once';
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(f.get('date'));
  const weekday = Math.round(Number(f.get('weekday')));
  if (v.name.length < 2 || !v.starts_at.success) back(`error=${encodeURIComponent('Add a class name and a start time.')}`);
  if (once && !date.success) back(`error=${encodeURIComponent('Choose the date for a one-off class.')}`);
  if (!once && !(weekday >= 1 && weekday <= 7)) back(`error=${encodeURIComponent('Choose the day of the week.')}`);
  const supabase = await createClient();
  const { data, error } = await supabase.from('live_classes').insert({
    name: v.name, starts_at: v.starts_at.data, minutes: v.minutes,
    weekday: once ? isoDow(date.data as string) : weekday, one_off_date: once ? date.data : null,
  }).select('id').single();
  if (error || !data) back(`error=${encodeURIComponent(error?.code === '23505' ? 'There is already a class at that day and time.' : 'That class could not be added.')}`);
  const id = (data as { id: string }).id;
  const lead = opt.parse(String(f.get('lead') ?? ''));
  if (lead) await supabase.from('live_class_instructors').insert({ class_id: id, instructor_id: lead, lead: true });
  const linkErr = await setLink(supabase, id, text(f, 'join_url', 500));
  revalidatePath('/admin/classes');
  back(linkErr ? `error=${encodeURIComponent(`Class added. ${linkErr}`)}` : 'ok=added', id);
}

// Change a class's name, time, length or Zoom link.
export async function updateClass(f: FormData) {
  await requireStaff('classes');
  const id = z.string().uuid().parse(f.get('class_id'));
  const v = fields(f);
  if (v.name.length < 2 || !v.starts_at.success) back(`error=${encodeURIComponent('Add a class name and a start time.')}`, id);
  const supabase = await createClient();
  const { error } = await supabase.from('live_classes').update({ name: v.name, starts_at: v.starts_at.data, minutes: v.minutes }).eq('id', id);
  if (error) back(`error=${encodeURIComponent(error.code === '23505' ? 'There is already a class at that day and time.' : 'Those changes could not be saved.')}`, id);
  const linkErr = await setLink(supabase, id, text(f, 'join_url', 500));
  revalidatePath('/admin/classes');
  back(linkErr ? `error=${encodeURIComponent(linkErr)}` : 'ok=1', id);
}

// Cancel one date of a class. Members see it as cancelled and it is not paid.
export async function cancelDate(f: FormData) {
  await requireStaff('classes');
  const id = z.string().uuid().parse(f.get('class_id'));
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(f.get('class_date'));
  const supabase = await createClient();
  const { error } = await supabase.from('live_class_cancellations').upsert({ class_id: id, class_date: date, reason: text(f, 'reason', 200) || null });
  revalidatePath('/admin/classes');
  back(error ? 'error=1' : 'ok=cancelled', id);
}

export async function restoreDate(f: FormData) {
  await requireStaff('classes');
  const id = z.string().uuid().parse(f.get('class_id'));
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(f.get('class_date'));
  const supabase = await createClient();
  const { error } = await supabase.from('live_class_cancellations').delete().eq('class_id', id).eq('class_date', date);
  revalidatePath('/admin/classes');
  back(error ? 'error=1' : 'ok=restored', id);
}

// Stop a class running for good. Past classes stay in the pay records.
export async function removeClass(f: FormData) {
  await requireStaff('classes');
  const id = z.string().uuid().parse(f.get('class_id'));
  if (f.get('confirm') !== 'on') back(`error=${encodeURIComponent('Tick the box to confirm you want to remove this class.')}`, id);
  const supabase = await createClient();
  const { error } = await supabase.from('live_classes').update({ active: false }).eq('id', id);
  revalidatePath('/admin/classes');
  back(error ? 'error=1' : 'ok=removed');
}
