import Link from 'next/link';
import { Wordmark } from '@/components/ui';

export function SiteFooter() {
  return (
    <footer className="border-t border-stone">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm text-muted sm:grid-cols-3 sm:px-6">
        <div>
          <Wordmark className="h-5" />
          <p className="mt-3 max-w-xs">Your programme. Your coach. Your people. From the team behind BAYSE Reformer Pilates studios.</p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">BAYSE</p>
          <Link href="/live-classes" className="block hover:text-ink">Live classes</Link>
          <Link href="/classes" className="block hover:text-ink">On-demand classes</Link>
          <Link href="/programmes" className="block hover:text-ink">Programmes</Link>
          <Link href="/instructors" className="block hover:text-ink">Instructors and 1-to-1s</Link>
          <Link href="/clubs" className="block hover:text-ink">Community and Clubs</Link>
          <Link href="/faq" className="block hover:text-ink">Questions</Link>
          <Link href="/pricing" className="block hover:text-ink">Membership</Link>
          <Link href="/start/welcome" className="block hover:text-ink">Build my plan</Link>
          <a href="https://www.baysereformerpilates.com" className="block hover:text-ink">Our studios</a>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Your data</p>
          <Link href="/privacy" className="block hover:text-ink">Privacy</Link>
          <Link href="/terms" className="block hover:text-ink">Terms</Link>
          <Link href="/community-guidelines" className="block hover:text-ink">Community guidelines</Link>
          <Link href="/staff" className="block hover:text-ink">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}
