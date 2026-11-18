import { BottomNav } from '@/components/member/BottomNav';
import { requireUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { redirect } from 'next/navigation';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Anonymous sessions belong to onboarding until an account is created.
  if (!hasAccount(user)) redirect('/start/account');
  return (
    // The member app uses the warm linen palette: inviting to open every day.
    <div className="warm min-h-dvh">
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>{children}</div>
      <BottomNav />
    </div>
  );
}
