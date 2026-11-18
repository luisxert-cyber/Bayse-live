import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember, greeting, fmtDate } from '@/lib/data/member';
import { currentProgramme } from '@/lib/data/recommendation';
import { Card, Notice, EmptyState, buttonClass, Wordmark } from '@/components/ui';

export const metadata = { title: 'Today' };
export const dynamic = 'force-dynamic';

export default async function Today({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/today');
  const [m, programme] = await Promise.all([loadMember(user.id), currentProgramme(user.id)]);
  const name = m.profile?.first_name;
  const isStaff = m.roles.length > 0;
  const pendingLink = m.links.find((l) => l.status === 'pending');

  return (
    <main className="page space-y-5">
      <div className="flex items-center justify-between">
        <Wordmark className="h-5" />
        <Link href="/you" className="grid h-10 w-10 place-items-center rounded-full bg-stone font-medium" aria-label="Your profile">{(name ?? m.profile?.display_name ?? 'B').slice(0, 1).toUpperCase()}</Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold">{greeting()}{name ? `, ${name}` : ''}.</h1>
        {programme?.programmes && <p className="mt-1 text-muted">Your programme: {programme.programmes.name}</p>}
      </div>

      {sp.welcome && <Notice tone="success" title="Your plan is saved">This is your Today screen. It will show your next session, live classes and your community as each part of BAYSE switches on.</Notice>}
      {sp.denied && <Notice tone="warning">That area is for BAYSE staff only.</Notice>}
      {!m.profile?.onboarding_completed_at && <Notice title="Finish setting up">You have not finished building your plan. <Link href="/start/goals" className="underline">Carry on</Link></Notice>}

      {programme?.programmes ? (
        <Card className="p-6">
          <p className="eyebrow">Your programme</p>
          <h2 className="mt-2 text-xl font-semibold">{programme.programmes.name}</h2>
          <p className="mt-1 text-sm text-muted">{programme.weeks} weeks · {programme.sessions_per_week} sessions a week</p>
          <p className="mt-3 text-sm">{programme.programmes.summary}</p>
          <p className="mt-4 rounded-2xl bg-stone/40 px-4 py-3 text-sm text-muted">Your weekly sessions appear here when the on-demand library opens.</p>
        </Card>
      ) : (
        <EmptyState title="No programme yet" action={<Link href="/start/goals" className={buttonClass('primary')}>Build my plan</Link>}>Answer a few questions and we will recommend one.</EmptyState>
      )}

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
        ) : m.entitlements.has('on_demand') ? (
          <p className="mt-2 text-sm">Included with your studio membership{m.links[0]?.studios ? ` at ${m.links[0].studios.name}` : ''}.</p>
        ) : (
          <p className="mt-2 text-sm text-muted">No membership yet. <Link href="/start/membership" className="text-ink underline">Choose one</Link></p>
        )}
        {pendingLink && <p className="mt-3 text-sm text-muted">Waiting for {pendingLink.studios?.name ?? 'your studio'} to confirm your studio membership.</p>}
      </Card>

      {isStaff && (
        <Card>
          <p className="eyebrow">BAYSE team</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {m.roles.some((r) => r.role === 'admin' || r.role === 'super_admin') && <Link href="/admin" className={buttonClass('secondary')}>Admin</Link>}
            {m.roles.some((r) => r.role === 'studio_manager') && <Link href="/studio" className={buttonClass('secondary')}>My studio</Link>}
          </div>
        </Card>
      )}
    </main>
  );
}
