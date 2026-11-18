'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { requireHealthCheck } from '@/lib/health/gate';
import { sessionCheckoutUrl } from '@/lib/billing/sessions';

// Book a 1-to-1. The database checks the slot is still free and uses a Personal Coaching credit if the member has one.
export async function bookSession(f: FormData) {
  const slug = z.string().regex(/^[a-z0-9-]+$/).parse(f.get('slug'));
  const user = await getUser().catch(() => null);
  if (!hasAccount(user)) redirect(`/sign-in?next=${encodeURIComponent(`/instructors/${slug}#book`)}`);
  await requireHealthCheck(`/instructors/${slug}#book`);
  const instructorId = z.string().uuid().parse(f.get('instructor_id'));
  const startsAt = z.string().datetime({ offset: true }).safeParse(f.get('starts_at'));
  if (!startsAt.success) redirect(`/instructors/${slug}?error=slot#book`);
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc('request_private_session', {
    p_instructor: instructorId, p_starts: startsAt.data, p_note: String(f.get('note') ?? '').slice(0, 500) || null, p_use_credit: f.get('use_credit') === 'yes',
  });
  if (error || !id) redirect(`/instructors/${slug}?error=${encodeURIComponent(error?.message.slice(0, 120) ?? 'slot')}#book`);
  const { data: s } = await supabase.from('private_sessions').select('payment').eq('id', id).single();
  if (s?.payment === 'credit') redirect('/you/sessions?booked=credit');
  let url: string | null = null;
  try { url = await sessionCheckoutUrl(id as string, user!.id, user!.email ?? undefined); } catch (e) { console.error('[sessions] checkout failed', e instanceof Error ? e.message : e); }
  redirect(url ?? '/you/sessions?booked=unpaid');
}
