import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/auth/session';
import { Card, Notice, buttonClass } from '@/components/ui';
import { fmtDate } from '@/lib/data/member';
import { grantRole, revokeRole, staffCancelMembership } from '../../actions';

export const dynamic = 'force-dynamic';

const LIVE = ['trialing', 'active', 'past_due', 'unpaid', 'paused'];
const STATUS_LABEL: Record<string, string> = { trialing: 'free trial', active: 'active', past_due: 'payment failed', unpaid: 'unpaid', paused: 'paused', canceled: 'cancelled', incomplete: 'payment not finished', incomplete_expired: 'never started' };
const pounds = (pence: string | undefined) => (Number(pence) > 0 ? `£${(Number(pence) / 100).toFixed(2)}` : '');
const CANCEL_ERRORS: Record<string, string> = {
  studio: 'Choose a studio for a studio manager.',
  cancel_confirm: 'Nothing was cancelled. Choose when it should end and tick the box to confirm.',
  cancel_none: 'That membership has already ended, so there was nothing to cancel.',
  cancel_failed: 'The membership could not be cancelled because Stripe refused the request. Nothing has changed. Cancel it in Stripe, or try again.',
};

type Sub = { id: string; status: string; trial_end: string | null; current_period_end: string | null; cancel_at_period_end: boolean; cancel_at: string | null; plans: { name: string } | null };

const ROLE_LABEL: Record<string, string> = { instructor: 'Instructor', moderator: 'Community moderator', studio_manager: 'Studio manager', virtual_assistant: 'Virtual assistant', admin: 'Administrator', super_admin: 'Super administrator' };

export default async function Member({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { isSuper, isAdmin } = await requireStaff('members');
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: p }, { data: roles }, { data: links }, { data: subs }, { data: ents }, { data: studios }, { data: health }] = await Promise.all([
    supabase.from('profiles').select('id, email, first_name, display_name, created_at, onboarding_completed_at, studios:home_studio_id(name)').eq('id', id).maybeSingle(),
    supabase.from('user_roles').select('id, role, studio_id, studios(name)').eq('user_id', id),
    supabase.from('studio_memberships').select('status, tier, studios(name)').eq('user_id', id),
    supabase.from('subscriptions').select('id, status, trial_end, current_period_end, cancel_at_period_end, cancel_at, plans(name)').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('entitlements').select('entitlement_key, source').eq('user_id', id),
    supabase.from('studios').select('id, name').order('name'),
    supabase.from('health_declarations').select('created_at, expires_at, any_yes, signed_name, agreement_version').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!p) notFound();
  const memberships = (subs ?? []) as unknown as Sub[];
  const okMessage: Record<string, string> = {
    cancel_end: 'Membership cancelled. No more payments will be taken and it ends on the date shown below.',
    cancel_now: 'Membership ended. Nothing was refunded.',
    cancel_refunded: `Membership ended and ${pounds(sp.amount) || 'the last payment'} refunded to the member’s card. Refunds take 5 to 10 days to arrive.`,
    cancel_nopayment: 'Membership ended. There was no payment to refund.',
  };
  const grantable = isSuper ? Object.keys(ROLE_LABEL) : ['instructor', 'moderator', 'studio_manager', 'virtual_assistant'];
  return (
    <div className="space-y-5">
      <Link href="/admin/members" className="text-sm text-muted hover:text-ink">← Members</Link>
      <h1 className="text-xl font-semibold">{p.first_name ?? p.display_name ?? 'Member'}</h1>
      {sp.ok === 'cancel_norefund'
        ? <Notice tone="warning" title="Membership ended, but the refund did not go through">Make the refund in Stripe from the member’s last payment.</Notice>
        : sp.ok && <Notice tone="success">{okMessage[sp.ok] ?? 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">{CANCEL_ERRORS[sp.error] ?? 'That change is not allowed for your role.'}</Notice>}
      <Card>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Email</dt><dd>{p.email ?? 'Guest (no account yet)'}</dd></div>
          <div><dt className="text-muted">Display name</dt><dd>{p.display_name ?? '—'}</dd></div>
          <div><dt className="text-muted">Home studio</dt><dd>{(p as any).studios?.name ?? '—'}</dd></div>{/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          <div><dt className="text-muted">Joined</dt><dd>{new Date(p.created_at).toLocaleDateString('en-GB')}</dd></div>
          {isAdmin && <div className="sm:col-span-2"><dt className="text-muted">Health check and safety agreement</dt><dd>{health ? `Signed by “${health.signed_name}” on ${new Date(health.created_at).toLocaleDateString('en-GB')} (${health.agreement_version})${new Date(health.expires_at) < new Date() ? ' · expired' : ''}${health.any_yes ? ' · told us about a health condition and confirmed medical advice' : ' · no health conditions declared'}` : 'Not completed yet'}</dd></div>}
        </dl>
        <p className="mt-4 text-xs text-muted">Wellness and allergy information is private to the member and is not shown here.</p>
      </Card>
      <Card>
        <p className="eyebrow">Membership</p>
        <ul className="mt-2 space-y-1 text-sm">
          {memberships.map((s) => {
            const live = LIVE.includes(s.status);
            const ending = live && (s.cancel_at ?? (s.cancel_at_period_end ? s.current_period_end : null));
            const paidUntil = (s.status === 'trialing' ? s.trial_end : null) ?? s.current_period_end;
            return (
              <li key={s.id}>
                {s.plans?.name ?? 'Plan'} · {STATUS_LABEL[s.status] ?? s.status}
                {ending ? ` · cancelled, ends ${fmtDate(ending)}` : live && paidUntil ? ` · ${s.status === 'trialing' ? 'first payment' : 'next payment'} ${fmtDate(paidUntil)}` : ''}
                {isAdmin && live && (
                  <details className="mt-2 rounded-2xl border border-stone p-3" data-staff-cancel>
                    <summary className="cursor-pointer text-clay">{ending ? 'End this membership sooner' : 'Cancel this membership'}</summary>
                    <form action={staffCancelMembership} className="mt-3 space-y-3">
                      <input type="hidden" name="user_id" value={id} />
                      <input type="hidden" name="subscription_id" value={s.id} />
                      <fieldset className="space-y-2">
                        <legend className="text-muted">When should it end?</legend>
                        {!ending && <label className="flex items-start gap-2"><input type="radio" name="when" value="period_end" defaultChecked className="mt-1" /><span>{s.status === 'trialing' ? 'When the free trial ends' : 'When the time already paid for runs out'}{paidUntil ? ` (${fmtDate(paidUntil)})` : ''}. No more payments are taken.</span></label>}
                        <label className="flex items-start gap-2"><input type="radio" name="when" value="now" defaultChecked={Boolean(ending)} className="mt-1" /><span>Now. Access stops straight away and nothing is refunded.</span></label>
                        {s.status !== 'trialing' && <label className="flex items-start gap-2"><input type="radio" name="when" value="now_refund" className="mt-1" /><span>Now, and refund their last payment to their card.</span></label>}
                      </fieldset>
                      <label className="flex items-start gap-2"><input type="checkbox" name="sure" required className="mt-1" /><span>I am sure. This cannot be undone from here.</span></label>
                      <button className={buttonClass('danger')}>Cancel membership</button>
                    </form>
                  </details>
                )}
              </li>
            );
          })}
          {(links ?? []).map((l: any, i) => <li key={`l${i}`}>{l.studios?.name} studio link · {l.tier.replace('studio_', '£')} · {l.status}</li>)}{/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          {!subs?.length && !links?.length && <li className="text-muted">None</li>}
        </ul>
        <p className="mt-3 text-sm text-muted">Access: {ents?.length ? [...new Set(ents.map((e) => e.entitlement_key))].join(', ') : 'none'}</p>
      </Card>
      {isAdmin && <Card>
        <p className="eyebrow">Roles</p>
        <ul className="mt-2 divide-y divide-stone">
          {(roles ?? []).map((r: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <li key={r.id} className="flex items-center justify-between py-2 text-sm">
              <span>{ROLE_LABEL[r.role]}{r.studios?.name ? ` · ${r.studios.name}` : ''}</span>
              <form action={revokeRole}><input type="hidden" name="role_id" value={r.id} /><input type="hidden" name="user_id" value={id} /><button className="text-clay hover:underline">Remove</button></form>
            </li>
          ))}
          {!roles?.length && <li className="py-2 text-sm text-muted">Member (no staff roles)</li>}
        </ul>
        <form action={grantRole} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="user_id" value={id} />
          <select name="role" className="min-h-tap rounded-2xl border border-stone bg-surface px-3 text-sm">{grantable.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
          <select name="studio_id" className="min-h-tap rounded-2xl border border-stone bg-surface px-3 text-sm"><option value="">All studios</option>{(studios ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className={buttonClass('secondary')}>Add role</button>
        </form>
      </Card>}
    </div>
  );
}
