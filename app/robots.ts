import type { MetadataRoute } from 'next';
import { SITE, PRIVATE_PATHS } from '@/lib/site/seo';

// Search engines may list the public website. Member, staff, sign-up and payment areas are kept out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS.map((p) => `${p}/`).concat(PRIVATE_PATHS) }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
