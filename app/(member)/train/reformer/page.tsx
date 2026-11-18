import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { REFORMER_SAFETY } from '@/lib/reformer';
import { coverUrl } from '@/lib/video';

export const metadata = { title: 'Reformer at home' };
export const dynamic = 'force-dynamic';

export default async function MemberReformer() {
  await requireUser('/train/reformer');
  const supabase = await createClient();
  const { data: classes } = await supabase.from('video_classes').select('slug, title, minutes, level, cover_path, free, instructors(display_name)').eq('status', 'published').eq('style', 'reformer').order('sort').order('published_at', { ascending: false });
  return (
    <main className="page space-y-6">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[30px] leading-none">Reformer at home</h1>
        <p className="mt-2 text-muted">Have a bed at home? Studio reformer classes with spring settings for every section.</p>
      </div>
      {classes && classes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((v) => (
            <Link key={v.slug} href={`/train/video/${v.slug}`} className="block border border-stone hover:border-ink" data-reformer-class>
              <div className="aspect-video bg-surface">{v.cover_path && <img src={coverUrl(v.cover_path)!} alt="" className="h-full w-full object-cover" />}</div>
              <div className="p-3">
                <p className="font-display text-lg font-extrabold uppercase leading-tight">{v.title}</p>
                <p className="text-sm text-muted">{v.minutes} min · {v.level}{(v.instructors as unknown as { display_name: string } | null)?.display_name ? ` · ${(v.instructors as unknown as { display_name: string }).display_name}` : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-stone p-6 text-center text-sm text-muted">The first reformer classes are being filmed now. They’ll appear here as soon as they’re ready.</p>
      )}
      <details className="border border-stone p-4">
        <summary className="cursor-pointer font-bold">Training safely on your reformer</summary>
        <ul className="mt-3 space-y-2 text-sm">{REFORMER_SAFETY.map((s) => <li key={s} className="flex gap-2"><span aria-hidden>✓</span>{s}</li>)}</ul>
      </details>
    </main>
  );
}
