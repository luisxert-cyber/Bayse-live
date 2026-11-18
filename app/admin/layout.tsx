import Link from 'next/link';
import { requireStaff, canUse, type StaffArea } from '@/lib/auth/session';
import { Wordmark } from '@/components/ui';
import { Sidebar } from '@/components/staff/Sidebar';

const NAV: { href: string; label: string; area: StaffArea }[] = [
  { href: '/admin', label: 'Dashboard', area: 'overview' },
  { href: '/admin/members', label: 'Members', area: 'members' },
  { href: '/admin/staff', label: 'Staff and instructors', area: 'staff' },
  { href: '/admin/classes', label: 'Live classes', area: 'classes' },
  { href: '/admin/sessions', label: '1-to-1 sessions', area: 'sessions' },
  { href: '/admin/pay', label: 'Instructor pay', area: 'pay' },
  { href: '/admin/plans', label: 'Plans and prices', area: 'plans' },
  { href: '/admin/on-demand', label: 'On-demand classes', area: 'content' },
  { href: '/admin/videos', label: 'Move clips and voice', area: 'content' },
  { href: '/admin/reports', label: 'Community reports', area: 'reports' },
  { href: '/admin/rewards', label: 'Rewards', area: 'rewards' },
  { href: '/admin/flags', label: 'Feature flags', area: 'flags' },
  { href: '/admin/audit', label: 'Audit log', area: 'audit' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { roles, user } = await requireStaff();
  const nav = NAV.filter((n) => canUse(roles, n.area));
  const roleLabel = roles.some((r) => r.role === 'super_admin') ? 'Owner' : roles.some((r) => r.role === 'admin') ? 'Admin' : roles.some((r) => r.role === 'virtual_assistant') ? 'Virtual assistant' : roles.some((r) => r.role === 'instructor') ? 'Instructor' : 'Moderator';
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <Sidebar root="/admin" brand={<><Wordmark className="h-4" /><span className="eyebrow">Staff</span></>} who={`${user.email} · ${roleLabel}`} links={nav.map((n) => ({ href: n.href, label: n.label }))}
        extra={<>
          {roles.some((r) => r.role === 'instructor') && <Link href="/teach" className="px-3 py-2.5 text-sm text-muted hover:text-ink">My instructor portal ›</Link>}
          <Link href="/" className="px-3 py-2.5 text-sm text-muted hover:text-ink">← Website</Link>
          <form action="/auth/sign-out?next=/staff" method="post"><button className="w-full px-3 py-2.5 text-left text-sm text-muted hover:text-ink">Sign out</button></form>
        </>} />
      <main className="page-wide min-w-0">{children}</main>
    </div>
  );
}
