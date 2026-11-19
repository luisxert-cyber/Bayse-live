import { requireStudioManager } from '@/lib/auth/session';
import { StudioLinks } from '@/components/admin/StudioLinks';

export const metadata = { title: 'Studio member checks' };
export const dynamic = 'force-dynamic';

// For studio managers: confirm which of your studio's members have an active £99 or £148 membership.
export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { isAdmin } = await requireStudioManager();
  const sp = await searchParams;
  return <main className="page-wide"><StudioLinks back="/studio" admin={isAdmin} ok={sp.ok} error={sp.error} /></main>;
}
