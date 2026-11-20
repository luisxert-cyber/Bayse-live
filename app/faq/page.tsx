import { SitePage } from '@/components/site/SitePage';
import { FaqSection, TrialCta } from '@/components/site/sections';
import { faqJsonLd, jsonLd } from '@/lib/site/seo';

export const metadata = { title: 'Questions and answers', description: 'What you need at home, whether it suits beginners, how live classes, the free trial, billing and cancelling work at The BAYSE Club.' };

export default function FaqPage() {
  return <SitePage><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd)} /><FaqSection /><TrialCta /></SitePage>;
}
