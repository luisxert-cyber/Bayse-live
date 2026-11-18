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
