import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/auth/session';
import { Card, Notice, buttonClass } from '@/components/ui';
import { grantRole, revokeRole } from '../../actions';

export const dynamic = 'force-dynamic';

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
    supabase.from('subscriptions').select('status, current_period_end, plans(name)').eq('user_id', id),
    supabase.from('entitlements').select('entitlement_key, source').eq('user_id', id),
    supabase.from('studios').select('id, name').order('name'),
    supabase.from('health_declarations').select('created_at, expires_at, any_yes, signed_name, agreement_version').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!p) notFound();
  const grantable = isSuper ? Object.keys(ROLE_LABEL) : ['instructor', 'moderator', 'studio_manager', 'virtual_assistant'];
  return (
    <div className="space-y-5">
      <Link href="/admin/members" className="text-sm text-muted hover:text-ink">← Members</Link>
      <h1 className="text-xl font-semibold">{p.first_name ?? p.display_name ?? 'Member'}</h1>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">{sp.error === 'studio' ? 'Choose a studio for a studio manager.' : 'That change is not allowed for your role.'}</Notice>}
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
          {(subs ?? []).map((s: any, i) => <li key={i}>{s.plans?.name ?? 'Plan'} · {s.status}</li>)}{/* eslint-disable-line @typescript-eslint/no-explicit-any */}
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
