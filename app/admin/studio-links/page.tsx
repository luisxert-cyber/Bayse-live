import { requireStaff } from '@/lib/auth/session';
import { StudioLinks } from '@/components/admin/StudioLinks';

export const metadata = { title: 'Studio member checks' };
export const dynamic = 'force-dynamic';

export default async function StudioLinksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { isAdmin } = await requireStaff('plans');
  const sp = await searchParams;
  return <StudioLinks back="/admin/studio-links" admin={isAdmin} ok={sp.ok} error={sp.error} />;
}
