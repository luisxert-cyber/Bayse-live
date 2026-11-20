// Search and sharing. The public address is fixed here so links in search results never point at a preview address.
import { COMPANY, FAQS, TIERS } from '@/lib/site/offer';

export const SITE = 'https://www.thebayseclub.com';

/** Public pages that search engines should list, with how often they change. */
export const PUBLIC_PAGES: { path: string; priority: number; changes: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changes: 'weekly' },
  { path: '/pricing', priority: 0.9, changes: 'weekly' },
  { path: '/free-trial', priority: 0.9, changes: 'monthly' },
  { path: '/live-classes', priority: 0.9, changes: 'daily' },
  { path: '/classes', priority: 0.8, changes: 'weekly' },
  { path: '/programmes', priority: 0.8, changes: 'monthly' },
  { path: '/features', priority: 0.8, changes: 'monthly' },
  { path: '/benefits', priority: 0.7, changes: 'monthly' },
  { path: '/reformer', priority: 0.7, changes: 'monthly' },
  { path: '/instructors', priority: 0.7, changes: 'weekly' },
  { path: '/the-community', priority: 0.7, changes: 'monthly' },
  { path: '/who-its-for', priority: 0.7, changes: 'monthly' },
  { path: '/try', priority: 0.6, changes: 'monthly' },
  { path: '/faq', priority: 0.6, changes: 'monthly' },
  { path: '/terms', priority: 0.2, changes: 'monthly' },
  { path: '/privacy', priority: 0.2, changes: 'monthly' },
  { path: '/community-guidelines', priority: 0.2, changes: 'monthly' },
];

/** Signed-in, staff and sign-up areas: never listed in search. */
export const PRIVATE_PATHS = ['/today', '/train', '/live', '/community', '/nourish', '/you', '/admin', '/teach', '/studio', '/staff', '/join', '/start', '/auth', '/sign-in', '/devices', '/api'];

const pence = (price: string) => price.replace('£', '');

export const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': `${SITE}/#organisation`, name: 'The BAYSE Club', url: SITE, logo: `${SITE}/icons/icon-512.png`,
      description: 'Online Pilates, nutrition and personal coaching for women, from the BAYSE Reformer Pilates studio team.',
      legalName: COMPANY.name, parentOrganization: { '@type': 'Organization', name: 'BAYSE Reformer Pilates', url: 'https://www.baysereformerpilates.com' },
      areaServed: 'GB',
    },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'The BAYSE Club', inLanguage: 'en-GB', publisher: { '@id': `${SITE}/#organisation` } },
  ],
};

export const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export const pricingJsonLd = {
  '@context': 'https://schema.org', '@type': 'Product', name: 'The BAYSE Club membership',
  description: 'Online Pilates membership for women: workout builder, on-demand and live classes, nutrition, progress and personal coaching.',
  brand: { '@type': 'Brand', name: 'BAYSE' }, image: `${SITE}/og.jpg`,
  offers: TIERS.map((t) => ({
    '@type': 'Offer', name: t.name, price: pence(t.price), priceCurrency: 'GBP', url: `${SITE}/pricing`, availability: 'https://schema.org/InStock',
    description: `${t.bestFor} Billed every 28 days after a 7-day free trial.`,
  })),
};

export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
