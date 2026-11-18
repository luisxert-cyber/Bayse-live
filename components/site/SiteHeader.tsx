import Link from 'next/link';
import { Wordmark } from '@/components/ui';

// Mirrors baysereformerpilates.com: centred logo, menu on the right, and an icon bar
// with thin white dividers underneath.
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const ICONS = {
  live: <svg viewBox="0 0 24 24" {...I}><rect x="3" y="6" width="13" height="12" rx="1" /><path d="M16 10l5-3v10l-5-3" /></svg>,
  play: <svg viewBox="0 0 24 24" {...I}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></svg>,
  login: <svg viewBox="0 0 24 24" {...I}><path d="M14 3h5a1 1 0 011 1v16a1 1 0 01-1 1h-5M3 12h12M11 8l4 4-4 4" /></svg>,
  join: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="4" /><path d="M1.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5z" /><path d="M19 7v6M16 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  today: <svg viewBox="0 0 24 24" {...I}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /></svg>,
};

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const bar = signedIn
    ? [['/#live', 'Live', ICONS.live], ['/#on-demand', 'On demand', ICONS.play], ['/today', 'My BAYSE', ICONS.today]] as const
    : [['/#live', 'Live', ICONS.live], ['/#on-demand', 'On demand', ICONS.play], ['/sign-in', 'Login', ICONS.login], ['/start/welcome', 'Start free', ICONS.join]] as const;
  return (
    <header className="sticky top-0 z-20 bg-black" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="relative mx-auto flex h-[76px] max-w-5xl items-center justify-center border-b border-white px-4">
        <Link href="/" aria-label="BAYSE home"><Wordmark className="h-11" /></Link>
        <details className="group absolute right-4 top-1/2 -translate-y-1/2">
          <summary className="flex h-11 w-11 cursor-pointer list-none flex-col items-center justify-center gap-[7px]" aria-label="Menu">
            <span className="block h-[3px] w-8 bg-white" /><span className="block h-[3px] w-8 bg-white" /><span className="block h-[3px] w-8 bg-white" />
          </summary>
          <nav className="absolute right-0 top-14 w-56 border-[3px] border-white bg-black py-2 text-sm font-bold uppercase">
            {[['/#live', 'Live classes'], ['/#on-demand', 'On demand'], ['/#programmes', 'Programmes'], ['/#community', 'Community'], ['/pricing', 'Membership'], ['/#faq', 'Questions'], ['https://www.baysereformerpilates.com', 'Our studios']].map(([href, label]) => (
              <Link key={href} href={href} className="block px-4 py-2.5 hover:bg-white hover:text-black">{label}</Link>
            ))}
          </nav>
        </details>
      </div>
      <nav aria-label="Quick links" className="border-b border-white">
        <ul className="mx-auto flex max-w-xl justify-center">
          {bar.map(([href, label, icon]) => (
            <li key={href} className="flex-1 border-r border-white first:border-l">
              <Link href={href} className="flex min-h-[80px] flex-col items-center justify-center gap-1.5 text-[13px] hover:bg-white hover:text-black">
                <span className="h-8 w-8">{icon}</span>{label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
