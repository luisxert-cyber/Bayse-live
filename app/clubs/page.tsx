import { SitePage } from '@/components/site/SitePage';
import { PeopleSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Community and Clubs' };

export default function ClubsPage() {
  return <SitePage><PeopleSection /><TrialCta /></SitePage>;
}
