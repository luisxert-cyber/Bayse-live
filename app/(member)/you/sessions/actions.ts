'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { sessionCheckoutUrl } from '@/lib/billing/sessions';

export async function cancelMySession(f: FormData) {
  await requireUser('/you/sessions');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('cancel_private_session', { p_id: z.string().uuid().parse(f.get('id')), p_reason: String(f.get('reason') ?? '').slice(0, 300) || null });
  revalidatePath('/you/sessions');
  revalidatePath('/you');
  redirect(`${f.get('back') === '/you' ? '/you' : '/you/sessions'}?${error ? `error=${encodeURIComponent(error.message.slice(0, 120))}` : `cancelled=${data}`}`);
}

export async function payForSession(f: FormData) {
  const user = await requireUser('/you/sessions');
  let url: string | null = null;
  try { url = await sessionCheckoutUrl(z.string().uuid().parse(f.get('id')), user.id, user.email ?? undefined); } catch (e) { console.error('[sessions] checkout failed', e instanceof Error ? e.message : e); }
  redirect(url ?? '/you/sessions?pay=off');
}
