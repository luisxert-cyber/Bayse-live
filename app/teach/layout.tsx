import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { Wordmark } from '@/components/ui';

export const dynamic = 'force-dynamic';

const NAV = [
  ['/teach', 'Today'],
  ['/teach/sessions', '1-to-1s'],
  ['/teach/classes', 'My classes'],
  ['/teach/spotter', 'Spotter'],
  ['/teach/availability', 'Availability'],
  ['/teach/profile', 'My profile'],
  ['/teach/pay', 'My pay'],
] as const;

// The instructor portal: separate from the admin back office, showing only this instructor's work.
export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const { user, me, isAdmin } = await requireInstructor();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-stone bg-surface md:min-h-dvh md:border-b-0 md:border-r">
        <div className="flex h-14 items-center gap-3 px-5"><Wordmark className="h-4" /><span className="eyebrow">Instructor</span></div>
        <p className="hidden px-5 pb-3 text-xs text-muted md:block">{me?.display_name ?? user.email}</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap px-3 py-2 text-sm text-muted hover:bg-stone/40 hover:text-ink">{label}</Link>)}
          {isAdmin && <Link href="/admin" className="whitespace-nowrap px-3 py-2 text-sm text-muted hover:text-ink md:mt-6">Admin back office ›</Link>}
          <Link href="/" className="whitespace-nowrap px-3 py-2 text-sm text-muted hover:text-ink">← Website</Link>
          <form action="/auth/sign-out?next=/staff" method="post"><button className="whitespace-nowrap px-3 py-2 text-left text-sm text-muted hover:text-ink">Sign out</button></form>
        </nav>
      </aside>
      <main className="page-wide">
        {!me ? <p className="border border-stone p-4 text-sm text-muted">You are viewing the instructor portal as an admin without your own instructor profile. Add yourself as an instructor in Staff and instructors to use it fully.</p> : children}
      </main>
    </div>
  );
}
