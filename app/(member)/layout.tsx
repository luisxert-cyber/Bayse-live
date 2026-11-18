import { BottomNav } from '@/components/member/BottomNav';
import { requireUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Anonymous sessions belong to onboarding until an account is created.
  if (user.is_anonymous) redirect('/start/account');
  return (
    <>
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>{children}</div>
      <BottomNav />
    </>
  );
}
