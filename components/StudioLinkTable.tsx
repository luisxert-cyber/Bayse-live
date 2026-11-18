import { EmptyState } from '@/components/ui';
import { setLinkStatus } from '@/app/admin/actions';

export type LinkRow = { id: string; tier: string; member_ref: string | null; status: string; requested_at: string; studios: { name: string } | null; profiles: { first_name: string | null; email: string | null } | null };

const TIER: Record<string, string> = { studio_99: '£99', studio_148: '£148', other: 'Other' };

/** Shared by admin and studio managers. The database only returns rows the viewer may see and change. */
export function StudioLinkTable({ rows, back }: { rows: LinkRow[]; back: '/admin/studio-links' | '/studio' }) {
  if (!rows.length) return <EmptyState title="Nothing waiting">New studio link requests will appear here.</EmptyState>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-card border border-stone bg-surface p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{r.profiles?.first_name ?? 'Member'} <span className="text-sm font-normal text-muted">{r.profiles?.email}</span></p>
            <p className="text-sm text-muted">{r.studios?.name} · {TIER[r.tier] ?? r.tier}</p>
          </div>
          {r.member_ref && <p className="mt-1 text-sm text-muted">Booking account: {r.member_ref}</p>}
          <p className="mt-1 text-xs text-muted">Requested {new Date(r.requested_at).toLocaleDateString('en-GB')}</p>
          {r.status === 'pending' ? (
            <div className="mt-3 flex gap-2">
              <form action={setLinkStatus}><input type="hidden" name="link_id" value={r.id} /><input type="hidden" name="status" value="verified" /><input type="hidden" name="back" value={back} /><button className="min-h-tap rounded-pill bg-ink px-5 text-sm text-bg">Confirm member</button></form>
              <form action={setLinkStatus}><input type="hidden" name="link_id" value={r.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="back" value={back} /><button className="min-h-tap rounded-pill border border-stone px-5 text-sm">Not a member</button></form>
            </div>
          ) : <p className="mt-2 text-sm">{r.status}</p>}
        </li>
      ))}
    </ul>
  );
}
