'use client';
// "Create your account" (BAYSE On Demand). Keeps what was typed in this browser tab only
// (sessionStorage, never the URL) so the sign-up steps can fill it in, then starts sign-up.
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const SIGNUP_KEY = 'bayse_signup';

export function SignupForm({ tiers }: { tiers: { key: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 rounded-card border border-stone p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try { sessionStorage.setItem(SIGNUP_KEY, JSON.stringify({ name: String(f.get('name') ?? '').trim(), email: String(f.get('email') ?? '').trim(), plan: String(f.get('plan') ?? '') })); } catch { /* optional */ }
        setBusy(true);
        router.push('/start/welcome');
      }}
    >
      <h3 className="text-xl uppercase">Create your account</h3>
      <p className="mt-1 text-sm text-muted">Starts your 7-day free trial. Next we ask a few questions to build your plan.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1 text-sm"><span className="font-semibold">Name</span>
          <input name="name" autoComplete="given-name" maxLength={60} required className="min-h-[44px] rounded-[10px] border border-stone bg-bg px-3 text-base text-ink" /></label>
        <label className="grid gap-1 text-sm"><span className="font-semibold">Email</span>
          <input name="email" type="email" autoComplete="email" required className="min-h-[44px] rounded-[10px] border border-stone bg-bg px-3 text-base text-ink" /></label>
        <label className="grid gap-1 text-sm"><span className="font-semibold">Plan</span>
          <select name="plan" defaultValue={tiers[1]?.key ?? tiers[0]?.key} className="min-h-[44px] rounded-[10px] border border-stone bg-bg px-3 text-base text-ink">
            {tiers.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
          </select></label>
        <button type="submit" disabled={busy} className="min-h-[44px] rounded-full bg-white px-6 font-bold text-black disabled:opacity-60">{busy ? 'One moment…' : 'Continue'}</button>
      </div>
    </form>
  );
}
