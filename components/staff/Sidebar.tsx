'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export type SideLink = { href: string; label: string };

/**
 * The staff side bar. On a computer it sits down the left. On a phone it is tucked away
 * behind a Menu button and slides in from the left, so the page itself gets the full width.
 */
export function Sidebar({ brand, who, links, extra, root }: { brand: ReactNode; who?: ReactNode; links: SideLink[]; extra?: ReactNode; root: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const active = (href: string) => (href === root ? path === root : path === href || path.startsWith(`${href}/`));
  const current = links.find((l) => active(l.href))?.label;
  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-stone bg-surface px-4 md:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="staff-sidebar" className="flex min-h-[40px] items-center gap-2 border border-stone px-3 text-xs font-bold uppercase tracking-wide">
          <span aria-hidden className="grid gap-[3px]"><span className="block h-[2px] w-4 bg-current" /><span className="block h-[2px] w-4 bg-current" /><span className="block h-[2px] w-4 bg-current" /></span>
          Menu
        </button>
        <span className="truncate text-sm text-muted">{current}</span>
        <span className="flex items-center gap-2">{brand}</span>
      </div>
      {open && <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/70 md:hidden" />}
      <aside id="staff-sidebar" className={`fixed inset-y-0 left-0 z-50 flex w-[272px] max-w-[85vw] flex-col overflow-y-auto border-r border-stone bg-surface transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-dvh md:w-auto md:max-w-none md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-5">
          <span className="flex items-center gap-3">{brand}</span>
          <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 text-sm text-muted hover:text-ink md:hidden">Close</button>
        </div>
        {who && <p className="break-words px-5 pb-3 text-xs text-muted">{who}</p>}
        <nav className="flex flex-col gap-0.5 px-3 pb-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={active(l.href) ? 'page' : undefined}
              className={`border-l-2 px-3 py-2.5 text-sm ${active(l.href) ? 'border-white bg-stone/40 font-bold text-ink' : 'border-transparent text-muted hover:bg-stone/40 hover:text-ink'}`}>
              {l.label}
            </Link>
          ))}
          {extra && <div onClick={() => setOpen(false)} className="mt-5 flex flex-col gap-0.5 border-t border-stone pt-3">{extra}</div>}
        </nav>
      </aside>
    </>
  );
}
