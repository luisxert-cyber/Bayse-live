'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { buttonClass } from '@/components/ui/Button';

function safe(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/auth/home';
}

// Finishes an email link (password reset or sign-in link) in whatever browser opened it.
// The session tokens arrive in the #fragment, never in the query string, so they are not sent to any server log.
export function LinkSignIn() {
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get('access_token');
    const refresh_token = hash.get('refresh_token');
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (!access_token || !refresh_token) { setFailed(true); return; }
    createClient().auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) setFailed(true);
      else window.location.replace(safe(params.get('next')));
    });
  }, [params]);
  if (!failed) return <p className="text-center text-muted">Signing you in…</p>;
  return (
    <div>
      <h1 className="text-xl font-semibold">That link has expired</h1>
      <p className="mb-6 mt-2 text-muted">Email links work once and expire after an hour. Ask for a new one and tap it straight away.</p>
      <Link href="/sign-in" className={buttonClass('primary', true)}>Back to sign in</Link>
    </div>
  );
}
