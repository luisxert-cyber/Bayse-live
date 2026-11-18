import Link from 'next/link';
import { Wordmark } from '@/components/ui';

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-14 max-w-xl items-center justify-between px-4 sm:px-6" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        <Link href="/" aria-label="BAYSE home"><Wordmark className="h-5" /></Link>
        <Link href="/sign-in" className="text-sm text-muted hover:text-ink">Sign in</Link>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 pb-10 sm:px-6">{children}</main>
    </div>
  );
}
