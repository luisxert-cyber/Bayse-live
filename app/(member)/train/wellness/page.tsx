import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { PATHWAYS } from '@/lib/wellness/pathways';
import { workoutMinutes } from '@/lib/workouts/catalog';

export const metadata = { title: 'Women’s wellness' };

export default async function Wellness() {
  await requireUser('/train/wellness');
  return (
    <main className="page space-y-5">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[30px] leading-none">Women&rsquo;s wellness</h1>
        <p className="mt-2 text-muted">Pilates for the stages of life that change how your body feels. Pick the pathway that fits you now.</p>
      </div>
      <div className="space-y-3">
        {PATHWAYS.map((p) => (
          <Link key={p.key} href={`/train/wellness/${p.key}`} className="block border border-stone p-5 hover:border-ink">
            <p className="eyebrow">{p.tag}</p>
            <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{p.name}</p>
            <p className="mt-2 text-sm text-muted">{p.intro}</p>
            <p className="mt-3 text-sm font-bold">{p.workouts.length} classes · {p.workouts.map((w) => workoutMinutes(w)).join(', ')} min ›</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted">These pathways are general exercise guidance, not medical advice. If you are unsure whether a class is right for you, ask your midwife, GP or physiotherapist first.</p>
    </main>
  );
}
