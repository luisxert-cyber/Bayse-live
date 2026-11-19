import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, fmtDate } from '@/lib/data/member';
import { Card, Notice, buttonClass } from '@/components/ui';
import { openBillingPortal } from '../actions';
import { requestStudioLink } from './actions';
import { createClient } from '@/lib/supabase/server';
import { formatPence } from '@/lib/types';

type StudioLink = { status: string; tier: string; verified_until: string | null; ended_at: string | null; studios: { name: string } | null };
const NOTICE_DAYS = 28;
const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();

export const metadata = { title: 'Membership' };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  trialing: 'Free trial', active: 'Active', past_due: 'Payment overdue', unpaid: 'Unpaid', canceled: 'Cancelled',
  incomplete: 'Not completed', incomplete_expired: 'Expired', paused: 'Paused',
};

export default async function Membership({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/you/membership');
  const m = await loadMember(user.id);
  const supabase = await createClient();
  const [{ data: eligibleRaw }, { data: linkRows }, { data: studios }, { data: studioPrices }, { data: mySub }] = await Promise.all([
    supabase.rpc('studio_price_eligible'),
    supabase.from('studio_memberships').select('status, tier, verified_until, ended_at, studios(name)').eq('user_id', user.id).order('requested_at', { ascending: false }),
    supabase.from('studios').select('id, name').eq('status', 'open').order('name'),
    supabase.from('prices').select('amount_pence, currency, audience, plans(key, name)').eq('active', true).eq('audience', 'studio').order('amount_pence'),
    supabase.from('subscriptions').select('status, prices(audience)').eq('user_id', user.id).in('status', ['trialing', 'active', 'past_due']).limit(1).maybeSingle(),
  ]);
  const studioMember = eligibleRaw === true;
  const links = (linkRows ?? []) as unknown as StudioLink[];
  const pending = links.find((l) => l.status === 'pending') ?? null;
  const ended = links.find((l) => l.status === 'ended' && l.ended_at) ?? null;
  const offers = (studioPrices ?? []) as unknown as Array<{ amount_pence: number; currency: string; plans: { key: string; name: string } | null }>;
  const onStudioPrice = (mySub?.prices as unknown as { audience?: string } | null)?.audience === 'studio';
  const returning = Boolean(m.subscription);
  // A finished membership (cancelled, expired) is shown like no membership, with a way back in.
  const s = m.subscription && !['canceled', 'incomplete', 'incomplete_expired'].includes(m.subscription.status) ? m.subscription : null;
  return (
    <main className="page space-y-5">
      <Link href="/you" className="text-sm text-muted hover:text-ink">← You</Link>
      <h1 className="text-xl font-semibold">Membership and billing</h1>
      {sp.error === 'portal' && <Notice tone="error">We could not open billing right now. Please try again.</Notice>}
      {sp.error === 'no_customer' && <Notice>You do not have a paid membership yet.</Notice>}
      {sp.already && <Notice>You already have an active membership.</Notice>}
      {sp.studio === 'requested' && <Notice tone="success" title="Request sent">Your studio will confirm your membership. Your included access and member prices switch on as soon as they do.</Notice>}
      {sp.studio === 'exists' && <Notice>You have already asked to link that studio. If it has been a while, speak to your studio team.</Notice>}
      {(sp.studio === 'invalid' || sp.studio === 'failed') && <Notice tone="error">We could not send that request. Please choose your studio and membership and try again.</Notice>}

      {studioMember && (
        <Card className="border-ink">
          <p className="eyebrow">BAYSE studio member</p>
          <h2 className="mt-1 text-lg font-semibold">Your BAYSE Studio Membership Includes BAYSE Club</h2>
          <p className="mt-2 text-sm text-muted">Enjoy your complimentary Foundation membership, including Pilates on demand, community groups, challenges and more.</p>
          {!s && offers.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-stone pt-4">
              <p className="eyebrow">Upgrade options · 50% studio member discount</p>
              {offers.map((o) => (
                <div key={o.plans?.key} className="text-sm">
                  <p className="font-medium">Upgrade to {(o.plans?.name ?? '').replace(/^BAYSE /, '')} — {formatPence(o.amount_pence, o.currency)} / 28 days</p>
                  <p className="text-muted">{o.plans?.key === 'coaching' ? 'Includes live classes and a private 45-minute online coaching session every billing cycle.' : 'Your exclusive BAYSE studio member price.'}</p>
                </div>
              ))}
              <Link href="/join" className={`${buttonClass('primary')} mt-1`}>See my member upgrades</Link>
            </div>
          )}
        </Card>
      )}
      {!studioMember && ended?.ended_at && (
        <Notice tone="warning" title="Your studio membership has ended">
          Your included BAYSE Foundation access stays on until {fmtDate(addDays(ended.ended_at, NOTICE_DAYS))}.
          {onStudioPrice && s?.current_period_end ? <> Your studio member price ends with your paid period on {fmtDate(s.current_period_end)}. Nothing more will be taken at that price, and your payment is never raised without your agreement.</> : null}
          {' '}To carry on after that, choose a standard-price membership.
        </Notice>
      )}
      <Card>
        <p className="eyebrow">Digital membership</p>
        {s ? (
          <div className="mt-2 space-y-1">
            <p className="font-medium">{s.plans?.name ?? 'BAYSE membership'} · {STATUS[s.status] ?? s.status}</p>
            {s.trial_end && s.status === 'trialing' && <p className="text-sm text-muted">Free trial until {fmtDate(s.trial_end)}. Your first payment is taken then. You can cancel before then and you will not be charged.</p>}
            {s.cancel_at_period_end && s.current_period_end && <p className="text-sm text-muted">Set to end on {fmtDate(s.current_period_end)}.</p>}
            <form action={openBillingPortal} className="pt-3"><button className={buttonClass('secondary')}>Manage billing, card or cancel</button></form>
          </div>
        ) : (
          <div className="mt-2">
            {returning ? (
              <><p className="font-medium">Your membership has ended</p><p className="mt-1 text-sm text-muted">Choose a membership to carry on. Your plan and progress are saved.</p></>
            ) : (
              <><p className="font-medium">Start your 7-day free trial</p><p className="mt-1 text-sm text-muted">Choose a membership and add your card. Nothing is taken for 7 days, and you can cancel any time before then.</p></>
            )}
            <Link href="/join" className={`${buttonClass('primary')} mt-3`}>{returning ? 'Choose a membership' : 'Start free trial'}</Link>
          </div>
        )}
      </Card>
      {!studioMember && (
        <Card>
          <p className="eyebrow">Already a BAYSE studio member?</p>
          {pending ? (
            <p className="mt-2 text-sm text-muted">Your request to link {pending.studios?.name ?? 'your studio'} is waiting for the studio to confirm it.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">Active £99 and £148 studio memberships include BAYSE Foundation free and half price on Inner Circle and Black. Tell us your studio and your studio team will confirm it.</p>
              <form action={requestStudioLink} className="mt-3 space-y-2">
                <label className="block text-sm">Your studio
                  <select name="studio_id" required className="mt-1 block min-h-tap w-full rounded-2xl border border-stone bg-surface px-3 text-sm">
                    <option value="">Choose a studio</option>
                    {(studios ?? []).map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm">Your studio membership
                  <select name="tier" required className="mt-1 block min-h-tap w-full rounded-2xl border border-stone bg-surface px-3 text-sm">
                    <option value="studio_99">£99 membership</option>
                    <option value="studio_148">£148 membership</option>
                    <option value="other">Another membership or class pack</option>
                  </select>
                </label>
                <label className="block text-sm">Name or email your studio knows you by (optional)
                  <input name="member_ref" maxLength={80} className="mt-1 block min-h-tap w-full rounded-2xl border border-stone bg-surface px-3 text-sm" />
                </label>
                <button className={buttonClass('secondary')}>Ask my studio to confirm</button>
              </form>
            </>
          )}
        </Card>
      )}
      <Card>
        <p className="eyebrow">Have a BAYSE code?</p>
        <p className="mt-2 text-sm text-muted">Choose a membership, then tap &ldquo;Add promotion code&rdquo; on the payment step.</p>
      </Card>
      <Card>
        <p className="eyebrow">What you can use</p>
        {m.entitlements.size ? (
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">{[...m.entitlements].sort().map((k) => <li key={k}>· {k.replace(/_/g, ' ')}</li>)}</ul>
        ) : <p className="mt-2 text-sm text-muted">Nothing switched on yet.</p>}
      </Card>
    </main>
  );
}
