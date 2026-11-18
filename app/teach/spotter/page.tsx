import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { myClasses } from '@/lib/teach/data';

export const metadata = { title: 'Spotter' };
export const dynamic = 'force-dynamic';

export default async function Spotter() {
  const { me } = await requireInstructor();
  if (!me) return null;
  const classes = await myClasses(me.id);
  const today = classes.filter((c) => c.daysAhead === 0);
  const later = classes.filter((c) => c.daysAhead > 0).slice(0, 4);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Spotter</h1>
        <p className="mt-1 max-w-[65ch] text-sm text-muted">For the second instructor on a live class. Open today&rsquo;s class to see who has joined, who is new, and send each member a cheer they will see in their app.</p>
      </div>
      <ul className="divide-y divide-stone border border-stone">
        {today.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><p className="font-bold">Today at {c.starts_at.slice(0, 5)} · {c.name}</p><p className="text-muted">{c.minutes} min · {c.lead ? 'You are leading' : 'You are spotting'}</p></div>
            <Link href={`/teach/spotter/${c.id}`} className="inline-flex min-h-[40px] items-center bg-white px-4 text-xs font-bold uppercase text-black">Open class</Link>
          </li>
        ))}
        {!today.length && <li className="p-6 text-center text-sm text-muted">You are not on a live class today.</li>}
      </ul>
      {later.length > 0 && (
        <div>
          <p className="eyebrow">Coming up</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">{later.map((c) => <li key={c.id}>{c.nextDate} at {c.starts_at.slice(0, 5)} · {c.name} · {c.lead ? 'leading' : 'spotting'}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
