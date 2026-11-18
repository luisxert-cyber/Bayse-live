import Link from 'next/link';
import { Wordmark } from '@/components/ui';

// Studio-brand header: centred BAYSE logo, an icon row (Live, On demand, Login, Start free) and a menu.
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

const I = {
  live: <path d="M3 7h12v10H3zM15 10l6-3v10l-6-3" />,
  play: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></>,
  login: <path d="M10 17l5-5-5-5M15 12H3M14 3h6v18h-6" />,
  join: <><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
};
const Icon = ({ d }: { d: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const actions = [
    ['/#live', 'Live', I.live],
    ['/#classes', 'On demand', I.play],
    signedIn ? ['/today', 'My BAYSE', I.user] : ['/sign-in', 'Login', I.login],
    ...(signedIn ? [] : [['/start/welcome', 'Start free', I.join]]),
  ] as [string, string, React.ReactNode][];
  return (
    <header className="sticky top-0 z-20 border-b border-stone bg-bg/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="relative mx-auto max-w-6xl px-4 pb-2 pt-3 sm:px-6">
        <Link href="/" aria-label="BAYSE home" className="mx-auto block w-fit text-center">
          <Wordmark className="mx-auto h-7 sm:h-8" />
        </Link>
        <nav aria-label="Main" className="mx-auto mt-2 flex w-fit items-stretch divide-x divide-stone">
          {actions.map(([href, label, icon]) => (
            <Link key={label} href={href} className="flex min-w-[68px] flex-col items-center gap-1 px-3 py-1 text-[11px] hover:opacity-80 sm:min-w-[90px] sm:text-[12px]">
              <Icon d={icon} />{label}
            </Link>
          ))}
        </nav>
        <details className="group absolute right-4 top-4 sm:right-6">
          <summary aria-label="Menu" className="grid h-10 w-10 cursor-pointer list-none place-items-center">
            <span className="block h-[2px] w-6 bg-ink shadow-[0_7px_0_rgb(255_255_255),0_-7px_0_rgb(255_255_255)]" />
          </summary>
          <div className="absolute right-0 top-12 w-64 border border-stone bg-bg p-2">
            {MENU.map(([href, label]) => (
              <Link key={href} href={href} className="block px-3 py-2.5 font-medium hover:bg-surface">{label}</Link>
            ))}
            <Link href={signedIn ? '/today' : '/sign-in'} className="block border-t border-stone px-3 py-2.5 font-medium hover:bg-surface">{signedIn ? 'My BAYSE' : 'Sign in'}</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
