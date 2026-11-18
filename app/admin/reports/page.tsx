import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { resolveReport } from './actions';

export const metadata = { title: 'Reports' };
export const dynamic = 'force-dynamic';

const TABLE: Record<string, [string, string]> = { post: ['posts', 'body'], comment: ['comments', 'body'], activity_message: ['activity_messages', 'body'], activity: ['activities', 'title'] };

export default async function Reports() {
  await requireStaff('reports');
  const supabase = await createClient();
  const { data: reports } = await supabase.from('reports').select('*').eq('status', 'open').order('created_at').limit(100);
  const preview = new Map<string, string>();
  for (const [type, [table, col]] of Object.entries(TABLE)) {
    const ids = (reports ?? []).filter((r) => r.target_type === type).map((r) => r.target_id);
    if (!ids.length) continue;
    const { data } = await supabase.from(table).select(`id, ${col}`).in('id', ids);
    for (const row of (data ?? []) as unknown as Record<string, string>[]) preview.set(row.id, row[col]);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Community reports</h1>
      <p className="max-w-[70ch] text-sm text-muted">Reports from members about posts, replies, activities and chat messages. Hiding removes the content for everyone except its author. Every decision is recorded in the audit log.</p>
      {(reports ?? []).length ? (
        <ul className="space-y-3">
          {(reports ?? []).map((r) => (
            <li key={r.id} className="rounded-2xl border border-stone bg-surface p-4 text-sm">
              <p className="font-semibold">{r.reason} · {r.target_type.replace('_', ' ')} · {new Date(r.created_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
              <blockquote className="mt-2 whitespace-pre-wrap rounded-xl bg-bg px-3 py-2">{preview.get(r.target_id) ?? (r.target_type === 'profile' ? 'A member profile' : 'Content no longer available')}</blockquote>
              {r.details && <p className="mt-2 text-muted">Reporter says: {r.details}</p>}
              <form action={resolveReport} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={r.id} /><input type="hidden" name="target_type" value={r.target_type} /><input type="hidden" name="target_id" value={r.target_id} />
                <input name="note" maxLength={1000} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-[10px] border border-stone bg-bg px-3 py-2" />
                {r.target_type !== 'profile' && <button name="action" value="hide" className="rounded-full bg-ink px-4 py-2 font-bold text-bg">Hide content</button>}
                <button name="action" value="actioned" className="rounded-full border border-stone px-4 py-2">Mark handled</button>
                <button name="action" value="dismiss" className="rounded-full border border-stone px-4 py-2">Dismiss</button>
              </form>
            </li>
          ))}
        </ul>
      ) : <p className="rounded-2xl border border-dashed border-stone px-4 py-8 text-center text-muted">No open reports.</p>}
    </div>
  );
}
