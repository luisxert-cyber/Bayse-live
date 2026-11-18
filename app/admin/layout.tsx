import Link from 'next/link';
import { requireStaff, canUse, type StaffArea } from '@/lib/auth/session';
import { Wordmark } from '@/components/ui';

const NAV: { href: string; label: string; area: StaffArea }[] = [
  { href: '/admin', label: 'Dashboard', area: 'overview' },
  { href: '/admin/members', label: 'Members', area: 'members' },
  { href: '/admin/leads', label: 'Free challenge sign-ups', area: 'members' },
  { href: '/admin/staff', label: 'Staff and instructors', area: 'staff' },
  { href: '/admin/classes', label: 'Live classes', area: 'classes' },
  { href: '/admin/sessions', label: '1-to-1 sessions', area: 'sessions' },
  { href: '/admin/pay', label: 'Instructor pay', area: 'pay' },
  { href: '/admin/plans', label: 'Plans and prices', area: 'plans' },
  { href: '/admin/on-demand', label: 'On-demand classes', area: 'content' },
  { href: '/admin/videos', label: 'Move clips and voice', area: 'content' },
  { href: '/admin/reports', label: 'Community reports', area: 'reports' },
  { href: '/admin/rewards', label: 'Rewards', area: 'rewards' },
  { href: '/admin/challenges', label: 'Monthly challenges', area: 'rewards' },
  { href: '/admin/flags', label: 'Feature flags', area: 'flags' },
  { href: '/admin/audit', label: 'Audit log', area: 'audit' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { roles, user } = await requireStaff();
  const nav = NAV.filter((n) => canUse(roles, n.area));
  const roleLabel = roles.some((r) => r.role === 'super_admin') ? 'Owner' : roles.some((r) => r.role === 'admin') ? 'Admin' : roles.some((r) => r.role === 'instructor') ? 'Instructor' : 'Moderator';
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-stone bg-surface md:min-h-dvh md:border-b-0 md:border-r">
        <div className="flex h-14 items-center gap-3 px-5"><Wordmark className="h-4" /><span className="eyebrow">Staff</span></div>
        <p className="hidden px-5 pb-3 text-xs text-muted md:block">{user.email} · {roleLabel}</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted hover:bg-stone/40 hover:text-ink">{n.label}</Link>)}
          {roles.some((r) => r.role === 'instructor') && <Link href="/teach" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted hover:text-ink md:mt-6">My instructor portal ›</Link>}
          <Link href="/" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted hover:text-ink md:mt-6">← Website</Link>
          <form action="/auth/sign-out?next=/staff" method="post"><button className="whitespace-nowrap px-3 py-2 text-left text-sm text-muted hover:text-ink">Sign out</button></form>
        </nav>
      </aside>
      <main className="page-wide">{children}</main>
    </div>
  );
}
