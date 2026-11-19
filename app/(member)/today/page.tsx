import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, greeting, fmtDate } from '@/lib/data/member';
import { currentProgramme } from '@/lib/data/recommendation';
import { Card, Notice, buttonClass, Wordmark } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { hasEntitlement } from '@/lib/auth/access';
import { loadDaily } from '@/lib/daily/data';
import { nextBestAction } from '@/lib/daily/next';
import { computeProgress } from '@/lib/daily/progress';
import { MoveThumb } from '@/components/workout/MoveThumb';
import { EXERCISES } from '@/lib/workouts/catalog';

export const metadata = { title: 'Today' };
export const dynamic = 'force-dynamic';

// Today: personal, visual and honest. Parts of BAYSE that have not opened yet say so,
// rather than showing pretend activity.

export default async function Today({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/today');
  const [m, plan, daily, hasPlan] = await Promise.all([loadMember(user.id), currentProgramme(user.id), loadDaily(user.id), hasEntitlement('programmes')]);
  // The personal plan is part of Inner Circle and Black. Members without it still get BAYSE Daily and on-demand classes.
  const programme = hasPlan ? plan : null;
  const next = nextBestAction(daily);
  const progress = computeProgress(daily.completions);
  const cover = next.workout ? EXERCISES[(next.workout.blocks[1] ?? next.workout.blocks[0]).ex]?.move : 'birddog';
  const name = m.profile?.first_name;
  const isStaff = m.roles.length > 0;
  const goal = daily.weeklyGoal;

  // This week's finished workouts (Monday to Sunday, UK time) fill the progress circles.
  const ukDay = (d: Date) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short' }).format(d));
  const todayIdx = ukDay(new Date());
  const since = new Date(Date.now() - (todayIdx + 1) * 86400000).toISOString();
  const supabase = await createClient();
  const { data: done } = await supabase.from('workout_completions').select('completed_at, minutes').eq('user_id', user.id).gte('completed_at', since);
  const doneDays = new Set((done ?? []).filter((r) => Date.now() - new Date(r.completed_at).getTime() < (todayIdx + 1) * 86400000).map((r) => ukDay(new Date(r.completed_at))).filter((d) => d <= todayIdx));
  const sessions = doneDays.size;

  return (
    <main className="page space-y-4">
      <div className="flex items-center justify-between">
        <Wordmark className="h-5" />
        <Link href="/you" className="grid h-10 w-10 place-items-center rounded-full bg-ink font-bold text-bg" aria-label="Your profile">{(name ?? m.profile?.display_name ?? 'B').slice(0, 1).toUpperCase()}</Link>
      </div>

      <div className="pt-2">
        <h1 className="text-[30px] leading-[1.05]">{greeting()}{name ? ',' : '.'}{name && <span className="script block text-[34px]">{name}</span>}</h1>
        {programme?.programmes && <p className="mt-2 text-muted">Week 1 · {programme.programmes.name}</p>}
      </div>

      {sp.welcome && <Notice tone="success" title="Welcome to BAYSE">Your plan is saved. This is your Today screen: your next session, your progress and your people, all in one place.</Notice>}
      {sp.denied && <Notice tone="warning">That area is for BAYSE staff only.</Notice>}
      {!m.profile?.onboarding_completed_at && <Notice title="Finish setting up">You have not finished building your plan. <Link href="/start/goals" className="underline">Carry on</Link></Notice>}

      {/* BAYSE Daily: the one next best thing to do today */}
      <Link href={next.href} className="group block border border-stone">
        {/* The picture fills the box and the words set its height, so a long title is never cut off at the top. */}
        <div className="relative flex min-h-[200px] flex-col justify-end overflow-hidden bg-surface">
          <MoveThumb move={cover ?? 'birddog'} className="absolute inset-0 block h-full w-full object-cover" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="relative px-4 pb-4 pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">BAYSE Daily · your next best move</p>
            <p className="mt-1 text-2xl font-bold uppercase leading-tight text-white">{next.title}</p>
            <p className="text-sm text-white/80">{next.minutes} min{next.kind === 'live' ? ' · live on Zoom' : ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted">{next.why}</p>
          <span className="shrink-0 border border-ink px-4 py-2 text-sm font-bold uppercase group-hover:bg-ink group-hover:text-bg">{next.kind === 'live' ? 'See class' : 'Start'}</span>
        </div>
      </Link>
      {!hasPlan && m.profile?.onboarding_completed_at && <p className="text-sm text-muted">Want a personal plan built around your goals, live classes, nutrition and progress? <Link href="/you/membership" className="underline">They come with Inner Circle</Link>.</p>}
      {programme?.programmes && <p className="text-sm text-muted">Your programme: <span className="text-ink">{programme.programmes.name}</span> · {programme.weeks} weeks · {programme.sessions_per_week} a week</p>}
      {hasPlan && !programme?.programmes && (
        <Card className="p-5">
          <p className="eyebrow">Your plan</p>
          <p className="mt-1 text-sm text-muted">A few quick questions and we will recommend a programme.</p>
          <Link href="/start/goals" className={`${buttonClass('primary')} mt-3`}>Build my plan</Link>
        </Card>
      )}

      {/* Your weekly progress */}
      <Card>
        <div className="flex items-center justify-between"><p className="eyebrow">Your weekly progress</p><span className="text-sm font-semibold">Goal: {goal} a week</span></div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`mx-auto mb-1 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${doneDays.has(i) ? 'bg-ink text-bg' : i === todayIdx ? 'border-2 border-ink' : 'bg-ink/[0.05]'}`}>{doneDays.has(i) ? '✓' : ''}</div>
              <span className={`text-xs ${i === todayIdx ? 'font-bold text-ink' : 'text-muted'}`}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{sessions >= goal ? `${sessions} of ${goal} this week. Goal reached, brilliant.` : `${sessions} of ${goal} this week. Each workout you finish fills a circle.`}</p>
        <Link href="/you/progress" className="mt-4 flex items-center justify-between border-t border-stone pt-3 text-sm"><span><span className="font-bold">{progress.classes}</span> classes · <span className="font-bold">{progress.streak}</span>-week streak</span><span className="text-muted">Your progress ›</span></Link>
      </Card>

      {/* Together, Nourish, Rewards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/community/together" className="flex flex-col border border-stone p-4 hover:border-ink">
          <p className="eyebrow">BAYSE Together</p>
          <p className="mt-2 flex-1 text-sm text-muted">Members who share your interests, Circles and Clubs.</p>
          <p className="mt-3 text-sm font-bold">Find your people ›</p>
        </Link>
        <Link href="/nourish" className="flex flex-col border border-stone p-4 hover:border-ink">
          <p className="eyebrow">BAYSE Nourish</p>
          <p className="mt-2 flex-1 text-sm text-muted">Simple recipes for how you eat, and a shopping list.</p>
          <p className="mt-3 text-sm font-bold">Get cooking ›</p>
        </Link>
      </div>

      {/* Personalise */}
      <Link href="/you/personalise" className="ink-panel flex items-center justify-between gap-4 p-5">
        <span><span className="block font-bold uppercase">Make BAYSE yours</span><span className="mt-0.5 block text-sm text-muted">Food, wellness and what you would enjoy with other members. All optional.</span></span>
        <span aria-hidden className="text-xl">›</span>
      </Link>

      <Card>
        <p className="eyebrow">Membership</p>
        {m.subscription && ['trialing', 'active', 'past_due'].includes(m.subscription.status) ? (
          <>
            <p className="mt-2 font-medium">{m.subscription.plans?.name ?? 'BAYSE membership'}</p>
            <p className="text-sm text-muted">
              {m.subscription.status === 'trialing' && m.subscription.trial_end ? `Free trial until ${fmtDate(m.subscription.trial_end)}` :
               m.subscription.status === 'past_due' ? 'Your last payment did not go through. Please update your card.' :
               m.subscription.cancel_at_period_end && m.subscription.current_period_end ? `Ends on ${fmtDate(m.subscription.current_period_end)}` : 'Active'}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">No membership yet. <Link href="/join" className="text-ink underline">Choose one</Link></p>
        )}
      </Card>

      {isStaff && (
        <Card>
          <p className="eyebrow">BAYSE team</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {m.roles.some((r) => r.role === 'admin' || r.role === 'super_admin') && <Link href="/admin" className={buttonClass('secondary')}>Admin</Link>}
          </div>
        </Card>
      )}
    </main>
  );
}
