import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { COACH_REPLY_TARGET, when } from '@/lib/coaching';

export const metadata = { title: 'Black members' };

type Row = { user_id: string; name: string; instructor_id: string | null; instructor_name: string | null; last_at: string | null; waiting: boolean; waiting_since: string | null; reviews: number };

export default async function TeachCoaching() {
  const { me } = await requireInstructor();
  if (!me) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc('black_members');
  const rows = ((data ?? []) as Row[]).filter((r) => r.instructor_id === me.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My BAYSE Black members</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Members BAYSE has given you as their coach. Answer questions {COACH_REPLY_TARGET}, and reply to each progress review with feedback and their focus for the next 28 days. Their private session is booked through 1-to-1s.</p>
      </div>
      <ul className="divide-y divide-stone border border-stone">
        {rows.map((r) => (
          <li key={r.user_id}>
            <Link href={`/teach/coaching/${r.user_id}`} className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-surface">
              <span><b>{r.name}</b><br /><span className="text-xs text-muted">{r.reviews} progress review{r.reviews === 1 ? '' : 's'}{r.last_at ? ` · last message ${when(r.last_at)}` : ' · no messages yet'}</span></span>
              {r.waiting && <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-bold uppercase text-black">Waiting since {when(r.waiting_since!)}</span>}
            </Link>
          </li>
        ))}
        {!rows.length && <li className="p-6 text-center text-sm text-muted">No Black members assigned to you yet.</li>}
      </ul>
    </div>
  );
}
