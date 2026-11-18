import { SitePage } from '@/components/site/SitePage';
import { FaqSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Questions' };

export default function FaqPage() {
  return <SitePage><FaqSection /><TrialCta /></SitePage>;
}
