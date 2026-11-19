'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { hasAccount } from '@/lib/auth/account';

const Request = z.object({
  studio_id: z.string().uuid(),
  tier: z.enum(['studio_99', 'studio_148', 'other']),
  member_ref: z.string().trim().max(80).optional(),
});

/**
 * A member asks to link their BAYSE studio membership. The request is always saved as "pending":
 * the database ignores anything else a member sends. Nothing is unlocked and no member price is
 * shown until that studio's manager or an admin has checked the membership and verified it.
 */
export async function requestStudioLink(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !hasAccount(user)) redirect('/sign-in?next=/you/membership');
  const parsed = Request.safeParse({
    studio_id: form.get('studio_id'),
    tier: form.get('tier'),
    member_ref: String(form.get('member_ref') ?? '') || undefined,
  });
  if (!parsed.success) redirect('/you/membership?studio=invalid');
  const { error } = await supabase.from('studio_memberships').insert({
    user_id: user.id,
    studio_id: parsed.data.studio_id,
    tier: parsed.data.tier,
    member_ref: parsed.data.member_ref ?? null,
    status: 'pending',
  });
  revalidatePath('/you/membership');
  // 23505: a link to this studio already exists (pending, verified or ended). Staff re-open it.
  redirect(`/you/membership?studio=${error ? (error.code === '23505' ? 'exists' : 'failed') : 'requested'}`);
}

/**
 * A studio member enters the code BAYSE gave them. The database checks the code and, if it is
 * good, links their studio membership as verified straight away (free Foundation, member prices).
 */
export async function redeemStudioCode(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !hasAccount(user)) redirect('/sign-in?next=/you/membership');
  const code = String(form.get('code') ?? '').trim().slice(0, 40);
  if (!code) redirect('/you/membership?code=invalid');
  const { data, error } = await supabase.rpc('redeem_studio_code', { p_code: code });
  const result = error ? 'failed' : String(data);
  revalidatePath('/you/membership');
  redirect(`/you/membership?code=${encodeURIComponent(result)}`);
}
