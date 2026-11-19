import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { loadDaily } from '@/lib/daily/data';
import { computeProgress } from '@/lib/daily/progress';
import { computeGame, POINTS, LEVELS } from '@/lib/daily/game';
import { Rings } from '@/components/member/Rings';
import { Notice } from '@/components/ui';
import { claimReward } from './actions';
import { hasEntitlement } from '@/lib/auth/access';
import { UpgradeGate } from '@/components/member/UpgradeGate';
import { Dial } from '@/components/member/Dial';
import { CheckinForm } from '@/components/member/CheckinForm';
import { recoveryScore, sleepScore, effortScore, zoneFor, ZONES, average, checkinStreak, type Checkin } from '@/lib/daily/readiness';
import { levelFor } from '@/lib/daily/game';
import { ukToday, shiftDay, dayLabel } from '@/lib/daily/day';

export const metadata = { title: 'Your progress' };
export const dynamic = 'force-dynamic';

const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

type Reward = { id: string; title: string; description: string; partner: string | null; min_classes: number; claimed: boolean; places_left: number; my_classes: number };

export default async function Progress({ searchParams }: { searchParams: Promise<{ e?: string; claimed?: string; checked?: string }> }) {
  const user = await requireUser('/you/progress');
  const sp = await searchParams;
  if (!(await hasEntitlement('progress'))) {
    return <UpgradeGate title="Progress">Daily recovery, sleep and effort scores, your weekly rings, levels, the weekly league and rewards.</UpgradeGate>;
  }
  const daily = await loadDaily(user.id);
  const p = computeProgress(daily.completions);
  const supabase = await createClient();
  const today = ukToday();
  const [{ data }, { data: joined }, { data: checks }, { data: leagueRows }] = await Promise.all([
    supabase.rpc('my_rewards'), supabase.rpc('my_live_attendance'),
    supabase.from('daily_checkins').select('day, sleep_hours, sleep_quality, energy, soreness, stress, mood').eq('user_id', user.id).gte('day', shiftDay(today, -29)).order('day'),
    supabase.rpc('weekly_league'),
  ]);
  // The daily check-in stands in for a wearable: sleep and how the member feels become scores out of 100.
  const checkins = ((checks ?? []) as Checkin[]).map((c) => ({ ...c, sleep_hours: Number(c.sleep_hours) }));
  const todayCheck = checkins.find((c) => c.day === today) ?? null;
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(today, i - 6));
  const byDay = new Map(checkins.map((c) => [c.day, c]));
  const recovery = todayCheck ? recoveryScore(todayCheck) : null;
  const sleep = todayCheck ? sleepScore(todayCheck) : null;
  const weekAgo = Date.now() - 7 * 86_400_000;
  const league = (leagueRows ?? []) as { user_id: string; display_name: string; points: number; week_points: number; is_me: boolean }[];
  const live = ((joined ?? []) as { minutes: number; joined_at: string }[]).map((l) => ({ minutes: l.minutes, at: l.joined_at }));
  const g = computeGame(daily.completions, live, daily.weeklyGoal);
  const minutes7 = [...daily.completions, ...live].filter((a) => new Date(a.at).getTime() >= weekAgo).reduce((n, a) => n + a.minutes, 0);
  const effort = effortScore(minutes7, daily.weeklyGoal);
  const zone = recovery === null ? null : ZONES[zoneFor(recovery)];
  const avgRecovery = average(week.flatMap((d) => (byDay.has(d) ? [recoveryScore(byDay.get(d)!)] : [])));
  const avgSleepHours = (() => { const h = week.flatMap((d) => (byDay.has(d) ? [byDay.get(d)!.sleep_hours] : [])); return h.length ? Math.round((h.reduce((a, b) => a + b, 0) / h.length) * 10) / 10 : null; })();
  const myPlace = league.findIndex((r) => r.is_me && r.week_points > 0);
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
      <div>
        <h1 className="text-[30px] leading-none">Progress</h1>
        <p className="mt-2 text-muted">How recovered you are, how you slept and how much you have moved. Consistency, not the scales.</p>
      </div>
      {sp.e && <Notice tone="error">{sp.e}</Notice>}
      {sp.claimed && <Notice tone="success" title="Reward claimed">Well earned. Your code and how to use it are below.</Notice>}

      {sp.checked && <Notice tone="success" title="Check-in saved">Your scores for today are below.</Notice>}

      {/* Today's scores, from the daily check-in and what the member has done in the app. */}
      <section className="border border-white p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">Today</p><p className="text-xs text-muted">{checkinStreak(checkins.map((c) => c.day), today) ? `${checkinStreak(checkins.map((c) => c.day), today)}-day check-in streak` : dayLabel(today)}</p></div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Dial value={recovery} label="Recovery" caption={zone ? zone.label : 'Check in to see'} />
          <Dial value={sleep} label="Sleep" caption={todayCheck ? `${todayCheck.sleep_hours}h` : 'Check in to see'} />
          <Dial value={effort} label="Effort" caption={`${minutes7} min this week`} />
        </div>
        {zone ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone pt-4">
            <p className="min-w-0 flex-1 text-sm"><span className="font-bold">{zone.label}.</span> <span className="text-muted">{zone.advice}</span></p>
            <Link href={zone.href} className="border border-ink px-4 py-2 text-xs font-bold uppercase hover:bg-ink hover:text-bg">{zone.cta}</Link>
          </div>
        ) : <p className="mt-4 border-t border-stone pt-4 text-sm text-muted">No watch needed. Answer six quick questions each morning and BAYSE works out your recovery and sleep scores, then suggests how hard to go today.</p>}
        <details className="mt-4 border-t border-stone pt-4" open={!todayCheck}>
          <summary className="cursor-pointer font-bold">{todayCheck ? 'Change today’s check-in' : 'Do today’s check-in (20 seconds)'}</summary>
          <div className="mt-4"><CheckinForm today={todayCheck} /></div>
        </details>
      </section>

      <section className="border border-stone p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">Recovery, last 7 days</p><p className="text-xs text-muted">{avgRecovery === null ? 'No check-ins yet' : `Average ${avgRecovery}${avgSleepHours === null ? '' : ` · ${avgSleepHours}h sleep`}`}</p></div>
        <div className="mt-4 flex h-28 items-end gap-2" role="img" aria-label={`Recovery scores for the last 7 days: ${week.map((d) => (byDay.has(d) ? recoveryScore(byDay.get(d)!) : 'none')).join(', ')}`}>
          {week.map((d) => {
            const score = byDay.has(d) ? recoveryScore(byDay.get(d)!) : null;
            return (
              <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-muted">{score ?? ''}</span>
                <div className={`w-full ${score === null ? 'border border-dashed border-stone' : d === today ? 'bg-white' : 'bg-stone'}`} style={{ height: `${score === null ? 6 : Math.max(6, score)}%` }} />
                <span className="text-[10px] uppercase text-muted">{dayLabel(d).slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Private to you: nobody at BAYSE and no other member can see your check-ins. A guide to how you feel, not a medical measure.</p>
      </section>

      <section className="border border-stone p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">This week’s rings</p><p className="text-xs text-muted">{g.closed} of 3 closed</p></div>
        <div className="mt-3 flex items-center gap-5">
          <Rings rings={g.rings} />
          <ul className="min-w-0 flex-1 space-y-2 text-sm">
            {g.rings.map((r, i) => (
              <li key={r.key} className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ['#ffffff', '#b9b9b9', '#7d7d7d'][i] }} />
                <span className="min-w-0"><span className="font-bold">{r.label}</span> <span className="text-muted">{r.value} of {r.goal} {r.unit}{r.value >= r.goal ? ' ✓' : ''}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-muted">{g.closed === 3 ? 'All three rings closed. Brilliant week.' : 'Finish sessions to fill Move and Minutes. Join a live class to close Live.'}</p>
      </section>

      <section className="border border-stone p-4">
        <div className="flex items-end justify-between gap-3">
          <div><p className="eyebrow">Level {g.levelNumber}</p><p className="text-2xl font-bold leading-tight">{g.level}</p></div>
          <div className="text-right"><p className="text-[32px] font-bold leading-none">{g.points}</p><p className="text-xs text-muted">points · +{g.weekPoints} this week</p></div>
        </div>
        {g.nextLevel && <>
          <div className="mt-3 h-1.5 bg-stone"><div className="h-full bg-white" style={{ width: `${Math.max(2, Math.min(100, g.nextLevel.progress * 100))}%` }} /></div>
          <p className="mt-2 text-xs text-muted">{g.nextLevel.pointsToGo} points to {g.nextLevel.name}</p>
        </>}
        <p className="mt-3 text-lg" aria-label={`${g.stars} stars`}>{g.stars > 0 ? '★'.repeat(Math.min(g.stars, 12)) : '☆'}{g.stars > 12 ? ` +${g.stars - 12}` : ''} <span className="text-xs text-muted">{g.stars} {g.stars === 1 ? 'star' : 'stars'} · one for every week you hit your goal</span></p>
        <p className="mt-2 text-xs text-muted">{POINTS.session} points for every session, {POINTS.live} for every live class you join, and {POINTS.goalWeek} bonus when you hit your weekly goal.</p>
      </section>

      <section id="league" className="scroll-mt-6 border border-stone p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">This week’s league</p><p className="text-xs text-muted">Resets every Monday</p></div>
        <p className="mt-2 text-sm text-muted">{myPlace >= 0 ? `You are ${ordinal(myPlace + 1)} of ${league.filter((r) => r.week_points > 0).length} this week.` : 'Finish a session or join a live class this week to get on the board.'} Points for showing up, never for weight or looks.</p>
        {league.filter((r) => r.week_points > 0).length ? (
          <ol className="mt-3 divide-y divide-stone border-y border-stone">
            {league.filter((r) => r.week_points > 0).slice(0, 10).map((r, i) => (
              <li key={r.user_id} className={`flex items-center gap-3 py-2 ${r.is_me ? 'font-bold' : ''}`}>
                <span className="w-6 shrink-0 text-center text-sm text-muted">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{r.is_me ? 'You' : r.display_name}<span className="ml-2 rounded-full border border-stone px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-muted">{levelFor(r.points).name}</span></span>
                <span className="shrink-0 text-sm">{r.week_points} pts</span>
              </li>
            ))}
          </ol>
        ) : <p className="mt-3 border border-dashed border-stone p-4 text-sm text-muted">Nobody is on the board yet this week. Be the first.</p>}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-bold">All the levels</summary>
          <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {LEVELS.map((l, i) => <li key={l.name} className={`flex justify-between border px-3 py-1.5 ${i + 1 === g.levelNumber ? 'border-ink font-bold' : 'border-stone text-muted'}`}><span>Level {i + 1} · {l.name}</span><span>{l.at} pts</span></li>)}
          </ol>
        </details>
        <p className="mt-3 text-xs text-muted">Other members see your display name, level and points for the week. <Link href="/community/settings" className="underline">Hide me from the league</Link></p>
      </section>

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
