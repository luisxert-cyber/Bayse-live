import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';
import { setLinkStatus, reconfirmLink } from '@/app/admin/actions';

// Studio membership checks, used by admins (/admin/studio-links) and studio managers (/studio).
// The database decides which rows each person sees and may change: admins see every studio,
// a studio manager only their own. Verifying a link is what switches on included Foundation
// access and the half-price upgrades; ending it starts the member's 28-day notice.

type Row = {
  id: string; user_id: string; tier: string; status: string; member_ref: string | null;
  requested_at: string; verified_at: string | null; verified_until: string | null; ended_at: string | null;
  studios: { name: string } | null; profiles: { first_name: string | null; display_name: string | null; email: string | null } | null;
};

const TIER: Record<string, string> = { studio_99: '£99 membership', studio_148: '£148 membership', other: 'Other membership' };
const d = (iso: string | null) => (iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' }).format(new Date(iso)) : '—');
const today = () => new Date().toISOString().slice(0, 10);

const MESSAGES: Record<string, [tone: 'success' | 'error' | 'warning', text: string]> = {
  verified: ['success', 'Verified. Included Foundation access and member prices are now on for this member.'],
  reconfirmed: ['success', 'Re-confirmed for another 90 days.'],
  rejected: ['success', 'Request declined.'],
  ended: ['success', 'Ended. Included access runs for 28 more days, and any half-price membership is set to finish at the end of its paid period.'],
  ended_check_billing: ['warning', 'Ended, but the member’s half-price membership could not be set to finish in Stripe. Check it in Stripe before their next payment.'],
};

function Action({ id, status, label, back, tone = 'secondary' }: { id: string; status: string; label: string; back: string; tone?: 'primary' | 'secondary' }) {
  return (
    <form action={setLinkStatus}>
      <input type="hidden" name="link_id" value={id} /><input type="hidden" name="status" value={status} /><input type="hidden" name="back" value={back} />
      <button className={buttonClass(tone)}>{label}</button>
    </form>
  );
}

export async function StudioLinks({ back, admin, ok, error }: { back: '/admin/studio-links' | '/studio'; admin: boolean; ok?: string; error?: string }) {
  const supabase = await createClient();
  const [{ data }, { data: breakdown }] = await Promise.all([
    supabase.from('studio_memberships')
      .select('id, user_id, tier, status, member_ref, requested_at, verified_at, verified_until, ended_at, studios(name), profiles!studio_memberships_user_id_fkey(first_name, display_name, email)')
      .order('requested_at', { ascending: false }).limit(500),
    admin ? supabase.rpc('admin_studio_breakdown') : Promise.resolve({ data: null }),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const now = today();
  const pending = rows.filter((r) => r.status === 'pending');
  const due = rows.filter((r) => r.status === 'verified' && r.verified_until !== null && r.verified_until < now);
  const active = rows.filter((r) => r.status === 'verified' && !(r.verified_until !== null && r.verified_until < now));
  const ended = rows.filter((r) => r.status === 'ended' || r.status === 'rejected');
  const b = breakdown as null | {
    complimentary_foundation?: number; studio_upgrades?: number; online_only?: number; in_notice?: number;
    discount_without_eligibility?: number; by_plan?: Array<{ plan: string; online: number; studio: number }>;
  };
  const msg = ok ? MESSAGES[ok] : null;

  const who = (r: Row) => r.profiles?.first_name ?? r.profiles?.display_name ?? 'Member';
  const line = (r: Row) => (
    <div className="min-w-0">
      <p className="font-medium">{admin ? <Link href={`/admin/members/${r.user_id}`} className="hover:underline">{who(r)}</Link> : who(r)} · {r.studios?.name ?? 'Studio'}</p>
      <p className="break-words text-muted">{r.profiles?.email ?? 'No email'} · says {TIER[r.tier] ?? r.tier}{r.member_ref ? ` · “${r.member_ref}”` : ''}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Studio member checks</h1>
      <p className="text-sm text-muted">Check each person against your studio booking system before you verify them: an active £99 or £148 membership, not just a matching email. Verified members get BAYSE Foundation free and half price on Inner Circle and Black.</p>
      {msg && <Notice tone={msg[0]}>{msg[1]}</Notice>}
      {error && <Notice tone="error">That change was not saved. You can only change members of your own studio.</Notice>}

      {b && (
        <Card>
          <p className="eyebrow">Online and studio members</p>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-muted">Free Foundation (studio)</dt><dd className="text-lg font-semibold">{b.complimentary_foundation ?? 0}</dd></div>
            <div><dt className="text-muted">Studio paid upgrades</dt><dd className="text-lg font-semibold">{b.studio_upgrades ?? 0}</dd></div>
            <div><dt className="text-muted">Online-only subscribers</dt><dd className="text-lg font-semibold">{b.online_only ?? 0}</dd></div>
            <div><dt className="text-muted">In 28-day notice</dt><dd className="text-lg font-semibold">{b.in_notice ?? 0}</dd></div>
          </dl>
          {(b.by_plan ?? []).length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted">{(b.by_plan ?? []).map((p) => <li key={p.plan}>{p.plan}: {p.online} online · {p.studio} studio member</li>)}</ul>
          )}
          {(b.discount_without_eligibility ?? 0) > 0 && <Notice tone="warning" title="Needs attention">{b.discount_without_eligibility} member(s) are paying a studio price without an in-date verified studio membership. Re-confirm or end their link below.</Notice>}
        </Card>
      )}

      <Card>
        <p className="eyebrow">Waiting for you · {pending.length}</p>
        <ul className="mt-2 divide-y divide-stone text-sm">
          {pending.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              {line(r)}
              <div className="flex gap-2"><Action id={r.id} status="verified" label="Verify" back={back} tone="primary" /><Action id={r.id} status="rejected" label="Decline" back={back} /></div>
            </li>
          ))}
          {!pending.length && <li className="py-2 text-muted">No requests waiting.</li>}
        </ul>
      </Card>

      <Card>
        <p className="eyebrow">Re-check due · {due.length}</p>
        <p className="mt-1 text-sm text-muted">Verified more than 90 days ago. Included access stops 28 days after the re-check date unless you re-confirm.</p>
        <ul className="mt-2 divide-y divide-stone text-sm">
          {due.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>{line(r)}<p className="text-muted">Re-check was due {d(r.verified_until)}</p></div>
              <div className="flex gap-2">
                <form action={reconfirmLink}><input type="hidden" name="link_id" value={r.id} /><input type="hidden" name="back" value={back} /><button className={buttonClass('primary')}>Still a member</button></form>
                <Action id={r.id} status="ended" label="Membership ended" back={back} />
              </div>
            </li>
          ))}
          {!due.length && <li className="py-2 text-muted">Nothing due.</li>}
        </ul>
      </Card>

      <Card>
        <p className="eyebrow">Verified studio members · {active.length}</p>
        <ul className="mt-2 divide-y divide-stone text-sm">
          {active.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>{line(r)}<p className="text-muted">Verified {d(r.verified_at)} · re-check by {d(r.verified_until)}</p></div>
              <Action id={r.id} status="ended" label="Membership ended" back={back} />
            </li>
          ))}
          {!active.length && <li className="py-2 text-muted">No verified studio members yet.</li>}
        </ul>
      </Card>

      {ended.length > 0 && (
        <Card>
          <p className="eyebrow">Ended or declined · {ended.length}</p>
          <ul className="mt-2 divide-y divide-stone text-sm">
            {ended.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>{line(r)}<p className="text-muted">{r.status === 'ended' ? `Ended ${d(r.ended_at)}` : 'Declined'}</p></div>
                <Action id={r.id} status="verified" label="Verify again" back={back} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
