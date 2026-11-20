import { SitePage } from '@/components/site/SitePage';
import { LiveSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Live Pilates classes online', description: 'Up to 27 live 40-minute Pilates classes a week on Zoom with BAYSE instructors: mat, sculpt, mobility, beginners, prenatal and more. See the timetable and book with a 7-day free trial.' };

export default function LivePage() {
  return <SitePage><LiveSection /><TrialCta /></SitePage>;
}
