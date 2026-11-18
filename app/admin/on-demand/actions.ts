'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'class';

export async function saveVideoClass(f: FormData): Promise<{ error?: string; ok?: boolean }> {
  const { isAdmin } = await requireStaff('content');
  const supabase = await createClient();
  const id = z.string().uuid().safeParse(f.get('id'));
  const videoPath = s(f, 'video_path', 200);
  const videoUrl = s(f, 'video_url', 500);
  if (videoPath && !/^[0-9a-f-]+\.(mp4|mov|webm)$/.test(videoPath)) return { error: 'Invalid video file.' };
  if (videoUrl && !/^https:\/\//.test(videoUrl)) return { error: 'The video link must start with https://' };
  const coverPath = s(f, 'cover_path', 200);
  const row = {
    title: s(f, 'title', 80),
    description: s(f, 'description', 800) || null,
    style: z.enum(['mat', 'sculpt', 'stretch', 'prenatal', 'beginner', 'reformer']).catch('mat').parse(f.get('style')),
    level: z.enum(['Gentle', 'Steady', 'Strong']).catch('Steady').parse(f.get('level')),
    minutes: Math.max(1, Math.min(180, Number(f.get('minutes')) || 30)),
    sort: Math.max(0, Math.min(999, Number(f.get('sort')) || 100)),
    equipment: f.getAll('equipment').map(String).slice(0, 8),
    instructor_id: z.string().uuid().safeParse(f.get('instructor_id')).success ? String(f.get('instructor_id')) : null,
    video_path: videoPath || null,
    video_url: videoUrl || null,
    cover_path: /^[0-9a-f-]+\.(jpg|png|webp)$/.test(coverPath) ? coverPath : null,
    free: f.get('free') === 'on',
    ...(isAdmin ? { status: z.enum(['draft', 'published', 'hidden']).catch('draft').parse(f.get('status')) } : {}),
  };
  if (row.title.length < 2) return { error: 'Add a class name.' };
  if (row.status === 'published' && !row.video_path && !row.video_url) return { error: 'Add a video before publishing.' };
  if (id.success) {
    const { error } = await supabase.from('video_classes').update(row).eq('id', id.data);
    if (error) return { error: 'Could not save changes.' };
  } else {
    let slug = slugify(row.title);
    const { data: taken } = await supabase.from('video_classes').select('slug').like('slug', `${slug}%`);
    if (taken?.some((t) => t.slug === slug)) slug = `${slug}-${(taken?.length ?? 0) + 1}`;
    const { error } = await supabase.from('video_classes').insert({ ...row, slug });
    if (error) return { error: 'Could not save the class.' };
  }
  revalidatePath('/admin/on-demand');
  revalidatePath('/train');
  return { ok: true };
}

export async function setVideoStatus(f: FormData) {
  await requireStaff('content');
  const supabase = await createClient();
  const { error } = await supabase.from('video_classes').update({ status: z.enum(['draft', 'published', 'hidden']).parse(f.get('status')) }).eq('id', z.string().uuid().parse(f.get('id')));
  revalidatePath('/admin/on-demand');
  revalidatePath('/train');
  redirect(`/admin/on-demand?${error ? 'error=1' : 'ok=status'}`);
}

export async function deleteVideoClass(f: FormData) {
  await requireStaff('content');
  const supabase = await createClient();
  const id = z.string().uuid().parse(f.get('id'));
  const { data: v } = await supabase.from('video_classes').select('video_path, cover_path').eq('id', id).maybeSingle();
  const { error, count } = await supabase.from('video_classes').delete({ count: 'exact' }).eq('id', id);
  if (!error && count) {
    if (v?.video_path) await supabase.storage.from('class-videos').remove([v.video_path]);
    if (v?.cover_path) await supabase.storage.from('class-covers').remove([v.cover_path]);
  }
  revalidatePath('/admin/on-demand');
  redirect(`/admin/on-demand?${error || !count ? 'error=1' : 'ok=deleted'}`);
}
