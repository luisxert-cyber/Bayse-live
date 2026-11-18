import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadOnboarding } from '@/lib/data/onboarding';
import { LATER_STEPS } from '@/lib/onboarding/steps';
import { Card, Notice } from '@/components/ui';

export const metadata = { title: 'Personalise BAYSE' };
export const dynamic = 'force-dynamic';

const BLURB: Record<string, string> = {
  training: 'The kinds of sessions you enjoy, so we suggest the right classes.',
  coaching: 'Live, on demand, a plan or messages: how you like to be coached.',
  community: 'Padel, walks, coffee or accountability: what you would enjoy with other members.',
  nutrition: 'Food goals for recipes and meal ideas. Never a strict diet.',
  dietary: 'How you like to eat, plus any allergies (kept private, with your permission).',
  wellness: 'Private to you. Sleep, stress, cycles, pregnancy, perimenopause and more.',
};

export default async function Personalise({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/you/personalise');
  const d = await loadOnboarding(user.id);
  const done: Record<string, boolean> = {
    training: Boolean(d.answers?.preferred_training?.length),
    coaching: Boolean(d.answers?.coaching_style?.length),
    community: Boolean(d.answers?.community_interests?.length),
    nutrition: Boolean(d.nutrition?.goals?.length),
    dietary: Boolean(d.nutrition?.dietary_pattern || d.nutrition?.foods_to_avoid?.length || d.dietary),
    wellness: d.wellness.length > 0,
  };
  return (
    <main className="page space-y-5">
      <Link href="/you" className="text-sm text-muted hover:text-ink">← You</Link>
      <div>
        <h1 className="text-xl font-semibold">Personalise BAYSE</h1>
        <p className="mt-1 text-muted">All optional. Answer what is useful, whenever suits you. You can change or delete any of it.</p>
      </div>
      {sp.saved && <Notice tone="success">Saved. Thank you.</Notice>}
      <Card className="p-0">
        <ul className="divide-y divide-stone">
          {LATER_STEPS.map((s) => (
            <li key={s.id}>
              <Link href={`/start/${s.id}`} className="flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 hover:bg-stone/30">
                <span>
                  <span className="block font-medium">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{BLURB[s.id]}</span>
                </span>
                <span className={`shrink-0 text-xs ${done[s.id] ? 'text-ink' : 'text-muted'}`}>{done[s.id] ? 'Done ✓' : 'Add ›'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
