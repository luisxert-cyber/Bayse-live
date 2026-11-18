import Link from 'next/link';
import { Wordmark, buttonClass } from '@/components/ui';

// BAYSE On Demand style header: white bar, logo left, links and one pill action on the right.
const LINKS = [
  ['/#classes', 'Classes'],
  ['/#plans', 'Programmes'],
  ['/live-and-community', 'Live & community'],
  ['/#membership', 'Membership'],
] as const;

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone bg-bg/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="BAYSE home" className="flex items-center gap-2">
          <Wordmark className="h-8" />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted sm:inline">On Demand</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="hidden text-[15px] font-medium text-muted hover:text-ink lg:inline">{label}</Link>
          ))}
          {!signedIn && <Link href="/sign-in" className="hidden text-[15px] font-medium text-muted hover:text-ink sm:inline">Sign in</Link>}
          <Link href={signedIn ? '/today' : '/start/welcome'} className={`${buttonClass('primary')} !min-h-[40px] !px-4 text-sm`}>{signedIn ? 'My BAYSE' : 'Start free'}</Link>
          <details className="group relative lg:hidden">
            <summary aria-label="Menu" className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full border border-stone">
              <span className="block h-[2px] w-4 bg-ink shadow-[0_5px_0_rgb(10_10_10),0_-5px_0_rgb(10_10_10)]" />
            </summary>
            <div className="absolute right-0 top-12 w-60 rounded-2xl border border-stone bg-bg p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]">
              {[...LINKS, ...(signedIn ? [] : [['/sign-in', 'Sign in'] as const]), ['https://www.baysereformerpilates.com', 'Our studios'] as const].map(([href, label]) => (
                <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 font-medium hover:bg-surface">{label}</Link>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
