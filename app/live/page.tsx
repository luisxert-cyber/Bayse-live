import { SitePage } from '@/components/site/SitePage';
import { LiveSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Live classes' };

export default function LivePage() {
  return <SitePage><LiveSection /><TrialCta /></SitePage>;
}
