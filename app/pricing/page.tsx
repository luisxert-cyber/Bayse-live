import { SitePage } from '@/components/site/SitePage';
import { MembershipSection, CodesSection, FaqSection, TrialCta } from '@/components/site/sections';

export const metadata = { title: 'Membership' };

export default function Pricing() {
  return <SitePage><MembershipSection /><CodesSection /><FaqSection limit={5} /><TrialCta /></SitePage>;
}
