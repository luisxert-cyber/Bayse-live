import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { findPathway } from '@/lib/wellness/pathways';
import { EXERCISES, workoutMinutes } from '@/lib/workouts/catalog';
import { MoveThumb } from '@/components/workout/MoveThumb';
import { Card, Notice } from '@/components/ui';

export const dynamic = 'force-dynamic';

const List = ({ items }: { items: string[] }) => <ul className="mt-2 space-y-1.5 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><span aria-hidden>·</span><span>{i}</span></li>)}</ul>;

export default async function PathwayPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const p = findPathway(key);
  if (!p) notFound();
  await requireUser(`/train/wellness/${key}`);
  return (
    <main className="page space-y-5">
      <Link href="/train/wellness" className="text-sm text-muted hover:text-ink">← Women&rsquo;s wellness</Link>
      <div>
        <p className="eyebrow">{p.tag}</p>
        <h1 className="mt-1 text-[30px] leading-none">{p.name}</h1>
        <p className="mt-2 text-muted">{p.intro}</p>
      </div>

      <Notice tone="warning" title="Before you start">{p.first}</Notice>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Your classes</h2>
        <div className="mt-2 space-y-3">
          {p.workouts.map((w) => {
            const ex = EXERCISES[w.blocks[Math.min(2, w.blocks.length - 1)].ex];
            return (
              <Link key={w.key} href={`/train/${w.key}`} className="flex items-center gap-4 rounded-card border border-stone bg-surface p-3 hover:border-ink">
                <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-bg"><MoveThumb move={ex.move} t={0.7} className="block w-full" /></div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-extrabold uppercase leading-tight">{w.name}</p>
                  <p className="text-sm text-muted">{workoutMinutes(w)} min · {w.blocks.length} moves</p>
                  <p className="mt-0.5 text-sm">{w.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">{p.week}</p>
      </section>

      <Card>
        <p className="eyebrow">How to use them</p>
        <dl className="mt-2 space-y-3 text-sm">
          {p.notes.map(([t, d]) => <div key={t}><dt className="font-bold">{t}</dt><dd className="text-muted">{d}</dd></div>)}
        </dl>
      </Card>

      <Card>
        <p className="eyebrow">What we focus on</p>
        <List items={p.focus} />
      </Card>
      <Card>
        <p className="eyebrow">What to leave out</p>
        <List items={p.avoid} />
      </Card>
      <Notice tone="error" title="Stop and get medical advice if you notice">
        <List items={p.stop} />
      </Notice>

      <p className="text-xs text-muted">General exercise guidance for healthy adults, not medical advice. In a live class, tell your instructor at the start and they will give you options.</p>
    </main>
  );
}
