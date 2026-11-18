import { requireInstructor } from '@/lib/auth/session';
import { myClasses } from '@/lib/teach/data';

export const metadata = { title: 'My classes' };

export default async function TeachClasses() {
  const { me } = await requireInstructor();
  if (!me) return null;
  const classes = await myClasses(me.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My live classes</h1>
        <p className="mt-1 text-sm text-muted">The weekly Zoom classes BAYSE has put you on. To swap a class, speak to the BAYSE team.</p>
      </div>
      <ul className="divide-y divide-stone border border-stone">
        {classes.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <div><p className="font-bold">Next: {c.nextDate} at {c.starts_at.slice(0, 5)}</p><p>{c.name} · {c.minutes} min</p></div>
            {c.joinUrl ? <a href={c.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center bg-white px-4 text-xs font-bold uppercase text-black">Open Zoom</a> : <span className="text-xs text-muted">Zoom link not set yet</span>}
          </li>
        ))}
        {!classes.length && <li className="p-6 text-center text-sm text-muted">You have not been put on any live classes yet.</li>}
      </ul>
    </div>
  );
}
