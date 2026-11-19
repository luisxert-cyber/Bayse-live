'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function markRefunded(f: FormData) {
  await requireStaff('sessions');
  const supabase = await createClient();
  const { error } = await supabase.rpc('mark_session_refunded', { p_id: z.string().uuid().parse(f.get('id')) });
  revalidatePath('/admin/sessions');
  redirect(`/admin/sessions?${error ? 'error=denied' : 'ok=refunded'}`);
}

// Give a member a free 1-to-1 credit by hand (goodwill, testers). It follows the same expiry rule.
export async function grantCredit(f: FormData) {
  await requireStaff('sessions');
  const email = z.string().trim().toLowerCase().email().safeParse(f.get('email'));
  if (!email.success) redirect('/admin/sessions?error=email');
  const supabase = await createClient();
  const { data: p } = await supabase.from('profiles').select('id').ilike('email', email.data).maybeSingle();
  if (!p) redirect('/admin/sessions?error=nomember');
  const { error } = await supabase.rpc('grant_coaching_credit', { p_user: p.id, p_note: String(f.get('note') ?? '').slice(0, 200) || null });
  revalidatePath('/admin/sessions');
  redirect(`/admin/sessions?${error ? 'error=denied' : 'ok=credit'}`);
}

// BAYSE Black: choose the member's coach (the instructor who answers their questions and reviews).
export async function assignCoach(f: FormData) {
  await requireStaff('sessions');
  const member = z.string().uuid().parse(f.get('user_id'));
  const coach = String(f.get('instructor_id') ?? '');
  const supabase = await createClient();
  const { error } = coach
    ? await supabase.from('black_coaches').upsert({ user_id: member, instructor_id: z.string().uuid().parse(coach) })
    : await supabase.from('black_coaches').delete().eq('user_id', member);
  revalidatePath('/admin/sessions');
  redirect(`/admin/sessions?${error ? 'error=denied' : 'ok=coach'}#black`);
}
