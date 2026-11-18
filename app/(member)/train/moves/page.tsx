import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { MoveLibrary } from '@/components/workout/MoveLibrary';

export const metadata = { title: 'Move library' };

export default async function Moves() {
  await requireUser('/train/moves');
  return (
    <main className="page space-y-4">
      <Link href="/train" className="text-sm text-muted hover:text-ink">← Train</Link>
      <div>
        <h1 className="text-[30px] leading-none">Move library</h1>
        <p className="mt-2 text-muted">Every move your BAYSE instructor teaches, with cues and an easier option. Tap one to see it.</p>
      </div>
      <MoveLibrary />
    </main>
  );
}
