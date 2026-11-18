import { redirect } from 'next/navigation';
import { Wordmark, Notice } from '@/components/ui';
import { getUser, getRoles, isStaff } from '@/lib/auth/session';
import { SignInForms } from '@/components/auth/SignInForms';

export const metadata = { title: 'Staff sign in' };
export const dynamic = 'force-dynamic';

export default async function Staff({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const user = await getUser().catch(() => null);
  if (user && !user.is_anonymous) {
    const roles = await getRoles();
    if (isStaff(roles)) redirect(roles.some((r) => r.role === 'admin' || r.role === 'super_admin') ? '/admin' : roles.some((r) => r.role === 'instructor') ? '/teach' : '/admin');
  }
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <Wordmark className="h-7" />
      <p className="eyebrow mt-6">BAYSE staff</p>
      <h1 className="mt-2 text-[30px]">Back office sign in</h1>
      <p className="mt-1 text-sm text-muted">For BAYSE admins, instructors and moderators. Members sign in on the main website.</p>
      {user && !user.is_anonymous ? (
        <div className="mt-5 space-y-3">
          <Notice tone="warning" title="This account has no staff access">You are signed in as {user.email}. Sign out, then sign in with your staff email below.</Notice>
          <form action="/auth/sign-out?next=/staff" method="post"><button className="w-full border border-white py-3 text-sm font-bold uppercase">Sign out of {user.email}</button></form>
        </div>
      ) : sp.denied ? <div className="mt-5"><Notice tone="warning" title="No staff access">Sign in with your staff email below.</Notice></div> : null}
      <div className="mt-6"><SignInForms next="/admin" /></div>
    </main>
  );
}
