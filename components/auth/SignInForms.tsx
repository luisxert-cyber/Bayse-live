'use client';
import { useActionState, useEffect, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { signIn, sendMagicLink, sendReset, type AuthState } from '@/app/sign-in/actions';

const REMEMBER_KEY = 'bayse_email';

export function SignInForms({ next }: { next: string }) {
  const [mode, setMode] = useState<'password' | 'link' | 'reset'>('password');
  const [pwState, pwAction, pwPending] = useActionState<AuthState, FormData>(signIn, undefined);
  const [linkState, linkAction, linkPending] = useActionState<AuthState, FormData>(sendMagicLink, undefined);
  const [resetState, resetAction, resetPending] = useActionState<AuthState, FormData>(sendReset, undefined);

  // "Remember me": the email is kept on this device and filled in next time. Passwords are never stored by BAYSE;
  // the phone or browser's own password manager saves and fills those (the fields are labelled so it can).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      const el = document.getElementById('email') as HTMLInputElement | null;
      if (saved && el && !el.value) el.value = saved;
    } catch { /* private browsing: nothing to restore */ }
  }, [mode]);
  const remember = (e: FormEvent<HTMLFormElement>) => {
    try {
      const form = new FormData(e.currentTarget);
      if (form.get('remember') === 'on') window.localStorage.setItem(REMEMBER_KEY, String(form.get('email') ?? '').trim());
      else window.localStorage.removeItem(REMEMBER_KEY);
    } catch { /* storage unavailable */ }
  };

  if (mode === 'link') {
    return (
      <form action={linkAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {linkState?.sent ? <Notice tone="success" title="Check your email">If there is a BAYSE account for that address, a sign-in link is on its way.</Notice> : null}
        {linkState?.error && <Notice tone="error">{linkState.error}</Notice>}
        <Field id="email" name="email" type="email" label="Email" autoComplete="email" required />
        <button disabled={linkPending} className={buttonClass('primary', true)}>{linkPending ? 'Sending…' : 'Email me a sign-in link'}</button>
        <button type="button" onClick={() => setMode('password')} className="block w-full py-2 text-sm text-muted hover:text-ink">Use my password instead</button>
      </form>
    );
  }
  if (mode === 'reset') {
    return (
      <form action={resetAction} className="space-y-4">
        {resetState?.sent ? <Notice tone="success" title="Check your email">If there is a BAYSE account for that address, a reset link is on its way.</Notice> : null}
        {resetState?.error && <Notice tone="error">{resetState.error}</Notice>}
        <Field id="email" name="email" type="email" label="Email" autoComplete="email" required />
        <button disabled={resetPending} className={buttonClass('primary', true)}>{resetPending ? 'Sending…' : 'Send reset link'}</button>
        <button type="button" onClick={() => setMode('password')} className="block w-full py-2 text-sm text-muted hover:text-ink">Back to sign in</button>
      </form>
    );
  }
  return (
    <form action={pwAction} onSubmit={remember} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {pwState?.error && <Notice tone="error">{pwState.error}</Notice>}
      <Field id="email" name="email" type="email" label="Email" autoComplete="username" required />
      <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
      <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" name="remember" defaultChecked className="h-5 w-5 accent-white" />Remember me on this device</label>
      <button disabled={pwPending} className={buttonClass('primary', true)}>{pwPending ? 'Signing in…' : 'Sign in'}</button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setMode('link')} className="py-2 text-muted hover:text-ink">Email me a link</button>
        <button type="button" onClick={() => setMode('reset')} className="py-2 text-muted hover:text-ink">Forgot password?</button>
      </div>
    </form>
  );
}
