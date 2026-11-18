import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { wrap, PHOTO, TrialCta } from '@/components/site/sections';
import { REFORMER_SAFETY, REFORMER_WHAT } from '@/lib/reformer';
import { coverUrl } from '@/lib/video';

export const metadata = { title: 'Reformer at home', description: 'Have a reformer at home? On-demand reformer classes from the BAYSE studio team, with spring guidance for every section.' };
export const dynamic = 'force-dynamic';

export default async function ReformerAtHome() {
  const supabase = await createClient();
  const { data: classes } = await supabase.from('video_classes').select('slug, title, minutes, level, cover_path, instructors(display_name)').eq('status', 'published').eq('style', 'reformer').order('sort').limit(9);
  return (
    <SitePage>
      <PageHero eyebrow="Reformer at home" title="Have a bed at home?" intro="Bring the BAYSE studio into your living room. On-demand reformer classes from our studio instructors, with spring settings for every section." image={PHOTO.hero} />

      <section className={`${wrap} py-12`}>
        <dl className="grid gap-px border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-4">
          {REFORMER_WHAT.map(([t, d]) => <div key={t} className="bg-bg p-5"><dt className="font-bold uppercase">{t}</dt><dd className="mt-2 text-sm text-muted">{d}</dd></div>)}
        </dl>
      </section>

      <section className={`${wrap} pb-12`}>
        <h2 className="text-[30px] sm:text-[40px]">Reformer classes</h2>
        {classes && classes.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <li key={c.slug} className="border border-stone" data-reformer-class>
                <div className="aspect-video bg-surface">{c.cover_path && <img src={coverUrl(c.cover_path)!} alt="" className="h-full w-full object-cover" />}</div>
                <div className="p-3"><p className="font-bold uppercase">{c.title}</p><p className="text-sm text-muted">{c.minutes} min · {c.level}{(c.instructors as unknown as { display_name: string } | null)?.display_name ? ` · ${(c.instructors as unknown as { display_name: string }).display_name}` : ''}</p></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 border border-dashed border-stone p-8 text-center text-muted">Our first reformer classes are being filmed in the studio now. They’ll appear here, and in the app, as soon as they’re ready.</p>
        )}
        <p className="mt-3 text-sm text-muted">Included in every plan, alongside the mat classes, your plan and everything else. <Link href="/pricing" className="underline">See pricing</Link></p>
      </section>

      <section className={`${wrap} pb-12`}>
        <div className="border-2 border-white p-6 sm:p-10">
          <p className="eyebrow">Training safely on your reformer</p>
          <h2 className="mt-3 text-[28px] sm:text-[36px]">Before you start</h2>
          <ul className="mt-5 space-y-3">{REFORMER_SAFETY.map((s) => <li key={s} className="flex gap-3 text-[15px]"><span aria-hidden>✓</span>{s}</li>)}</ul>
          <p className="mt-5 text-xs text-muted">No reformer? Every other class in The BAYSE Club needs just a mat.</p>
        </div>
      </section>
      <TrialCta />
    </SitePage>
  );
}
