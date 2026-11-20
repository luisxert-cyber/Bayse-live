import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SitePage } from '@/components/site/SitePage';
import { ArticleBody } from '@/components/site/ArticleBody';
import { findArticle, relatedArticles, articleDate } from '@/lib/blog';
import { SITE, jsonLd } from '@/lib/site/seo';

// Articles appear on their publish date, so each visit checks the time.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = findArticle((await params).slug);
  if (!a) return { title: 'Article not found', robots: { index: false } };
  return {
    title: a.title, description: a.description, keywords: [a.keyword],
    openGraph: { type: 'article', title: a.title, description: a.description, url: `${SITE}/blog/${a.slug}`, publishedTime: a.publishAt, images: [{ url: '/og.jpg', width: 1200, height: 630 }] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  const related = relatedArticles(a);
  const url = `${SITE}/blog/${a.slug}`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', headline: a.title, description: a.description, image: `${SITE}${a.image}`, datePublished: a.publishAt, dateModified: a.publishAt,
        mainEntityOfPage: url, inLanguage: 'en-GB',
        author: { '@type': 'Organization', name: 'The BAYSE Club', url: SITE },
        publisher: { '@type': 'Organization', name: 'The BAYSE Club', logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` } },
      },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Guides and advice', item: `${SITE}/blog` }, { '@type': 'ListItem', position: 2, name: a.title, item: url }] },
      ...(a.faq?.length ? [{ '@type': 'FAQPage', mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
    ],
  };
  return (
    <SitePage>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />
      <article className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6" data-article>
        <Link href="/blog" className="text-sm text-muted hover:text-ink">← Guides and advice</Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{a.kind === 'guide' ? 'Guide' : a.category} · {articleDate(a)} · {a.minutes} min read</p>
        <h1 className="mt-3 text-[34px] leading-[1.02] sm:text-[48px]">{a.title}</h1>
        <p className="mt-4 text-lg text-muted">{a.description}</p>
        <p className="mt-3 text-sm text-muted">By the BAYSE studio team</p>
        <div className="mt-6 aspect-[16/9] overflow-hidden border border-stone bg-surface"><img src={a.image} alt={a.imageAlt} className="h-full w-full object-cover" /></div>
        {a.healthNote && <p className="mt-6 border-l-2 border-white pl-4 text-sm text-muted">{a.healthNote}</p>}
        <div className="mt-8"><ArticleBody body={a.body} /></div>

        {a.faq && a.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[24px] sm:text-[28px]">Common questions</h2>
            <div className="mt-4 divide-y divide-stone border-y border-stone">
              {a.faq.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{f.q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span></summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 border border-white p-6 text-center">
          <p className="eyebrow">The BAYSE Club</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-2xl font-bold uppercase leading-tight">Pilates, nutrition &amp; personal coaching for women</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-sm text-muted">Live classes on Zoom, a workout builder, programmes that build week by week and a community to do it with. 7 days free, cancel any time.</p>
          <Link href={a.cta.href} className="mt-5 inline-flex min-h-[48px] items-center justify-center bg-white px-6 text-sm font-bold uppercase text-black hover:opacity-90">{a.cta.label}</Link>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Read next</h2>
            <ul className="mt-3 divide-y divide-stone border-y border-stone">
              {related.map((r) => <li key={r.slug}><Link href={`/blog/${r.slug}`} className="flex items-center justify-between gap-4 py-3 hover:underline"><span className="font-semibold">{r.title}</span><span aria-hidden>›</span></Link></li>)}
            </ul>
          </section>
        )}
      </article>
    </SitePage>
  );
}
