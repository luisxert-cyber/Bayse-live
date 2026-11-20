// The BAYSE Club blog and guides. Each piece is plain text in a simple format:
//   "## Heading" starts a section, "- " starts a list item, a blank line ends a paragraph,
//   and [words](/path) makes a link to another page of the site.
// A piece appears on the site, in the sitemap and to search engines from its `publishAt` time onwards,
// so articles can be written ahead and go out on their day (Monday, Wednesday and Friday at 7am).
export type Article = {
  slug: string;
  kind: 'guide' | 'post';
  title: string;
  /** Shown in search results: one or two sentences, about 150 characters. */
  description: string;
  /** The search this piece is written to answer. */
  keyword: string;
  category: 'Getting started' | 'Pilates at home' | 'Strength and posture' | 'Life stages' | 'Nutrition' | 'Motivation';
  publishAt: string; // ISO date-time
  minutes: number;
  image: string;
  imageAlt: string;
  body: string;
  faq?: { q: string; a: string }[];
  /** Where to send the reader next. */
  cta: { label: string; href: string };
  /** Health topics carry this note under the title. */
  healthNote?: string;
};

export const GENERAL_NOTE = 'This article is general information, not medical advice. If you have an injury, a health condition or any concern, check with your GP or physiotherapist before you start.';
