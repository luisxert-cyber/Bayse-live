'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

// Coach reply or progress-review feedback. The database only allows the member's assigned coach (or an admin).
export async function coachReply(f: FormData) {
  await requireInstructor();
  const member = z.string().uuid().parse(f.get('member_id'));
  const kind = f.get('kind') === 'feedback' ? 'feedback' : 'reply';
  const body = String(f.get('body') ?? '').trim().slice(0, 2000);
  const focus = String(f.get('focus') ?? '').trim().slice(0, 600) || null;
  if (!body) redirect(`/teach/coaching/${member}?e=empty`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('coaching_messages').insert({ member_id: member, author_id: user!.id, kind, body, focus: kind === 'feedback' ? focus : null });
  revalidatePath('/teach/coaching');
  redirect(`/teach/coaching/${member}?${error ? 'e=save' : 'ok=1'}`);
}
