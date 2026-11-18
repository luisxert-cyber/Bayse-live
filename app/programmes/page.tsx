import { SitePage } from '@/components/site/SitePage';
import { PlansSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Programmes' };

export default function ProgrammesPage() {
  return <SitePage><PlansSection /><TrialCta /></SitePage>;
}
