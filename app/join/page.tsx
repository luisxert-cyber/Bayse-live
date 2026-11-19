import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { createClient } from '@/lib/supabase/server';
import { loadBilling } from '@/lib/billing/trial';
import { firstPaymentAt, trialDaysFor } from '@/lib/billing/trial-math';
import { isUuid } from '@/lib/billing/stripe-map';
import { publicEnv } from '@/lib/env';
import { TIERS } from '@/lib/site/offer';
import { Card, Notice, buttonClass } from '@/components/ui';
import { EmbeddedCheckout } from '@/components/billing/EmbeddedCheckout';
import { formatPence, type Plan, type Price } from '@/lib/types';
import { TEST_MODE_FLAG, TEST_MODE_DAYS } from '@/lib/billing/test-mode';
import { enterTestMode } from './actions';
import { pricesFor, INCLUDED_PLAN_KEY } from '@/lib/billing/studio-pricing';

export const metadata = { title: 'Choose your membership' };
export const dynamic = 'force-dynamic';

// Joining BAYSE, inside the app. Two steps on one screen: pick a membership, then add payment
// details with Apple Pay, Google Pay or a card. A first membership starts with a 7-day free trial:
// the card is saved, nothing is taken, and the membership begins when the trial ends.

const day = (ms: number) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' }).format(new Date(ms));
const per = (p: Price) => (p.billing_interval === 'year' ? 'a year' : p.billing_interval === '28_days' ? 'every 28 days' : 'a month');

export default async function Join({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/join');
  if (!hasAccount(user)) redirect('/start/account');

  const supabase = await createClient();
  const [billing, { data: planRows }, { data: priceRows }, { data: testFlag }, { data: eligibleRaw }] = await Promise.all([
    loadBilling(supabase, user.id),
    supabase.from('plans').select('id, key, name, description, sort, is_hypothesis').eq('active', true).order('sort'),
    supabase.from('prices').select('id, plan_id, stripe_price_id, billing_interval, amount_pence, currency, trial_days, audience').eq('active', true).order('amount_pence'),
    supabase.from('feature_flags').select('enabled').eq('key', TEST_MODE_FLAG).maybeSingle(),
    // Decided by the database: a verified, in-date £99 or £148 studio link. Checkout asks again on the server.
    supabase.rpc('studio_price_eligible'),
  ]);
  if (billing.subscribed) redirect('/you/membership?already=1');

  const plans = (planRows ?? []) as Plan[];
  const studioMember = eligibleRaw === true;
  const allPrices = (priceRows ?? []) as Price[];
  const includedPlanId = plans.find((p) => p.key === INCLUDED_PLAN_KEY)?.id ?? null;
  // Studio members see their member prices and are never offered Foundation to buy (it is included).
  const prices = pricesFor(allPrices, studioMember).filter((p) => !(studioMember && p.plan_id === includedPlanId));
  const standardFor = (planId: string) => allPrices.find((p) => p.plan_id === planId && p.audience !== 'studio') ?? null;
  const ready = Boolean(publicEnv.stripePublishableKey);
  const chosen = isUuid(sp.price) ? prices.find((p) => p.id === sp.price) ?? null : null;
  const chosenPlan = chosen ? plans.find((p) => p.id === chosen.plan_id) ?? null : null;
  const freeTrial = !billing.hadMembership && !studioMember;
  const chosenTrialDays = chosen ? trialDaysFor(billing.hadMembership, chosen.trial_days) : 0;
  const firstPayment = firstPaymentAt(chosenTrialDays);

  return (
    <div className="warm min-h-dvh">
      <main className="page space-y-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
        <Link href={chosen ? '/join' : '/today'} className="text-sm text-muted hover:text-ink">← {chosen ? 'All memberships' : freeTrial ? 'Not now' : 'Back'}</Link>

        {chosen && chosenPlan ? (
          <>
            <h1 className="text-xl font-semibold">{firstPayment ? `Start your ${chosenTrialDays}-day free trial` : 'Start your membership'}</h1>
            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">{chosenPlan.name}</p>
                <p className="text-sm"><span className="font-serif text-xl">{formatPence(chosen.amount_pence, chosen.currency)}</span> <span className="text-muted">{per(chosen)}</span></p>
              </div>
              <p className="mt-2 text-sm text-muted">
                {firstPayment
                  ? <><strong className="text-ink">Nothing to pay today.</strong> Add your card to start your free trial. Your first payment is taken on <strong className="text-ink">{day(firstPayment)}</strong>, and not at all if you cancel before then.</>
                  : <>Your first payment is taken today and your membership starts straight away.</>}
                {chosen.audience === 'studio' && <> This is your BAYSE studio member price, half the standard price, for as long as your studio membership is active.</>}
                {' '}Manage or cancel from You → Membership.
              </p>
            </Card>
            {ready && chosen.stripe_price_id ? (
              <>
                <EmbeddedCheckout priceId={chosen.id} publishableKey={publicEnv.stripePublishableKey} />
                <p className="text-xs text-muted">Pay with Apple Pay, Google Pay or a card. Payments are handled securely by Stripe; BAYSE never sees your card number.{chosen.audience === 'studio' ? '' : <> Have a BAYSE code? Tap <strong>Add promotion code</strong> in the form.</>}</p>
              </>
            ) : (
              <Notice tone="warning" title="Payments are being switched on">This membership cannot be bought just yet. Please check back shortly.</Notice>
            )}
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold">{studioMember ? 'Your studio member upgrades' : freeTrial ? 'Start your 7-day free trial' : 'Choose your membership'}</h1>
              <p className="mt-2 text-muted">
                {studioMember
                  ? <>On-demand classes and the community are included with your studio membership. Add your personal plan, recipes, live classes or private coaching at your exclusive member price, half the standard price.</>
                  : freeTrial
                  ? <>Choose your membership and add your card. <strong className="text-ink">Nothing is taken for 7 days</strong>, and you can cancel any time before then in a couple of taps.</>
                  : <>Choose a membership to carry on where you left off. Your plan and progress are saved.</>}
              </p>
            </div>
            {sp.welcome && <Notice tone="success" title="Account created">Your plan is saved. One last step to start your free trial.</Notice>}
            {sp.checkout === 'open' && <Notice title="Payment not finished">Nothing was charged. Choose a membership to try again.</Notice>}
            {studioMember && (
              <Card>
                <p className="eyebrow">Included with your studio membership</p>
                <h2 className="mt-1 text-lg font-semibold">On demand and community · Free</h2>
                <p className="mt-1 text-sm text-muted">Pilates on demand, the community feed, General Chat, Circles and Clubs. Nothing to pay and nothing to set up.</p>
              </Card>
            )}
            {plans.map((plan) => {
              const mine = prices.filter((p) => p.plan_id === plan.id);
              if (!mine.length) return null;
              const was = studioMember ? standardFor(plan.id) : null;
              const tier = TIERS.find((t) => t.key === plan.key);
              const featured = plan.key === 'club';
              return (
                <Card key={plan.id} className={featured ? 'border-ink' : undefined}>
                  {featured && <p className="eyebrow mb-2">Most popular</p>}
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="text-sm"><span className="font-serif text-xl">{formatPence(mine[0].amount_pence, mine[0].currency)}</span> <span className="text-muted">{per(mine[0])}</span></p>
                  </div>
                  {was && <p className="mt-1 text-sm"><strong>50% studio member discount.</strong> <span className="text-muted">Standard price <span className="line-through">{formatPence(was.amount_pence, was.currency)}</span>.</span></p>}
                  <p className="mt-1 text-sm text-muted">{tier?.bestFor ?? plan.description}</p>
                  {tier && <ul className="mt-3 space-y-1 text-sm">{tier.items.map((i) => <li key={i}>· {i}</li>)}</ul>}
                  <div className="mt-4 space-y-2">
                    {mine.map((p, i) => p.stripe_price_id && ready ? (
                      <Link key={p.id} href={`/join?price=${p.id}`} className={buttonClass(featured && i === 0 ? 'solid' : 'primary', true)}>
                        {trialDaysFor(billing.hadMembership, p.trial_days) > 0 ? `Start ${p.trial_days}-day free trial` : mine.length > 1 ? `Choose · ${formatPence(p.amount_pence, p.currency)} ${per(p)}` : `Choose ${plan.name.replace(/^BAYSE /, '')}`}
                      </Link>
                    ) : (
                      <span key={p.id} aria-disabled className={`${buttonClass('secondary', true)} cursor-not-allowed opacity-50`}>Available soon</span>
                    ))}
                  </div>
                </Card>
              );
            })}
            <p className="text-xs text-muted">Pay in the app with Apple Pay, Google Pay or a card. {studioMember ? 'Your member price applies while your studio membership is active. If it ends we tell you at least 28 days ahead and never raise your payment without your agreement.' : <>Have a BAYSE code? Choose a membership, then tap <strong>Add promotion code</strong> on the payment step.</>} Manage or cancel from your account.</p>
            {testFlag?.enabled === true && (
              // TEMPORARY: skip payment while the platform is being tested. Switch off the test_mode flag in Admin → Feature flags.
              <form action={enterTestMode} className="space-y-2 border-t border-stone pt-5">
                {sp.test === 'failed' && <Notice tone="warning" title="Test mode did not start">Access could not be given. Please try again.</Notice>}
                <button type="submit" className={buttonClass('secondary', true)}>Test mode · skip payment</button>
                <p className="text-xs text-muted">For testing only. Opens everything for {TEST_MODE_DAYS} days with no card and no payment.</p>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
