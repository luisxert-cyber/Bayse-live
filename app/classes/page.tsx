import { SitePage } from '@/components/site/SitePage';
import { ClassesSection, TrialCta } from '@/components/site/sections';
import { getUser } from '@/lib/auth/session';
import { hasOnDemand } from '@/lib/auth/access';

export const metadata = { title: 'On-demand Pilates classes', description: 'On-demand Pilates classes for beginner, intermediate and advanced, plus a workout builder that makes a class for your time and kit in seconds. From the BAYSE studio team.' };
export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const user = await getUser().catch(() => null);
  const member = user ? await hasOnDemand() : false;
  return <SitePage><ClassesSection member={member} /><TrialCta /></SitePage>;
}
