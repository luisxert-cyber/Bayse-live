import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Card, Notice, buttonClass } from '@/components/ui';
import { formatPence } from '@/lib/types';
import { TIERS } from '@/lib/site/offer';

export const metadata = { title: 'Membership' };
export const revalidate = 300;

export default async function Pricing() {
  const supabase = await createClient();
  const [{ data: plans }, { data: prices }] = await Promise.all([
    supabase.from('plans').select('id, key, name, description, is_hypothesis').order('sort'),
    supabase.from('prices').select('plan_id, amount_pence, currency, trial_days').eq('billing_interval', 'month'),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="warm">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="eyebrow">Membership</p>
          <h1 className="mt-3 text-[34px] sm:text-[48px]">Find your fit. <span className="script">7 days free.</span></h1>
          <p className="mt-3 max-w-xl text-lg text-muted">Every plan starts with a free trial. Cancel any time.</p>
          <div className="ink-panel mt-8 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.06em]">Have a BAYSE code?</p>
            <p className="mt-1 text-muted">Choose a plan, then tap &ldquo;Add promotion code&rdquo; on the payment page. A free-membership code means you are not charged.</p>
          </div>
          {plans?.some((p) => p.is_hypothesis) && <div className="mt-6 max-w-xl"><Notice tone="warning" title="Pre-launch">Prices shown are being finalised and may change before launch.</Notice></div>}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans?.map((plan) => {
              const price = prices?.find((p) => p.plan_id === plan.id);
              const tier = TIERS.find((t) => t.key === plan.key);
              const featured = plan.key === 'club';
              return (
                <Card key={plan.id} className={`flex flex-col ${featured ? 'ink-panel !border-transparent' : ''}`}>
                  {tier && <p className="script text-[26px] leading-none">{tier.tagline}</p>}
                  <h2 className="mt-4 text-sm font-bold uppercase tracking-[0.06em]">{plan.name}{featured && <span className="ml-2 font-normal text-muted">· Most popular</span>}</h2>
                  {price && <p className="mt-1"><span className="text-[34px] font-extrabold leading-none">{formatPence(price.amount_pence, price.currency)}</span> <span className="text-sm text-muted">/ month</span></p>}
                  {price?.trial_days ? <p className="text-sm text-muted">{price.trial_days}-day free trial</p> : null}
                  {tier && <p className="mt-3 text-sm text-muted">{tier.bestFor}</p>}
                  <ul className="mt-4 flex-1 space-y-2 text-sm">{(tier?.items ?? []).map((i) => <li key={i} className="flex gap-2"><span aria-hidden>✓</span>{i}</li>)}</ul>
                  <Link href="/start/welcome" className={`${buttonClass(featured ? 'secondary' : 'primary', true)} mt-6`}>Build my plan</Link>
                </Card>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-muted">Coaching, nutrition, wellness and Clubs open in stages after launch. The app always shows what is live.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
