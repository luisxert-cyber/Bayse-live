import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { Card, Notice, buttonClass } from '@/components/ui';
import { formatPence } from '@/lib/types';

export const metadata = { title: 'Membership' };
export const revalidate = 300;

const INCLUDES: Record<string, string[]> = {
  essential: ['Personal programme', 'On-demand classes', 'Recipes and meal planning', 'Progress tracking', 'Community and Clubs'],
  club: ['Everything in Essential', '17 live 45-minute classes a week, with two instructors', 'Group coaching', 'Monthly club challenges'],
  coaching: ['Everything in Club', 'Your own coach, with set check-ins', 'Extra nutrition coaching support'],
};

export default async function Pricing() {
  const supabase = await createClient();
  const [{ data: plans }, { data: prices }] = await Promise.all([
    supabase.from('plans').select('id, key, name, description, is_hypothesis').order('sort'),
    supabase.from('prices').select('plan_id, amount_pence, currency, trial_days').eq('billing_interval', 'month'),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="eyebrow">Membership</p>
        <h1 className="mt-3 text-2xl font-semibold">Choose how you train with BAYSE</h1>
        <p className="mt-2 max-w-xl text-muted">Every plan starts with a free trial. Cancel any time. Studio members: link your membership and any included access switches on automatically.</p>
        {plans?.some((p) => p.is_hypothesis) && <div className="mt-6 max-w-xl"><Notice tone="warning" title="Pre-launch">Prices shown are being finalised and may change before launch.</Notice></div>}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans?.map((plan) => {
            const price = prices?.find((p) => p.plan_id === plan.id);
            const featured = plan.key === 'club';
            return (
              <Card key={plan.id} className={featured ? 'border-ink' : ''}>
                {featured && <p className="eyebrow mb-2 !text-accent">Most popular</p>}
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {price && <p className="mt-2"><span className="font-serif text-2xl">{formatPence(price.amount_pence, price.currency)}</span> <span className="text-sm text-muted">/ month</span></p>}
                {price?.trial_days ? <p className="text-sm text-muted">{price.trial_days}-day free trial</p> : null}
                <ul className="mt-4 space-y-2 text-sm">{(INCLUDES[plan.key] ?? []).map((i) => <li key={i} className="flex gap-2"><span aria-hidden className="text-accent">✓</span>{i}</li>)}</ul>
                <Link href="/start/welcome" className={`${buttonClass(featured ? 'primary' : 'secondary', true)} mt-6`}>Build my plan</Link>
              </Card>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
