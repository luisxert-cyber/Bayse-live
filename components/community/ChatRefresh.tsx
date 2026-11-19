'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Keeps the chat room up to date: asks the server for new messages every few seconds while the page is open and visible. */
export function ChatRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') router.refresh(); };
    const id = window.setInterval(tick, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);
  return null;
}
