import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { Wordmark } from '@/components/ui';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/plans', label: 'Plans and prices' },
  { href: '/admin/videos', label: 'Move videos' },
  { href: '/admin/flags', label: 'Feature flags' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-stone bg-surface md:min-h-dvh md:border-b-0 md:border-r">
        <div className="flex h-14 items-center gap-3 px-5"><Wordmark className="h-4" /><span className="eyebrow">Admin</span></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted hover:bg-stone/40 hover:text-ink">{n.label}</Link>)}
          <Link href="/today" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted hover:text-ink md:mt-6">← Member app</Link>
        </nav>
      </aside>
      <main className="page-wide">{children}</main>
    </div>
  );
}
