import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/ui';
import { SignInForms } from '@/components/auth/SignInForms';
import { getUser, safeNext } from '@/lib/auth/session';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

// Member sign in. No website menu here: one job, signing in. Anyone already signed in goes straight to the app.
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const user = await getUser().catch(() => null);
  if (user && !user.is_anonymous && !sp.error) redirect(next);
  return (
    <main className="min-h-dvh md:grid md:grid-cols-2">
      <div className="relative h-[34vh] min-h-[220px] md:h-auto md:min-h-dvh">
        <img src="/images/studio-movement.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 md:bg-gradient-to-r md:from-black/20 md:via-black/10 md:to-black" />
        <Link href="/" aria-label="The BAYSE Club home" className="absolute left-5 top-5 sm:left-8 sm:top-8"><Wordmark className="h-7" /></Link>
        <p className="absolute bottom-5 left-5 right-5 text-[13px] font-bold uppercase tracking-[0.14em] text-white/85 sm:left-8">Pilates, nutrition &amp; personal coaching for women</p>
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-5 pb-12 pt-8 md:px-8">
        <p className="eyebrow">The BAYSE Club</p>
        <h1 className="mt-2 text-[34px] leading-none">Welcome back</h1>
        <p className="mb-6 mt-2 text-muted">Sign in to pick up where you left off.</p>
        {sp.error === 'link' && <p role="alert" className="mb-4 text-sm text-clay">That link has expired or was already used. Please request a new one.</p>}
        <SignInForms next={next} />
        <p className="mt-8 border-t border-stone pt-5 text-center text-sm text-muted">New to BAYSE? <Link href="/start/welcome" className="text-ink underline">Build my plan</Link></p>
      </div>
    </main>
  );
}
