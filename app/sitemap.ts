import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE, PUBLIC_PAGES } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

// The public pages, plus a page for each published instructor.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PUBLIC_PAGES.map((p) => ({ url: `${SITE}${p.path === '/' ? '' : p.path}`, lastModified: now, changeFrequency: p.changes, priority: p.priority }));
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('instructors').select('slug, updated_at').eq('status', 'published').eq('active', true);
    for (const t of data ?? []) pages.push({ url: `${SITE}/instructors/${t.slug}`, lastModified: t.updated_at ? new Date(t.updated_at as string) : now, changeFrequency: 'monthly', priority: 0.5 });
  } catch { /* the fixed pages are enough */ }
  return pages;
}
