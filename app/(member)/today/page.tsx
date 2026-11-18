import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, greeting, fmtDate } from '@/lib/data/member';
import { currentProgramme } from '@/lib/data/recommendation';
import { Card, Notice, buttonClass, Wordmark } from '@/components/ui';

export const metadata = { title: 'Today' };
export const dynamic = 'force-dynamic';

// Today: personal, visual and honest. Parts of BAYSE that have not opened yet say so,
// rather than showing pretend activity.
const Soon = () => <span className="chip">Opening soon</span>;

export default async function Today({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/today');
  const [m, programme] = await Promise.all([loadMember(user.id), currentProgramme(user.id)]);
  const name = m.profile?.first_name;
  const isStaff = m.roles.length > 0;
  const goal = programme?.sessions_per_week ?? 3;

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

      {/* Your next session */}
      {programme?.programmes ? (
        <div className="relative overflow-hidden rounded-card">
          <img src="/images/studio-mat-core.webp" alt="" className="h-[220px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Your next session</p>
            <p className="mt-1 text-xl font-bold uppercase leading-tight">{programme.programmes.name}</p>
            <p className="text-sm text-white/85">{programme.weeks} weeks · {programme.sessions_per_week} sessions a week</p>
            <p className="mt-3 text-sm text-white/85">Your first session unlocks when the on-demand library opens. We will let you know.</p>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <p className="eyebrow">Your plan</p>
          <h2 className="mt-2 text-xl">No programme yet</h2>
          <p className="mt-1 text-sm text-muted">A few quick questions and we will recommend one.</p>
          <Link href="/start/goals" className={`${buttonClass('primary')} mt-4`}>Build my plan</Link>
        </Card>
      )}

      {/* Your weekly progress */}
      <Card>
        <div className="flex items-center justify-between"><p className="eyebrow">Your weekly progress</p><span className="text-sm font-semibold">Goal: {goal} a week</span></div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`mx-auto mb-1 h-8 w-8 rounded-full ${i < goal ? 'border-2 border-dashed border-ink/35' : 'bg-ink/[0.05]'}`} />
              <span className="text-xs text-muted">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">Each session you finish fills a circle. Counting starts when classes open.</p>
      </Card>

      {/* Your Circle and clubs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col">
          <p className="eyebrow">Your BAYSE Circle</p>
          <div className="mt-3 flex -space-x-2">{['bg-[#E6DCCF]', 'bg-[#D4C7B7]', 'bg-[#BFB1A0]'].map((c) => <span key={c} className={`h-8 w-8 rounded-full border-2 border-surface ${c}`} />)}</div>
          <p className="mt-3 flex-1 text-sm text-muted">10 to 20 members who train at your times.</p>
          <div className="mt-3"><Soon /></div>
        </Card>
        <Card className="flex flex-col">
          <p className="eyebrow">Clubs near you</p>
          <p className="mt-3 flex-1 text-sm text-muted">Padel, walks and coffee arranged by members in your area.</p>
          <div className="mt-3"><Soon /></div>
        </Card>
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
          <p className="mt-2 text-sm text-muted">No membership yet. <Link href="/start/membership" className="text-ink underline">Choose one</Link></p>
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
