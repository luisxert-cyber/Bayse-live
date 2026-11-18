import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { WORKOUTS, EXERCISES, AVAILABLE, workoutMinutes, type Style, type Workout } from '@/lib/workouts/catalog';
import { READY, READY_STYLE, STYLES } from '@/lib/workouts/builder';
import { MoveThumb } from '@/components/workout/MoveThumb';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_STYLES, coverUrl } from '@/lib/video';

export const metadata = { title: 'Train' };

function Row({ w }: { w: Workout }) {
  const ex = EXERCISES[w.blocks[Math.min(2, w.blocks.length - 1)].ex];
  return (
    <Link href={`/train/${w.key}`} className="flex items-center gap-4 rounded-card border border-stone bg-surface p-3 hover:border-ink">
      <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-bg"><MoveThumb move={ex.move} t={0.7} className="block w-full" /></div>
      <div className="min-w-0">
        <p className="font-display text-lg font-extrabold uppercase leading-tight">{w.name}</p>
        <p className="text-sm text-muted">{workoutMinutes(w)} min · {w.level}</p>
        <p className="mt-0.5 line-clamp-2 text-sm">{w.summary}</p>
      </div>
    </Link>
  );
}

export default async function Train() {
  await requireUser('/train');
  const supabase = await createClient();
  const { data: videos } = await supabase.from('video_classes').select('slug, title, minutes, level, style, cover_path, free, instructors(display_name)').eq('status', 'published').neq('style', 'reformer').order('sort').order('published_at', { ascending: false });
  const count = Object.keys(AVAILABLE).length;
  return (
    <main className="page space-y-6">
      <div>
        <h1 className="text-[30px] leading-none">Train</h1>
        <p className="mt-2 text-muted">Guided timer classes with your BAYSE instructor. Press start, follow along, and each one counts towards your week.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/train/build" className="flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-bg">
          <span><span className="block font-display text-xl font-extrabold uppercase">Build my workout</span><span className="text-sm opacity-80">Your style, areas, time and kit.</span></span>
          <span aria-hidden className="text-2xl">›</span>
        </Link>
        <Link href="/train/reformer" className="flex items-center justify-between gap-4 rounded-card border border-ink p-5 sm:col-span-2">
          <span><span className="block font-display text-xl font-extrabold uppercase">Have a bed at home?</span><span className="text-sm text-muted">Reformer classes from the studio, with spring settings.</span></span>
          <span aria-hidden className="text-2xl">›</span>
        </Link>
        <Link href="/train/wellness" className="flex items-center justify-between gap-4 rounded-card border border-ink p-5">
          <span><span className="block font-display text-xl font-extrabold uppercase">Women&rsquo;s wellness</span><span className="text-sm text-muted">Pregnancy, after your baby, menopause.</span></span>
          <span aria-hidden className="text-2xl">›</span>
        </Link>
        <Link href="/train/moves" className="flex items-center justify-between gap-4 rounded-card border border-ink p-5">
          <span><span className="block font-display text-xl font-extrabold uppercase">Move library</span><span className="text-sm text-muted">{count} moves with cues.</span></span>
          <span aria-hidden className="text-2xl">›</span>
        </Link>
      </div>
      {(videos ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Filmed classes</h2>
          <p className="mb-2 text-sm text-muted">Full classes with BAYSE instructors.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(videos ?? []).map((v) => (
              <Link key={v.slug} href={`/train/video/${v.slug}`} className="group block border border-stone hover:border-ink" data-video-class>
                <div className="aspect-video bg-surface">{v.cover_path && <img src={coverUrl(v.cover_path)!} alt="" className="h-full w-full object-cover" />}</div>
                <div className="p-3">
                  <p className="font-display text-lg font-extrabold uppercase leading-tight">{v.title}</p>
                  <p className="text-sm text-muted">{v.minutes} min · {v.level} · {VIDEO_STYLES[v.style]}{(v.instructors as unknown as { display_name: string } | null)?.display_name ? ` · ${(v.instructors as unknown as { display_name: string }).display_name}` : ''}{v.free ? ' · free' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(Object.keys(STYLES) as Style[]).map((st) => (
        <section key={st}>
          <h2 className="text-sm font-bold uppercase tracking-[0.1em]">{STYLES[st].label}</h2>
          <p className="mb-2 text-sm text-muted">{STYLES[st].blurb}</p>
          <div className="grid gap-2">{READY.filter((w) => READY_STYLE[w.key] === st).map((w) => <Row key={w.key} w={w} />)}</div>
        </section>
      ))}
      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.1em]">Quick sessions</h2>
        <div className="grid gap-2">{WORKOUTS.map((w) => <Row key={w.key} w={w} />)}</div>
      </section>
    </main>
  );
}
