import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { STEPS, FLOW, stepIndex, prevStepId, PERSONALISE_PATH } from '@/lib/onboarding/steps';
import { createClient } from '@/lib/supabase/server';
import { hasAccount } from '@/lib/auth/account';
import { loadOnboarding } from '@/lib/data/onboarding';
import { buildRecommendation } from '@/lib/data/recommendation';
import { Progress, Notice, buttonClass } from '@/components/ui';
import { StepShell } from '@/components/onboarding/StepShell';
import { QuestionForm } from '@/components/onboarding/QuestionForm';
import { NameForm } from '@/components/onboarding/NameForm';
import { DietaryForm } from '@/components/onboarding/DietaryForm';
import { WellnessForm } from '@/components/onboarding/WellnessForm';
import { AccountForm } from '@/components/onboarding/AccountForm';
import { Prefill } from '@/components/onboarding/Prefill';
import { ProgrammeResult } from '@/components/onboarding/ProgrammeResult';
import { HealthForm } from '@/components/health/HealthForm';
import { saveHealthOnboarding } from '@/lib/health/actions';
import {
  startOnboarding, saveQuestion, saveName, saveDietary, saveWellness,
  acceptProgramme, createAccount, finishOnboarding,
} from '../actions';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ step: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { step } = await params;
  return { title: STEPS.find((s) => s.id === step)?.title ?? 'Build my plan' };
}

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
      <div className="pt-4">
        <img src="/images/studio-bird-dog.webp" alt="" className="aspect-[5/4] w-full rounded-3xl object-cover" />
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
  if (step.later && !hasAccount(user)) redirect('/start/goals');
  const data = await loadOnboarding(user.id);

  const header = step.later ? (
    <div className="mb-8 pt-2">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href={PERSONALISE_PATH} className="-ml-2 rounded-pill px-2 py-1 hover:text-ink">← Personalise</Link>
        <span>Optional</span>
      </div>
    </div>
  ) : (
    <div className="mb-8 pt-2" data-step-head>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        {back ? <Link href={`/start/${back}`} className="-ml-2 rounded-pill px-2 py-1 hover:text-ink">← Back</Link> : <span />}
        <span>{idx} of {FLOW.length - 1}</span>
      </div>
      <Progress value={idx} max={FLOW.length - 1} label="Onboarding progress" />
    </div>
  );

  let body: React.ReactNode = null;

  switch (step.kind) {
    case 'name':
      body = <><NameForm action={saveName} firstName={data.profile?.first_name ?? ''} displayName={data.profile?.display_name ?? ''} adult={data.profile?.adult_confirmed ?? false} /><Prefill fields={{ first_name: 'name', display_name: 'name' }} /></>;
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

    case 'health':
      body = <HealthForm action={saveHealthOnboarding} />;
      break;

    case 'account':
      if (hasAccount(user)) redirect('/join');
      body = <><AccountForm action={createAccount} /><Prefill fields={{ email: 'email' }} /></>;
      break;

    // Choosing a membership and adding a card happen on the in-app payment screen (/join).
    // Old links to these steps still land in the right place.
    case 'membership':
    case 'payment':
      redirect(hasAccount(user) ? '/join' : '/start/account');

    case 'done': {
      if (!hasAccount(user)) redirect('/start/account');
      body = (
        <div className="space-y-5">
          {sp.check_email && <Notice tone="success" title="Account created">We have sent a link to confirm your email. You can carry on now.</Notice>}
          <p className="text-muted">Your plan is saved. Next: open your Today screen to see your programme and what is coming up.</p>
          <form action={finishOnboarding}><button className={buttonClass('primary', true)}>Go to Today</button></form>
        </div>
      );
      break;
    }
  }

  return (
    <>
      {header}
      <StepShell title={step.kind === 'done' && data.profile?.first_name ? `Welcome, ${data.profile.first_name}` : step.title} subtitle={step.subtitle}>{body}</StepShell>
    </>
  );
}
