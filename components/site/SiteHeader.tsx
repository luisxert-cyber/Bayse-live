import Link from 'next/link';
import { Wordmark } from '@/components/ui';
import { SiteMenu } from './SiteMenu';

// Studio-brand header: BAYSE logo, the free-trial button and a full-screen menu.
// The first three are the main pages and show larger in the menu.
const MENU = [
  ['/pricing', 'Pricing'],
  ['/features', 'Features'],
  ['/the-community', 'Community'],
  ['/who-its-for', 'Who it’s for'],
  ['/free-trial', '7-day free trial'],
  ['/live-classes', 'Live classes'],
  ['/classes', 'On-demand classes'],
  ['/programmes', 'Programmes'],
  ['/instructors', 'Instructors and 1-to-1s'],
  ['/reformer', 'Reformer at home'],
  ['/benefits', 'Benefits'],
  ['/faq', 'Questions'],
  ['/#studios', 'Find your local studio'],
] as const;
const MAIN_PAGES = 3;

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone bg-bg/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <Link href="/" aria-label="BAYSE home" className="shrink-0"><Wordmark className="h-7 sm:h-8" /></Link>
        <div className="flex items-center gap-2 pr-12 sm:gap-3">
          {signedIn ? (
            <Link href="/today" className="inline-flex min-h-[38px] items-center bg-white px-4 text-[12px] font-bold uppercase tracking-[0.02em] text-black hover:opacity-90 sm:text-[13px]">My BAYSE</Link>
          ) : (
            <>
              <Link href="/sign-in" className="inline-flex min-h-[38px] items-center border border-white px-3.5 text-[12px] font-bold uppercase tracking-[0.02em] hover:bg-white hover:text-black sm:px-5 sm:text-[13px]">Log in</Link>
              <Link href="/start/welcome" className="inline-flex min-h-[38px] items-center bg-white px-3.5 text-[12px] font-bold uppercase tracking-[0.02em] text-black hover:opacity-90 sm:px-5 sm:text-[13px]">Free trial</Link>
            </>
          )}
        </div>
        <SiteMenu items={MENU} primary={MAIN_PAGES} signedIn={signedIn} />
      </div>
    </header>
  );
}
