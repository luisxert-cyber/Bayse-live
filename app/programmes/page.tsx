import { SitePage } from '@/components/site/SitePage';
import { PlansSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Pilates programmes for every stage of life', description: 'Guided Pilates programmes that build week by week: beginners, over 50s, perimenopause and menopause, postnatal, prenatal and low-impact at home.' };

export default function ProgrammesPage() {
  return <SitePage><PlansSection /><TrialCta /></SitePage>;
}
