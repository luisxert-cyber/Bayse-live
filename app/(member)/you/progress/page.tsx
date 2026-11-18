import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { loadDaily } from '@/lib/daily/data';
import { computeProgress } from '@/lib/daily/progress';
import { Notice } from '@/components/ui';
import { claimReward } from './actions';

export const metadata = { title: 'Your progress' };
export const dynamic = 'force-dynamic';

type Reward = { id: string; title: string; description: string; partner: string | null; min_classes: number; claimed: boolean; places_left: number; my_classes: number };

export default async function Progress({ searchParams }: { searchParams: Promise<{ e?: string; claimed?: string }> }) {
  const user = await requireUser('/you/progress');
  const sp = await searchParams;
  const daily = await loadDaily(user.id);
  const p = computeProgress(daily.completions);
  const supabase = await createClient();
  const { data } = await supabase.rpc('my_rewards');
  const rewards = (data ?? []) as Reward[];
  // Codes are only ever returned by the server, and only for rewards this member has claimed.
  const codes = new Map<string, { code: string | null; how: string | null }>();
  for (const r of rewards.filter((x) => x.claimed)) {
    const { data: c } = await supabase.rpc('claim_reward', { p_offer: r.id });
    const row = ((c ?? []) as { code: string | null; how_to_use: string | null }[])[0];
    codes.set(r.id, { code: row?.code ?? null, how: row?.how_to_use ?? null });
  }
  const max = Math.max(1, daily.weeklyGoal, ...p.perWeek);
  const earned = p.milestones.filter((m) => m.earned), next = p.milestones.filter((m) => !m.earned).slice(0, 3);
  return (
    <main className="page space-y-5">
      <Link href="/you" className="text-sm text-muted hover:text-ink">← You</Link>
      <div>
        <h1 className="text-[30px] leading-none">Progress</h1>
        <p className="mt-2 text-muted">Consistency and milestones, not the scales.</p>
      </div>
      {sp.e && <Notice tone="error">{sp.e}</Notice>}
      {sp.claimed && <Notice tone="success" title="Reward claimed">Well earned. Your code and how to use it are below.</Notice>}

      <div className="grid grid-cols-3 gap-px border border-stone bg-stone text-center">
        {[[p.classes, 'classes'], [`${p.hours}h`, 'trained'], [p.streak, 'week streak']].map(([n, l]) => (
          <div key={l as string} className="bg-bg px-2 py-4"><p className="text-[32px] font-bold leading-none">{n}</p><p className="mt-1 text-xs text-muted">{l}</p></div>
        ))}
      </div>

      <section className="border border-stone p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">Sessions per week</p><p className="text-xs text-muted">Goal: {daily.weeklyGoal}</p></div>
        <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label={`Sessions in the last 8 weeks: ${p.perWeek.join(', ')}`}>
          {p.perWeek.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-muted">{n || ''}</span>
              <div className={`w-full ${i === 7 ? 'bg-white' : 'bg-stone'}`} style={{ height: `${Math.max(3, (n / max) * 100)}%` }} />
            </div>
          ))}
        </div>
        <p className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted"><span>8 weeks ago</span><span>This week</span></p>
        <p className="mt-3 text-sm text-muted">Best streak: {p.best} {p.best === 1 ? 'week' : 'weeks'}. {p.daysSince === null ? 'Finish your first class to start.' : p.daysSince === 0 ? 'You moved today.' : `Last session ${p.daysSince} day${p.daysSince === 1 ? '' : 's'} ago.`}</p>
      </section>

      <section className="space-y-2">
        <p className="eyebrow">Milestones</p>
        <ul className="grid grid-cols-2 gap-2">
          {[...earned, ...next].map((m) => (
            <li key={m.key} className={`border p-3 ${m.earned ? 'border-white' : 'border-dashed border-stone text-muted'}`}>
              <p className="font-bold">{m.earned ? '★ ' : ''}{m.label}</p>
              <p className="mt-0.5 text-xs text-muted">{m.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <p className="eyebrow">BAYSE Rewards</p>
        {rewards.length ? (
          <ul className="space-y-2">
            {rewards.map((r) => {
              const ready = r.my_classes >= r.min_classes;
              return (
                <li key={r.id} className="border border-stone p-4">
                  <p className="font-bold">{r.title}{r.partner ? <span className="font-normal text-muted"> · {r.partner}</span> : null}</p>
                  <p className="mt-1 text-sm text-muted">{r.description}</p>
                  <div className="mt-3 h-1 bg-stone"><div className="h-full bg-white" style={{ width: `${Math.min(100, (r.my_classes / r.min_classes) * 100)}%` }} /></div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted">{Math.min(r.my_classes, r.min_classes)} of {r.min_classes} classes{r.places_left < 20 && !r.claimed ? ` · ${r.places_left} left` : ''}</span>
                    {r.claimed
                      ? <span className="text-xs font-bold uppercase">Claimed</span>
                      : ready && r.places_left > 0
                        ? <form action={claimReward}><input type="hidden" name="offer_id" value={r.id} /><button className="border border-ink px-3 py-1.5 text-xs font-bold uppercase hover:bg-ink hover:text-bg">Claim</button></form>
                        : <span className="text-xs text-muted">{r.places_left > 0 ? 'Keep going' : 'All claimed'}</span>}
                  </div>
                  {r.claimed && codes.get(r.id) && (
                    <div className="mt-3 border border-white p-3 text-sm">
                      {codes.get(r.id)!.code && <p>Your code: <span className="font-mono font-bold">{codes.get(r.id)!.code}</span></p>}
                      {codes.get(r.id)!.how && <p className="mt-1 text-muted">{codes.get(r.id)!.how}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : <p className="border border-dashed border-stone p-4 text-sm text-muted">Rewards for consistency are on the way. Every class you finish already counts towards them.</p>}
      </section>
    </main>
  );
}
