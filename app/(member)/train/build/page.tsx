import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { requireHealthCheck } from '@/lib/health/gate';
import { hasOnDemand } from '@/lib/auth/access';
import { createClient } from '@/lib/supabase/server';
import { defaultsFromAnswers } from '@/lib/workouts/builder';
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder';
import { recordCustom } from '../actions';

export const metadata = { title: 'Build my workout' };
export const dynamic = 'force-dynamic';

export default async function Build() {
  const user = await requireUser('/train/build');
  await requireHealthCheck('/train/build');
  // The builder comes with membership or the free trial; everyone else sees how it works.
  if (!(await hasOnDemand())) redirect('/try');
  const supabase = await createClient();
  const { data: a } = await supabase.from('onboarding_answers').select('goals, experience, session_length').eq('user_id', user.id).maybeSingle();
  const initial = defaultsFromAnswers(a?.goals as string[] | null, a?.experience as string | null, a?.session_length as string | null);
  return (
    <main className="page space-y-5">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[30px] leading-none">Build my workout</h1>
        <p className="mt-2 text-muted">We have started from the goals you told us. Change anything and your workout updates straight away.</p>
      </div>
      <WorkoutBuilder initial={initial} exitHref="/today" onComplete={recordCustom} />
    </main>
  );
}
