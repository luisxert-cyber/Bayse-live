import { BottomNav } from '@/components/member/BottomNav';
import { requireUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { redirect } from 'next/navigation';
import { checkDevice } from '@/lib/devices';
import { createClient } from '@/lib/supabase/server';
import { loadBilling } from '@/lib/billing/trial';
import { TrialBanner } from '@/components/member/TrialBanner';
import { LiveCountdown } from '@/components/member/LiveCountdown';
import { upcomingSlots, type ScheduleRow } from '@/lib/daily/countdown';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Anonymous sessions belong to onboarding until an account is created.
  if (!hasAccount(user)) redirect('/start/account');
  // One membership, one person: limit the number of devices (staff are not limited).
  if ((await checkDevice()) === 'limit') redirect('/devices');
  // Shows the days left on a trial, or the way to start one for accounts without a membership.
  const supabase = await createClient();
  // The next week of live classes for the countdown bar. If it cannot be read, the bar is simply left out.
  const [billing, { data: schedule }] = await Promise.all([loadBilling(supabase, user.id), supabase.rpc('live_schedule', { p_days: 7 })]);
  const serverNow = Date.now();
  const slots = upcomingSlots((schedule ?? []) as ScheduleRow[], serverNow);
  return (
    // The member app uses the warm linen palette: inviting to open every day.
    <div className="warm min-h-dvh">
      {/* Stays at the top while the page scrolls: the countdown to the next live class. */}
      <div className="sticky top-0 z-20 bg-bg" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <LiveCountdown slots={slots} serverNow={serverNow} />
      </div>
      <TrialBanner billing={billing} />
      {children}
      <BottomNav />
    </div>
  );
}
