'use server';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const TABLE: Record<string, string> = { post: 'posts', comment: 'comments', activity_message: 'activity_messages' };

/** Hide the reported content (where it can be hidden) and close the report. RLS: moderators only. */
export async function resolveReport(f: FormData) {
  await requireStaff('reports');
  const supabase = await createClient();
  const id = String(f.get('id')), action = String(f.get('action')), type = String(f.get('target_type')), target = String(f.get('target_id'));
  if (action === 'hide') {
    if (TABLE[type]) await supabase.from(TABLE[type]).update({ hidden_at: new Date().toISOString() }).eq('id', target);
    if (type === 'activity') await supabase.from('activities').update({ status: 'removed' }).eq('id', target);
  }
  await supabase.from('reports').update({ status: action === 'dismiss' ? 'dismissed' : 'actioned', resolution_note: String(f.get('note') ?? '').slice(0, 1000) || null }).eq('id', id);
  revalidatePath('/admin/reports');
}
