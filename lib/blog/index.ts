import type { Article } from './types';
import { GUIDES } from './posts/guides';
import { POSTS_2026_11 } from './posts/2026-11';
import { POSTS_2026_12 } from './posts/2026-12';

// Every guide and post, newest first. Add each new month's file here.
export const ALL_ARTICLES: Article[] = [...GUIDES, ...POSTS_2026_11, ...POSTS_2026_12].sort((a, b) => b.publishAt.localeCompare(a.publishAt));

/** Articles that have reached their publish time. */
export const publishedArticles = (now: Date = new Date()) => ALL_ARTICLES.filter((a) => new Date(a.publishAt).getTime() <= now.getTime());
export const findArticle = (slug: string, now: Date = new Date()) => publishedArticles(now).find((a) => a.slug === slug);
export const articleDate = (a: Article) => new Date(a.publishAt).toLocaleDateString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric' });

/** Other published pieces to read next: same category first. */
export function relatedArticles(a: Article, n = 3, now: Date = new Date()) {
  const others = publishedArticles(now).filter((x) => x.slug !== a.slug);
  return [...others.filter((x) => x.category === a.category), ...others.filter((x) => x.category !== a.category)].slice(0, n);
}
