import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { StudioLinkTable, type LinkRow } from '@/components/StudioLinkTable';

export const metadata = { title: 'Studio links' };
export const dynamic = 'force-dynamic';

export default async function StudioLinks({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('studio_memberships')
    .select('id, tier, member_ref, status, requested_at, studios(name), profiles!studio_memberships_user_id_fkey(first_name, email)')
    .eq('status', 'pending').order('requested_at');
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Studio links waiting</h1>
      <p className="text-sm text-muted">Confirm a member only after checking your booking system. Confirming switches on the digital access set for their tier.</p>
      {sp.ok && <Notice tone="success">Updated.</Notice>}
      {sp.error && <Notice tone="error">That change was not allowed.</Notice>}
      <StudioLinkTable rows={(data ?? []) as unknown as LinkRow[]} back="/admin/studio-links" />
    </div>
  );
}
