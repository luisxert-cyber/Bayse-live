'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/cx';

const TABS = [
  { href: '/today', label: 'Today', icon: 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { href: '/train', label: 'Train', icon: 'M8 5v14l11-7z' },
  { href: '/live', label: 'Live', icon: 'M15 10l5-3v10l-5-3M4 6h11v12H4z' },
  { href: '/community', label: 'Community', icon: 'M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5m2-5c3 0 6 2 6 5' },
  { href: '/you', label: 'You', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9c0-4 4-6 8-6s8 2 8 6' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-stone bg-surface/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + '/');
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? 'page' : undefined} className={cx('flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px]', active ? 'text-ink' : 'text-muted hover:text-ink')}>
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={t.icon} /></svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
