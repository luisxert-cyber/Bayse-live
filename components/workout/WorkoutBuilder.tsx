'use client';
// Interactive workout builder: choose areas, time, level and joints to protect; see the workout
// update instantly with the illustrated moves, shuffle it, then start it in the timer player.
import { useMemo, useState } from 'react';
import { buildWorkout, AREA_LABELS, LEVEL_LABELS, TIME_OPTIONS, type BuildChoices, type Level } from '@/lib/workouts/builder';
import { EXERCISES, workoutMinutes, type Area } from '@/lib/workouts/catalog';
import { FigureStill } from './Figure';
import { WorkoutPlayer } from './WorkoutPlayer';
import { buttonClass } from '@/components/ui';

const Pill = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className="min-h-[40px] rounded-full border border-stone bg-surface px-4 text-sm hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-bg">
    {children}
  </button>
);

export function WorkoutBuilder({ initial, onComplete, exitHref }: { initial: BuildChoices; onComplete?: (minutes: number) => Promise<void> | void; exitHref: string }) {
  const [c, setC] = useState<BuildChoices>(initial);
  const [playing, setPlaying] = useState(false);
  const workout = useMemo(() => buildWorkout(c), [c]);
  const set = (patch: Partial<BuildChoices>) => setC((x) => ({ ...x, ...patch }));
  const toggleArea = (a: Area) => set({ areas: c.areas.includes(a) ? c.areas.filter((x) => x !== a) : [...c.areas, a] });
  const toggleAvoid = (j: 'knees' | 'wrists') => set({ avoid: c.avoid.includes(j) ? c.avoid.filter((x) => x !== j) : [...c.avoid, j] });

  if (playing) {
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setPlaying(false)} className="text-sm text-muted hover:text-ink">← Change my workout</button>
        <WorkoutPlayer workout={workout} exitHref={exitHref} onComplete={onComplete ? () => onComplete(workoutMinutes(workout)) : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">What do you want to work on?</h2>
        <p className="mt-1 text-sm text-muted">Pick one or more.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(AREA_LABELS) as Area[]).map((a) => <Pill key={a} on={c.areas.includes(a)} onClick={() => toggleArea(a)}>{AREA_LABELS[a]}</Pill>)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">How long have you got?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIME_OPTIONS.map((m) => <Pill key={m} on={c.minutes === m} onClick={() => set({ minutes: m })}>{m} min</Pill>)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">How should it feel?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {([1, 2, 3] as Level[]).map((l) => <Pill key={l} on={c.level === l} onClick={() => set({ level: l })}>{LEVEL_LABELS[l]}</Pill>)}
        </div>
        <p className="mt-2 text-xs text-muted">{c.level === 1 ? '30 seconds a move, longer rests.' : c.level === 2 ? '40 seconds a move.' : '45 seconds a move, shorter rests, harder moves.'}</p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Anything to go easy on?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill on={c.avoid.includes('knees')} onClick={() => toggleAvoid('knees')}>Knees</Pill>
          <Pill on={c.avoid.includes('wrists')} onClick={() => toggleAvoid('wrists')}>Wrists</Pill>
        </div>
      </section>

      <section className="rounded-3xl border border-stone bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Your workout</p>
            <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{workout.name}</p>
            <p className="text-sm text-muted">{workoutMinutes(workout)} min · {workout.blocks.length} moves · {LEVEL_LABELS[c.level]}</p>
          </div>
          <button type="button" onClick={() => set({ seed: (c.seed ?? 1) + 1 })} className={`${buttonClass('secondary')} !min-h-[40px] !px-4 text-sm`}>↻ Shuffle</button>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {workout.blocks.map((b, i) => {
            const e = EXERCISES[b.ex];
            return (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-bg p-2">
                <div className="w-20 shrink-0"><FigureStill move={e.move} t={0.7} className="block w-full" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{i + 1}. {e.name}</p>
                  <p className="text-xs text-muted">{b.seconds} sec{i === 0 ? ' · warm-up' : i === workout.blocks.length - 1 && e.role === 'cooldown' ? ' · cool-down' : ''}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={() => setPlaying(true)} className={`${buttonClass('primary', true)} mt-4`}>Start this workout</button>
      </section>
    </div>
  );
}
