'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/auth/session';

const Batch = z.object({
  studio_id: z.string().uuid(),
  tier: z.enum(['studio_99', 'studio_148']),
  count: z.coerce.number().int().min(1).max(200),
  max_uses: z.coerce.number().int().min(1).max(1000),
  access_days: z.coerce.number().int().min(7).max(730),
  expires: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().trim().max(120).optional(),
});

/** Admin makes a batch of studio member codes. The database refuses anyone who is not an admin. */
export async function createCodes(form: FormData) {
  await requireStaff('plans');
  const parsed = Batch.safeParse({
    studio_id: form.get('studio_id'), tier: form.get('tier'), count: form.get('count'),
    max_uses: form.get('max_uses') || 1, access_days: form.get('access_days') || 365,
    expires: String(form.get('expires') ?? '') || undefined, note: String(form.get('note') ?? '') || undefined,
  });
  if (!parsed.success) redirect('/admin/studio-codes?error=invalid');
  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_studio_codes', {
    p_studio: d.studio_id, p_tier: d.tier, p_count: d.count, p_max_uses: d.max_uses,
    p_access_days: d.access_days, p_expires: d.expires ?? null, p_note: d.note ?? null,
  });
  if (error) redirect('/admin/studio-codes?error=denied');
  revalidatePath('/admin/studio-codes');
  redirect(`/admin/studio-codes?made=${(data as string[] | null)?.length ?? 0}`);
}

export async function setCodeActive(form: FormData) {
  await requireStaff('plans');
  const id = z.string().uuid().safeParse(form.get('id'));
  if (!id.success) redirect('/admin/studio-codes?error=invalid');
  const supabase = await createClient();
  const { error } = await supabase.from('studio_codes').update({ active: form.get('active') === 'true' }).eq('id', id.data);
  revalidatePath('/admin/studio-codes');
  redirect(`/admin/studio-codes?${error ? 'error=denied' : 'saved=1'}`);
}
