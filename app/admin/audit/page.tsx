import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui';

export const metadata = { title: 'Audit log' };
export const dynamic = 'force-dynamic';

export default async function Audit() {
  await requireStaff('audit');
  const supabase = await createClient();
  const { data } = await supabase.from('audit_log').select('id, actor_id, action, entity, entity_id, created_at').order('created_at', { ascending: false }).limit(100);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Audit log</h1>
      <p className="text-sm text-muted">Role changes, studio verifications, flag changes and account deletions. Latest 100.</p>
      {!data?.length ? <EmptyState title="No entries yet" /> : (
        <div className="overflow-x-auto rounded-card border border-stone bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">What</th><th className="px-4 py-3 font-medium">Record</th><th className="px-4 py-3 font-medium">By</th></tr></thead>
            <tbody className="divide-y divide-stone">
              {data.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted">{new Date(a.created_at).toLocaleString('en-GB')}</td>
                  <td className="px-4 py-2.5">{a.action} {a.entity.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{a.entity_id?.slice(0, 8)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{a.actor_id ? a.actor_id.slice(0, 8) : 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
