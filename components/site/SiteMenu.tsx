'use client';
// Full-screen menu: opens over the page, closes as soon as you pick something, tap the background,
// press Escape or tap ×. Locks page scrolling while open.
// It is drawn on the page body, not inside the header: the header's blurred background would
// otherwise shrink a "full-screen" menu to the height of the header and cut the links off.
// The first `primary` links are the main pages and are shown larger than the rest.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteMenu({ items, signedIn, primary = 0 }: { items: readonly (readonly [string, string])[]; signedIn: boolean; primary?: number }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center sm:right-5">
        <span className="block h-[2px] w-6 bg-ink shadow-[0_7px_0_rgb(255_255_255),0_-7px_0_rgb(255_255_255)]" />
      </button>
      {open && createPortal(
        <div data-menu role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex h-dvh flex-col bg-black text-ink"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Menu</span>
            <button type="button" onClick={close} aria-label="Close menu" className="grid h-10 w-10 place-items-center text-3xl leading-none">×</button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
            {items.map(([href, label], i) => (
              <Link key={href} href={href} onClick={close}
                className={`block border-b border-stone font-display font-bold uppercase leading-none hover:text-muted ${i < primary ? 'py-5 text-[34px]' : 'py-3.5 text-[19px] text-white/80'}`}>{label}</Link>
            ))}
          </nav>
          <div className="grid gap-3 border-t border-stone px-5 py-5">
            {signedIn ? (
              <Link href="/today" onClick={close} className="flex min-h-[50px] items-center justify-center bg-white font-bold uppercase text-black">My BAYSE</Link>
            ) : (
              <>
                <Link href="/start/welcome" onClick={close} className="flex min-h-[50px] items-center justify-center bg-white font-bold uppercase text-black">Start my 7-day free trial</Link>
                <Link href="/sign-in" onClick={close} className="flex min-h-[50px] items-center justify-center border border-white font-bold uppercase">Sign in</Link>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
