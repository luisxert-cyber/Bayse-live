import Link from 'next/link';
import { Wordmark } from '@/components/ui';
import { SiteMenu } from './SiteMenu';

// Studio-brand header: BAYSE logo, the free-trial button and a full-screen menu.
const MENU = [
  ['/#classes', 'Classes'],
  ['/#plans', 'Programmes'],
  ['/#live', 'Live timetable'],
  ['/#community', 'Community'],
  ['/#membership', 'Membership'],
  ['/#different', 'Why BAYSE'],
  ['/#faq', 'Questions'],
  ['https://www.baysereformerpilates.com', 'Our studios'],
] as const;

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone bg-bg/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <Link href="/" aria-label="BAYSE home" className="shrink-0"><Wordmark className="h-7 sm:h-8" /></Link>
        <div className="flex items-center gap-2 pr-12 sm:gap-3">
          {!signedIn && <Link href="/sign-in" className="hidden px-2 text-sm font-medium text-muted hover:text-ink sm:inline">Sign in</Link>}
          <Link href={signedIn ? '/today' : '/start/welcome'} className="inline-flex min-h-[38px] items-center bg-white px-3.5 text-[12px] font-bold uppercase tracking-[0.02em] text-black hover:opacity-90 sm:px-5 sm:text-[13px]">
            {signedIn ? 'My BAYSE' : <><span className="sm:hidden">Free trial</span><span className="hidden sm:inline">Start 7-day free trial</span></>}
          </Link>
        </div>
        <SiteMenu items={MENU} signedIn={signedIn} />
      </div>
    </header>
  );
}
