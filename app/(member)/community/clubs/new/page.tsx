import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { communityStatus } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { NewActivityForm } from '@/components/community/NewActivityForm';
import { TEMPLATES } from '@/lib/community/clubs';

export const metadata = { title: 'Start an activity' };
export const dynamic = 'force-dynamic';

export default async function NewActivity({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  await requireUser('/community/clubs/new');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  return (
    <CommunityShell active="/community/clubs" title="Start an activity" intro="Members arrange their own courts and share any costs directly. BAYSE provides the platform." e={sp.e}>
      <Link href="/community/clubs" className="text-sm text-muted hover:text-ink">← All activities</Link>
      <NewActivityForm t={TEMPLATES.find((x) => x.key === sp.t)} />
    </CommunityShell>
  );
}
