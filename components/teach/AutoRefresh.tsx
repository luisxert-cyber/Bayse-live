'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Re-reads the page every few seconds while it is open and visible, so a list stays up to date during a class. */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
