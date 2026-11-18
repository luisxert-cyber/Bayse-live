import Link from 'next/link';
import { requireStudioManager } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, Wordmark } from '@/components/ui';
import { StudioLinkTable, type LinkRow } from '@/components/StudioLinkTable';

export const metadata = { title: 'My studio' };
export const dynamic = 'force-dynamic';

export default async function StudioHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { studios } = await requireStudioManager();
  const supabase = await createClient();
  const [{ data: names }, { data: pending }, { count: linked }] = await Promise.all([
    supabase.from('studios').select('name').in('id', studios),
    supabase.from('studio_memberships').select('id, tier, member_ref, status, requested_at, studios(name), profiles!studio_memberships_user_id_fkey(first_name, email)').eq('status', 'pending').order('requested_at'),
    supabase.from('studio_memberships').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
  ]);
  return (
    <main className="page-wide space-y-6">
      <div className="flex items-center justify-between"><Wordmark className="h-5" /><Link href="/today" className="text-sm text-muted hover:text-ink">Member app</Link></div>
      <div>
        <h1 className="text-xl font-semibold">{names?.map((n) => n.name).join(', ') || 'My studio'}</h1>
        <p className="text-muted">Only things that need you. Clubs, reminders and waiting lists run themselves.</p>
      </div>
      {sp.ok && <Notice tone="success">Updated.</Notice>}
      {sp.error && <Notice tone="error">That change was not allowed.</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><p className="text-sm text-muted">Waiting for you</p><p className="mt-1 font-serif text-2xl">{pending?.length ?? 0}</p></Card>
        <Card><p className="text-sm text-muted">Linked members</p><p className="mt-1 font-serif text-2xl">{linked ?? 0}</p></Card>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Studio membership requests</h2>
        <StudioLinkTable rows={(pending ?? []) as unknown as LinkRow[]} back="/studio" />
      </section>
      <p className="text-xs text-muted">Community activity, safety reports and member milestones are added here in later phases.</p>
    </main>
  );
}
