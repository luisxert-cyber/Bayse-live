import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui';

export const metadata = { title: 'Members' };
export const dynamic = 'force-dynamic';

export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('profiles').select('id, email, first_name, display_name, created_at, onboarding_completed_at, studios:home_studio_id(name)').order('created_at', { ascending: false }).limit(50);
  const term = q.trim().replace(/[%,()]/g, '').slice(0, 60);
  if (term) query = query.or(`email.ilike.%${term}%,first_name.ilike.%${term}%,display_name.ilike.%${term}%`);
  const { data } = await query;
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Members</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or email" className="min-h-tap flex-1 rounded-2xl border border-stone bg-surface px-4" />
        <button className="rounded-pill border border-stone bg-surface px-5 text-sm">Search</button>
      </form>
      {!data?.length ? <EmptyState title="No members found" /> : (
        <div className="overflow-x-auto rounded-card border border-stone bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Studio</th><th className="px-4 py-3 font-medium">Onboarded</th></tr></thead>
            <tbody className="divide-y divide-stone">
              {data.map((m: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <tr key={m.id} className="hover:bg-stone/20">
                  <td className="px-4 py-3"><Link href={`/admin/members/${m.id}`} className="underline-offset-2 hover:underline">{m.first_name ?? m.display_name ?? 'No name yet'}</Link></td>
                  <td className="px-4 py-3 text-muted">{m.email ?? 'Not set (guest)'}</td>
                  <td className="px-4 py-3 text-muted">{m.studios?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{m.onboarding_completed_at ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
