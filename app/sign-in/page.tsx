import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SignInForms } from '@/components/auth/SignInForms';
import { safeNext } from '@/lib/auth/session';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <>
    <SiteHeader />
    <main className="mx-auto flex max-w-sm flex-col px-4 py-10">
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 mt-1 text-muted">Sign in to your BAYSE account.</p>
      {sp.error === 'link' && <p role="alert" className="mb-4 text-sm text-clay">That link has expired or was already used. Please request a new one.</p>}
      <SignInForms next={safeNext(sp.next)} />
      <p className="mt-8 text-center text-sm text-muted">New to BAYSE? <Link href="/start/welcome" className="text-ink underline">Build my plan</Link></p>
    </main>
    </>
  );
}
