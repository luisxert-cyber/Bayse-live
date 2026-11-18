import { redirect } from 'next/navigation';
import { Wordmark, Notice } from '@/components/ui';
import { getUser, getRoles, isStaff } from '@/lib/auth/session';
import { StaffSignIn } from '@/components/auth/StaffSignIn';

export const metadata = { title: 'Staff sign in' };
export const dynamic = 'force-dynamic';

export default async function Staff({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const user = await getUser().catch(() => null);
  if (user && !user.is_anonymous && isStaff(await getRoles())) redirect('/admin');
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <Wordmark className="h-7" />
      <p className="eyebrow mt-6">BAYSE staff</p>
      <h1 className="mt-2 text-[30px]">Back office sign in</h1>
      <p className="mt-1 text-sm text-muted">For BAYSE admins, instructors and moderators. Members sign in on the main website.</p>
      {(sp.denied || (user && !user.is_anonymous)) && <div className="mt-5"><Notice tone="warning" title="No staff access on this account">Ask a BAYSE admin to add a staff role to your account, or sign in with your staff account.</Notice></div>}
      <div className="mt-6"><StaffSignIn /></div>
    </main>
  );
}
