import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';
import { formatPence } from '@/lib/types';
import { setStripePrice } from '../actions';

export const metadata = { title: 'Plans and prices' };
export const dynamic = 'force-dynamic';

export default async function Plans({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('plans');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: plans }, { data: prices }, { data: map }, { data: tiers }] = await Promise.all([
    supabase.from('plans').select('id, key, name, is_hypothesis, active').order('sort'),
    supabase.from('prices').select('id, plan_id, stripe_price_id, billing_interval, amount_pence, currency, trial_days, audience').order('amount_pence', { ascending: false }),
    supabase.from('plan_entitlements').select('plan_id, entitlement_key'),
    supabase.from('studio_tier_entitlements').select('tier, entitlement_key'),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Plans and prices</h1>
      <Notice tone="success" title="Prices are confirmed">Standard: £19.99, £39.99 and £79.99 every 28 days after a 7-day free trial. Verified studio members: Foundation included, Inner Circle £19.99 and Black £39.99 (no trial). Every price needs its own Stripe price id below for checkout to work.</Notice>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">That was not saved. Price ids look like price_123.</Notice>}
      {plans?.map((plan) => (
        <Card key={plan.id}>
          <div className="flex items-baseline justify-between"><h2 className="text-lg font-semibold">{plan.name}</h2>{plan.is_hypothesis && <span className="rounded-pill bg-ochre/15 px-2.5 py-0.5 text-xs">Hypothesis</span>}</div>
          <p className="mt-1 text-sm text-muted">Includes: {(map ?? []).filter((m) => m.plan_id === plan.id).map((m) => m.entitlement_key.replace(/_/g, ' ')).join(', ')}</p>
          {(prices ?? []).filter((p) => p.plan_id === plan.id).map((p) => (
            <form key={p.id} action={setStripePrice} className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="w-56">{formatPence(p.amount_pence, p.currency)} {p.billing_interval === '28_days' ? 'every 28 days' : p.billing_interval === 'year' ? 'a year' : 'a month'} · {p.audience === 'studio' ? 'studio members only' : `${p.trial_days}-day trial`}</span>
              <input type="hidden" name="price_id" value={p.id} />
              <input name="stripe_price_id" defaultValue={p.stripe_price_id ?? ''} placeholder="price_…" className="min-h-tap flex-1 rounded-2xl border border-stone bg-surface px-3 font-mono text-xs" />
              <button className={buttonClass('secondary')}>Save</button>
            </form>
          ))}
        </Card>
      ))}
      <Card>
        <h2 className="text-lg font-semibold">Studio membership access</h2>
        <p className="mt-1 text-sm text-muted">What verified studio members get at no extra charge: Foundation for £99 and £148 memberships. Live classes and private sessions come with the half-price upgrades.</p>
        {['studio_148', 'studio_99', 'other'].map((t) => (
          <p key={t} className="mt-2 text-sm"><span className="font-medium">{t === 'other' ? 'Other studio members' : t.replace('studio_', '£')}:</span> {(tiers ?? []).filter((x) => x.tier === t).map((x) => x.entitlement_key.replace(/_/g, ' ')).join(', ') || 'nothing'}</p>
        ))}
      </Card>
    </div>
  );
}
