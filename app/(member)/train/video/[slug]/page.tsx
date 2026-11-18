import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { requireHealthCheck } from '@/lib/health/gate';
import { hasOnDemand } from '@/lib/auth/access';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_STYLES, coverUrl, embedFor } from '@/lib/video';
import { recordVideoCompletion } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function VideoClass({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser(`/train/video/${slug}`);
  await requireHealthCheck(`/train/video/${slug}`);
  const supabase = await createClient();
  const { data: v } = await supabase.from('video_classes').select('*, instructors(display_name, slug)').eq('slug', slug).maybeSingle();
  if (!v) notFound();
  if (!v.free && !(await hasOnDemand())) redirect('/you/membership');
  // Uploaded files are private: a short-lived link, only issued if the storage policy agrees this member can watch.
  const signed = v.video_path ? (await supabase.storage.from('class-videos').createSignedUrl(v.video_path, 60 * 60 * 3)).data?.signedUrl : null;
  const embed = v.video_url ? embedFor(v.video_url) : null;
  const teacher = v.instructors as { display_name: string; slug: string } | null;
  return (
    <main className="page space-y-4">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div className="aspect-video w-full overflow-hidden border border-stone bg-black">
        {signed ? <video src={signed} poster={coverUrl(v.cover_path) ?? undefined} controls playsInline preload="metadata" className="h-full w-full" />
          : embed ? <iframe src={embed} title={v.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
          : v.video_url ? <video src={v.video_url} poster={coverUrl(v.cover_path) ?? undefined} controls playsInline className="h-full w-full" />
          : <p className="p-6 text-muted">This class is not available right now.</p>}
      </div>
      <div>
        <h1 className="text-[28px] leading-none">{v.title}</h1>
        <p className="mt-2 text-muted">{v.minutes} min · {v.level} · {VIDEO_STYLES[v.style]}{teacher ? <> · with <Link href={`/instructors/${teacher.slug}`} className="underline">{teacher.display_name}</Link></> : null}</p>
        {v.equipment?.length > 0 && <p className="mt-1 text-sm text-muted">You need: {v.equipment.join(', ')}</p>}
        {v.description && <p className="mt-3 max-w-[60ch]">{v.description}</p>}
      </div>
      <form action={recordVideoCompletion}><input type="hidden" name="slug" value={v.slug} />
        <button className="inline-flex min-h-[48px] items-center bg-white px-6 text-sm font-bold uppercase text-black">I finished this class</button>
      </form>
    </main>
  );
}
