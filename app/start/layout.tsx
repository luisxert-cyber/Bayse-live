import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';

// Sign-up lives inside the website: same header and menu, so it never feels like leaving BAYSE.
export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-3 sm:px-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">← Back to site</Link>
        {children}
      </main>
    </div>
  );
}
