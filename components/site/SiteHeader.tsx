import Link from 'next/link';
import { Wordmark, buttonClass } from '@/components/ui';

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone/70 bg-bg/90 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="BAYSE home"><Wordmark className="h-6" /></Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/pricing" className="hidden rounded-pill px-3 py-2 text-muted hover:text-ink sm:inline-block">Membership</Link>
          {signedIn ? (
            <Link href="/today" className={buttonClass('primary')}>Open BAYSE</Link>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-pill px-3 py-2 text-muted hover:text-ink">Sign in</Link>
              <Link href="/start/welcome" className={buttonClass('primary')}>Build my plan</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
