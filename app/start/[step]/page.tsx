import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { STEPS, stepIndex, prevStepId } from '@/lib/onboarding/steps';
import { createClient } from '@/lib/supabase/server';
import { loadOnboarding } from '@/lib/data/onboarding';
import { buildRecommendation } from '@/lib/data/recommendation';
import { Progress, Notice, Card, buttonClass } from '@/components/ui';
import { StepShell } from '@/components/onboarding/StepShell';
import { QuestionForm } from '@/components/onboarding/QuestionForm';
import { NameForm } from '@/components/onboarding/NameForm';
import { DietaryForm } from '@/components/onboarding/DietaryForm';
import { WellnessForm } from '@/components/onboarding/WellnessForm';
import { StudioForm } from '@/components/onboarding/StudioForm';
import { AccountForm } from '@/components/onboarding/AccountForm';
import { ProgrammeResult } from '@/components/onboarding/ProgrammeResult';
import {
  startOnboarding, saveQuestion, saveName, saveDietary, saveWellness, saveStudio,
  acceptProgramme, createAccount, startCheckout, finishOnboarding,
} from '../actions';
import { formatPence, type Plan, type Price, type Studio } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ step: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { step } = await params;
  return { title: STEPS.find((s) => s.id === step)?.title ?? 'Build my plan' };
}

const MEMBERSHIP_ERRORS: Record<string, string> = {
  not_connected: 'Payments are not connected yet for this plan. You can continue and choose a membership later.',
  checkout: 'We could not open checkout. Nothing has been charged. Please try again.',
  price: 'Please choose a membership.',
};

export default async function StepPage({ params, searchParams }: Props) {
  const { step: stepId } = await params;
  const sp = await searchParams;
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const idx = stepIndex(step.id);
  const back = prevStepId(step.id);

  // Welcome screen: no session needed yet.
  if (step.kind === 'intro') {
    return (
      <div className="pt-6">
        <img src="/images/studio-mat-core.webp" alt="" className="aspect-[5/4] w-full object-cover" />
        <div className="mt-8">
          <StepShell title={step.title} subtitle={step.subtitle}>
            {sp.error === 'anon' && <div className="mb-4"><Notice tone="error" title="We could not start your plan">Please try again in a moment. If it keeps happening, contact the BAYSE team.</Notice></div>}
            {sp.expired && <div className="mb-4"><Notice tone="warning" title="Your session ended">Start again, or sign in to pick up where you left off.</Notice></div>}
            <form action={startOnboarding}>
              <button className={buttonClass('primary', true)}>Build my plan</button>
            </form>
            <p className="mt-4 text-center text-sm text-muted">Already a member? <Link href="/sign-in" className="text-ink underline">Sign in</Link></p>
          </StepShell>
        </div>
      </div>
    );
  }

  if (!user) redirect('/start/welcome?expired=1');
  const data = await loadOnboarding(user.id);

  const header = (
    <div className="mb-8 pt-2">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        {back ? <Link href={`/start/${back}`} className="-ml-2 rounded-pill px-2 py-1 hover:text-ink">← Back</Link> : <span />}
        <span>{idx} of {STEPS.length - 1}</span>
      </div>
      <Progress value={idx} max={STEPS.length - 1} label="Onboarding progress" />
    </div>
  );

  let body: React.ReactNode = null;

  switch (step.kind) {
    case 'name':
      body = <NameForm action={saveName} firstName={data.profile?.first_name ?? ''} displayName={data.profile?.display_name ?? ''} adult={data.profile?.adult_confirmed ?? false} />;
      break;

    case 'single':
    case 'multi':
    case 'number': {
      const source = step.table === 'nutrition_preferences' ? data.nutrition : data.answers;
      const current = source ? ((source as Record<string, unknown>)[step.field!] as string | string[] | number | null) : null;
      body = <QuestionForm step={step} action={saveQuestion.bind(null, step.id)} current={current} />;
      break;
    }

    case 'dietary':
      body = <DietaryForm action={saveDietary} prefs={data.nutrition} needs={data.dietary} />;
      break;

    case 'wellness':
      body = <WellnessForm action={saveWellness} options={step.options ?? []} current={data.wellness} />;
      break;

    case 'studio': {
      const { data: studios } = await supabase.from('studios').select('id, slug, name, town, status').neq('status', 'closed').order('name');
      const link = data.links[0] ?? null;
      body = <StudioForm action={saveStudio} studios={(studios ?? []) as Studio[]} current={link} />;
      break;
    }

    case 'result': {
      const rec = await buildRecommendation(user.id);
      body = (
        <div className="space-y-5">
          <ProgrammeResult name={rec.programmeName} weeks={rec.weeks} sessionsPerWeek={rec.sessionsPerWeek} reasons={rec.reasons} />
          <p className="text-xs text-muted">This is a training suggestion based on your answers, not medical advice. If you are pregnant, recovering from injury or have a health condition, check with a qualified professional before starting.</p>
          <form action={acceptProgramme}>
            <input type="hidden" name="recommendation_id" value={rec.id} />
            <button className={buttonClass('primary', true)}>Start this programme</button>
          </form>
          <Link href="/start/goals" className="block text-center text-sm text-muted hover:text-ink">Change my answers</Link>
        </div>
      );
      break;
    }

    case 'account':
      if (!user.is_anonymous) redirect('/start/membership');
      body = <AccountForm action={createAccount} />;
      break;

    case 'membership': {
      if (user.is_anonymous) redirect('/start/account');
      const [{ data: plans }, { data: prices }, { data: ents }] = await Promise.all([
        supabase.from('plans').select('id, key, name, description, sort, is_hypothesis').order('sort'),
        supabase.from('prices').select('id, plan_id, stripe_price_id, billing_interval, amount_pence, currency, trial_days').eq('billing_interval', 'month'),
        supabase.from('entitlements').select('entitlement_key, source'),
      ]);
      const studioIncluded = (ents ?? []).some((e) => e.source === 'studio' && e.entitlement_key === 'on_demand');
      const pendingLink = data.links.some((l) => l.status === 'pending');
      const anyHypothesis = (plans ?? []).some((p) => p.is_hypothesis);
      body = (
        <div className="space-y-4">
          {sp.check_email && <Notice tone="success" title="Account created">We have sent a link to confirm your email. You can carry on now.</Notice>}
          {sp.checkout === 'cancelled' && <Notice title="Checkout cancelled">Nothing was charged.</Notice>}
          {sp.error && <Notice tone="error">{MEMBERSHIP_ERRORS[sp.error] ?? 'Something went wrong.'}</Notice>}
          {studioIncluded && <Notice tone="success" title="Included with your studio membership">Your studio has confirmed your membership, so your digital access is already switched on.</Notice>}
          {pendingLink && !studioIncluded && <Notice title="Waiting for your studio">Once your studio confirms your membership, any digital access it includes switches on automatically. You do not need to pay twice.</Notice>}
          {anyHypothesis && <Notice tone="warning" title="Test prices">These prices are still being finalised. Checkout runs in Stripe test mode, so no real payment is taken.</Notice>}
          {(plans as Plan[] | null)?.map((plan) => {
            const price = (prices as Price[] | null)?.find((p) => p.plan_id === plan.id);
            return (
              <Card key={plan.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  {price && <p className="text-sm"><span className="font-serif text-xl">{formatPence(price.amount_pence, price.currency)}</span> <span className="text-muted">/ month</span></p>}
                </div>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>
                {price && (
                  <form action={startCheckout} className="mt-4">
                    <input type="hidden" name="price_id" value={price.id} />
                    <button className={buttonClass(plan.key === 'club' ? 'primary' : 'secondary', true)} disabled={!price.stripe_price_id}>
                      {price.trial_days ? `Start ${price.trial_days}-day free trial` : 'Choose'}
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
          <p className="text-xs text-muted">Cancel any time from your account. Studio members with an included membership code can enter it at checkout.</p>
          <form action={finishOnboarding}><button className="block w-full py-2 text-center text-sm text-muted hover:text-ink">{studioIncluded ? 'Continue' : 'Decide later'}</button></form>
        </div>
      );
      break;
    }

    case 'payment':
      redirect('/start/membership');

    case 'done':
      body = (
        <div className="space-y-5">
          {sp.checkout === 'success' && <Notice tone="success" title="You are in">Your membership is being set up. It can take a few seconds to appear.</Notice>}
          <p className="text-muted">Your plan is saved. Next: open your Today screen to see your programme and what is coming up.</p>
          <form action={finishOnboarding}><button className={buttonClass('primary', true)}>Go to Today</button></form>
        </div>
      );
      break;
  }

  return (
    <>
      {header}
      <StepShell title={step.kind === 'done' && data.profile?.first_name ? `Welcome, ${data.profile.first_name}` : step.title} subtitle={step.subtitle}>{body}</StepShell>
    </>
  );
}
