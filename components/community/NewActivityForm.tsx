'use client';
// Start a Padel game, walk or social. Fields change with the kind; the database checks everything again.
import { useState } from 'react';
import { createActivity } from '@/app/(member)/community/actions';
import type { Template } from '@/lib/community/clubs';

const input = 'w-full rounded-[10px] border border-stone bg-bg px-3 py-2 text-base';
const L = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="grid gap-1 text-sm"><span className="font-semibold">{label}</span>{children}{hint && <span className="text-xs text-muted">{hint}</span>}</label>
);

/** Next date (YYYY-MM-DD) falling on an ISO weekday (1 = Monday), at least tomorrow. */
function nextDay(weekday?: number) {
  const d = new Date(Date.now() + 864e5);
  if (weekday) while (((d.getUTCDay() + 6) % 7) + 1 !== weekday) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function NewActivityForm({ t }: { t?: Template }) {
  const [kind, setKind] = useState<'padel' | 'walk' | 'social'>(t?.kind ?? 'walk');
  const today = nextDay();
  const day = nextDay(t?.weekday);
  return (
    <form action={createActivity} className="space-y-4 rounded-card border border-stone bg-surface p-4">
      <input type="hidden" name="back" value="/community/clubs/new" />
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-semibold">What is it?</legend>
        {([['padel', '🎾 Padel'], ['walk', '🚶‍♀️ Walk'], ['social', '☕ Social']] as const).map(([k, l]) => (
          <label key={k} className="cursor-pointer rounded-full border border-stone px-4 py-2 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:font-bold has-[:checked]:text-bg">
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />{l}
          </label>
        ))}
      </fieldset>
      <L label="Title"><input name="title" required minLength={3} maxLength={80} defaultValue={t?.title} placeholder={kind === 'padel' ? 'Saturday Padel' : kind === 'walk' ? 'Sunday Morning Walk' : 'Coffee after the 9am class'} className={input} /></L>
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="Date"><input type="date" name="date" required min={today} defaultValue={day} className={input} /></L>
        <L label="Start time (UK)"><input type="time" name="time" required defaultValue={t?.time ?? '10:00'} className={input} /></L>
      </div>
      <L label="Public meeting place" hint="A café, park entrance or padel club. Never a home address."><input name="venue_name" required minLength={2} maxLength={120} placeholder={kind === 'padel' ? 'Club name' : 'e.g. Dunham Massey car park'} className={input} /></L>
      <L label="Town or area"><input name="venue_area" maxLength={80} placeholder="e.g. Altrincham" className={input} /></L>
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="Spaces" hint={kind === 'padel' ? 'Doubles is 4.' : 'Leave blank for no limit.'}><input type="number" name="capacity" min={2} max={200} defaultValue={t?.capacity ?? (kind === 'padel' ? 4 : undefined)} className={input} /></L>
        <L label="Level"><select name="level" defaultValue={t?.level ?? 'all'} className={input}><option value="all">All levels</option><option value="beginner">Beginner friendly</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></L>
      </div>
      {kind === 'padel' && <L label="Format"><select name="padel_format" defaultValue={t?.padel_format ?? 'doubles'} className={input}><option value="doubles">Doubles</option><option value="singles">Singles</option><option value="americano">Americano</option><option value="other">Other</option></select></L>}
      {kind === 'walk' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Distance (km)"><input type="number" name="distance_km" min={0.5} max={50} step={0.5} defaultValue={t?.distance_km ?? 5} className={input} /></L>
          <L label="Pace"><select name="pace" defaultValue={t?.pace ?? 'easy'} className={input}><option value="easy">Easy</option><option value="steady">Steady</option><option value="brisk">Brisk</option></select></L>
        </div>
      )}
      <L label="Details (optional)"><textarea name="description" maxLength={1000} rows={3} defaultValue={t?.description} placeholder="What to bring, where exactly to meet, costs to share…" className={input} /></L>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="repeats_weekly" className="h-4 w-4 accent-ink" />Happens every week</label>
      <p className="text-xs text-muted">You&rsquo;ll get the first place and can cancel any time. Everyone who joins can see the group chat.</p>
      <button className="rounded-full bg-ink px-6 py-2.5 font-bold text-bg">Publish</button>
    </form>
  );
}
