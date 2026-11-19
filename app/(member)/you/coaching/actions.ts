'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

export async function askCoach(f: FormData) {
  const user = await requireUser('/you/coaching');
  const body = text(f, 'body', 2000);
  if (!body) redirect('/you/coaching?e=empty');
  const supabase = await createClient();
  const { error } = await supabase.from('coaching_messages').insert({ member_id: user.id, author_id: user.id, kind: 'question', body });
  revalidatePath('/you/coaching');
  redirect(error ? '/you/coaching?e=save' : '/you/coaching?ok=asked');
}

export async function sendReview(f: FormData) {
  const user = await requireUser('/you/coaching');
  const rating = Math.round(Number(f.get('rating')));
  const parts = [['How it went', text(f, 'went', 600)], ['Wins', text(f, 'wins', 600)], ['What I want next', text(f, 'next', 600)], ['Anything my coach should know', text(f, 'know', 600)]]
    .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  if (!(rating >= 1 && rating <= 5) || !parts.length) redirect('/you/coaching?e=review');
  const supabase = await createClient();
  const { error } = await supabase.from('coaching_messages').insert({ member_id: user.id, author_id: user.id, kind: 'review', body: parts.join('\n'), rating });
  revalidatePath('/you/coaching');
  redirect(error ? '/you/coaching?e=save' : '/you/coaching?ok=review');
}
