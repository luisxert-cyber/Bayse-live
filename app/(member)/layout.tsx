import { BottomNav } from '@/components/member/BottomNav';
import { requireUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { redirect } from 'next/navigation';
import { checkDevice } from '@/lib/devices';
import { createClient } from '@/lib/supabase/server';
import { loadBilling } from '@/lib/billing/trial';
import { TrialBanner } from '@/components/member/TrialBanner';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Anonymous sessions belong to onboarding until an account is created.
  if (!hasAccount(user)) redirect('/start/account');
  // One membership, one person: limit the number of devices (staff are not limited).
  if ((await checkDevice()) === 'limit') redirect('/devices');
  // Shows the days left on a trial, or the way to start one for accounts without a membership.
  const billing = await loadBilling(await createClient(), user.id);
  return (
    // The member app uses the warm linen palette: inviting to open every day.
    <div className="warm min-h-dvh">
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <TrialBanner billing={billing} />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
