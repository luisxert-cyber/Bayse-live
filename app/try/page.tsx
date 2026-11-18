import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { hasOnDemand } from '@/lib/auth/access';
import { buildWorkout, STYLES, AREA_LABELS, EQUIPMENT_LABELS } from '@/lib/workouts/builder';
import { EXERCISES, workoutMinutes } from '@/lib/workouts/catalog';
import { MoveThumb } from '@/components/workout/MoveThumb';
import { HeroInstructor } from '@/components/site/HeroInstructor';

export const metadata = { title: 'The BAYSE workout builder' };
export const dynamic = 'force-dynamic';

// Showcase of the workout builder. Members and free-trial members go straight to the real builder;
// everyone else sees how it works and an example, then starts the free trial.
const EXAMPLE = buildWorkout({ areas: ['core', 'glutes'], minutes: 15, level: 2, avoid: [], seed: 3, style: 'mat', equipment: [] });

const STEPS = [
  ['Pick a class style', Object.values(STYLES).map((s) => s.label).join(' · ')],
  ['Choose what to work on', Object.values(AREA_LABELS).join(' · ')],
  ['Set your time and level', '5 to 30 minutes · Gentle, Steady or Strong'],
  ['Tell us your kit and any niggles', `Just a mat, or ${Object.values(EQUIPMENT_LABELS).join(', ').toLowerCase()} · go easy on knees or wrists`],
  ['Follow along', 'Video demos, a countdown timer, rest breaks and voice cues. Shuffle for a fresh workout any time.'],
] as const;

const Pill = ({ on, children }: { on?: boolean; children: React.ReactNode }) => (
  <span className={`inline-flex min-h-[34px] items-center border px-3 text-sm ${on ? 'border-white bg-white font-bold text-black' : 'border-stone text-muted'}`}>{children}</span>
);

export default async function Try() {
  const user = await getUser().catch(() => null);
  if (user && (await hasOnDemand())) redirect('/train/build');
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow">Included with every membership and the free trial</p>
            <h1 className="mt-3 text-[36px] leading-[1.02] sm:text-[52px]">Build your own workout</h1>
            <p className="mt-4 max-w-[48ch] text-lg text-muted">Tell BAYSE what you want to work on and how long you have. It builds a class for you in seconds, then guides you through it move by move.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/start/welcome" className={buttonClass('primary')}>Start your 7-day free trial</Link>
              {!user && <Link href="/sign-in?next=/train/build" className={buttonClass('secondary')}>I have an account</Link>}
            </div>
            {user && <p className="mt-3 text-sm text-muted">Your account doesn&rsquo;t have a membership yet. Start your free trial or add a BAYSE code to unlock the builder.</p>}
          </div>
          <HeroInstructor />
        </div>

        <section className="mt-14">
          <p className="eyebrow">How it works</p>
          <ol className="mt-4 grid gap-px border border-stone bg-stone sm:grid-cols-5">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="bg-bg p-4">
                <p className="font-display text-[34px] font-bold leading-none text-muted">{i + 1}</p>
                <p className="mt-3 font-bold">{t}</p>
                <p className="mt-1 text-sm text-muted">{b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5" aria-label="Example choices">
            <p className="eyebrow">Example</p>
            <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Style</p><div className="flex flex-wrap gap-2">{Object.entries(STYLES).map(([k, s]) => <Pill key={k} on={k === 'mat'}>{s.label}</Pill>)}</div></div>
            <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Work on</p><div className="flex flex-wrap gap-2">{Object.entries(AREA_LABELS).map(([k, l]) => <Pill key={k} on={k === 'core' || k === 'glutes'}>{l}</Pill>)}</div></div>
            <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Time</p><div className="flex flex-wrap gap-2">{[5, 10, 15, 20, 30].map((m) => <Pill key={m} on={m === 15}>{m} min</Pill>)}</div></div>
            <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">Feel</p><div className="flex flex-wrap gap-2">{['Gentle', 'Steady', 'Strong'].map((l) => <Pill key={l} on={l === 'Steady'}>{l}</Pill>)}</div></div>
          </div>
          <div className="border border-stone p-4 sm:p-5">
            <p className="eyebrow">Your workout</p>
            <p className="mt-1 text-2xl font-bold uppercase">{EXAMPLE.name}</p>
            <p className="text-sm text-muted">{workoutMinutes(EXAMPLE)} min · {EXAMPLE.blocks.length} moves · Steady</p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {EXAMPLE.blocks.slice(0, 8).map((b, i) => {
                const e = EXERCISES[b.ex];
                return (
                  <li key={i} className="flex items-center gap-3 border border-stone p-2">
                    <div className="w-20 shrink-0 overflow-hidden"><MoveThumb move={e.move} className="block w-full" /></div>
                    <div className="min-w-0"><p className="text-sm font-semibold">{i + 1}. {e.name}</p><p className="text-xs text-muted">{b.seconds} sec</p></div>
                  </li>
                );
              })}
            </ol>
            {EXAMPLE.blocks.length > 8 && <p className="mt-2 text-sm text-muted">+ {EXAMPLE.blocks.length - 8} more moves</p>}
            <div className="mt-4 border border-dashed border-stone p-4 text-center">
              <p className="font-bold">Build and play your own with the free trial</p>
              <Link href="/start/welcome" className={`${buttonClass('solid')} mt-3`}>Start your 7-day free trial</Link>
            </div>
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-muted">Want a taste first? <Link href="/#play-wake-up-6" className="font-semibold text-ink underline">Play today&rsquo;s free class</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
