import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { wrap } from '@/components/site/sections';
import { publishedArticles, articleDate } from '@/lib/blog';

export const metadata = {
  title: 'Pilates guides and advice',
  description: 'Guides and articles from The BAYSE Club: Pilates for beginners, at home, through menopause, pregnancy and after birth, plus posture, core strength, nutrition and motivation.',
};
// New articles go out on their publish date, so the list is worked out on each visit.
export const dynamic = 'force-dynamic';

export default function Blog() {
  const all = publishedArticles();
  const guides = all.filter((a) => a.kind === 'guide');
  const posts = all.filter((a) => a.kind === 'post');
  return (
    <SitePage>
      <section className={`${wrap} py-10`}>
        <p className="eyebrow">The BAYSE Club</p>
        <h1 className="mt-3 text-[40px] leading-none sm:text-[56px]">Guides and advice</h1>
        <p className="mt-4 max-w-[56ch] text-lg text-muted">Straightforward help with Pilates, strength, food and keeping going, from the BAYSE studio team. New articles every Monday, Wednesday and Friday.</p>

        {guides.length > 0 && (
          <>
            <h2 className="mt-12 text-sm font-bold uppercase tracking-[0.1em]">Start here</h2>
            <ul className="mt-4 grid gap-5 md:grid-cols-3">
              {guides.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="group block h-full border border-stone hover:border-white" data-guide-card>
                    <div className="aspect-[16/10] overflow-hidden bg-surface"><img src={a.image} alt={a.imageAlt} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" /></div>
                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Guide · {a.minutes} min read</p>
                      <p className="mt-2 text-xl font-bold uppercase leading-tight">{a.title}</p>
                      <p className="mt-2 text-sm text-muted">{a.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="mt-14 text-sm font-bold uppercase tracking-[0.1em]">Latest</h2>
        <ul className="mt-4 divide-y divide-stone border-y border-stone">
          {posts.map((a) => (
            <li key={a.slug}>
              <Link href={`/blog/${a.slug}`} className="group grid gap-4 py-5 sm:grid-cols-[180px_1fr] sm:items-center" data-post-card>
                <div className="aspect-[16/10] overflow-hidden bg-surface"><img src={a.image} alt={a.imageAlt} loading="lazy" className="h-full w-full object-cover" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{a.category} · {articleDate(a)} · {a.minutes} min read</p>
                  <p className="mt-1 text-xl font-bold uppercase leading-tight group-hover:underline">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SitePage>
  );
}
