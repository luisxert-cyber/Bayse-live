import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { Wordmark } from '@/components/ui';
import { Sidebar } from '@/components/staff/Sidebar';

export const dynamic = 'force-dynamic';

const NAV = [
  ['/teach', 'Today'],
  ['/teach/sessions', '1-to-1s'],
  ['/teach/classes', 'My classes'],
  ['/teach/availability', 'Availability'],
  ['/teach/profile', 'My profile'],
  ['/teach/welcome', 'My details'],
  ['/teach/pay', 'My pay'],
] as const;

// The instructor portal: separate from the admin back office, showing only this instructor's work.
export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const { user, me, isAdmin } = await requireInstructor();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <Sidebar root="/teach" brand={<><Wordmark className="h-4" /><span className="eyebrow">Instructor</span></>} who={me?.display_name ?? user.email} links={NAV.map(([href, label]) => ({ href, label }))}
        extra={<>
          {isAdmin && <Link href="/admin" className="px-3 py-2.5 text-sm text-muted hover:text-ink">Admin back office ›</Link>}
          <Link href="/" className="px-3 py-2.5 text-sm text-muted hover:text-ink">← Website</Link>
          <form action="/auth/sign-out?next=/staff" method="post"><button className="w-full px-3 py-2.5 text-left text-sm text-muted hover:text-ink">Sign out</button></form>
        </>} />
      <main className="page-wide min-w-0">
        {!me ? <p className="border border-stone p-4 text-sm text-muted">You are viewing the instructor portal as an admin without your own instructor profile. Add yourself as an instructor in Staff and instructors to use it fully.</p> : children}
      </main>
    </div>
  );
}
