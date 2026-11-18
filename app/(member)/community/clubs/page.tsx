import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, eventTime } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { buttonClass } from '@/components/ui';
import { CLUB, LEVEL } from '@/lib/community/clubs';

export const metadata = { title: 'Clubs' };
export const dynamic = 'force-dynamic';


export default async function Clubs({ searchParams }: { searchParams: Promise<{ kind?: string; e?: string }> }) {
  const user = await requireUser('/community/clubs');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  const kind = sp.kind && CLUB[sp.kind] ? sp.kind : null;
  const supabase = await createClient();
  let q = supabase.from('activities').select('id, kind, title, venue_name, venue_area, starts_at, capacity, level, distance_km, pace, padel_format, host_id')
    .eq('status', 'open').gt('starts_at', new Date().toISOString()).order('starts_at').limit(60);
  if (kind) q = q.eq('kind', kind);
  const { data: acts } = await q;
  const ids = (acts ?? []).map((a) => a.id as string);
  const [{ data: counts }, { data: mine }] = await Promise.all([
    ids.length ? supabase.rpc('activity_counts', { p_ids: ids }) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('activity_rsvps').select('activity_id, status').eq('user_id', user.id).in('activity_id', ids) : Promise.resolve({ data: [] }),
  ]);
  const count = new Map(((counts ?? []) as { activity_id: string; going: number; waiting: number }[]).map((c) => [c.activity_id, c]));
  const myStatus = new Map(((mine ?? []) as { activity_id: string; status: string }[]).map((r) => [r.activity_id, r.status]));
  return (
    <CommunityShell active="/community/clubs" title="Clubs" intro="Padel games, walks and socials, arranged by members for members. Always meet in public places." e={sp.e}>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/community/clubs" aria-current={!kind ? 'true' : undefined} className="rounded-full border border-stone bg-surface px-3.5 py-1.5 text-sm aria-[current=true]:border-ink aria-[current=true]:font-bold">All</Link>
        {Object.entries(CLUB).map(([k, c]) => (
          <Link key={k} href={`/community/clubs?kind=${k}`} aria-current={kind === k ? 'true' : undefined} className="rounded-full border border-stone bg-surface px-3.5 py-1.5 text-sm aria-[current=true]:border-ink aria-[current=true]:font-bold">{c.icon} {c.label}</Link>
        ))}
        <Link href="/community/clubs/new" className={`${buttonClass('primary')} !min-h-[36px] !px-4 ml-auto text-sm`}>+ Start one</Link>
      </div>
      {(acts ?? []).length ? (
        <ul className="space-y-3">
          {(acts ?? []).map((a) => {
            const c = count.get(a.id), me = myStatus.get(a.id);
            const details = [a.kind === 'walk' && a.distance_km ? `${a.distance_km} km` : null, a.kind === 'walk' && a.pace ? `${a.pace} pace` : null, a.level ? LEVEL[a.level] : null, a.kind === 'padel' && a.padel_format ? a.padel_format : null].filter(Boolean);
            return (
              <li key={a.id}>
                <Link href={`/community/clubs/${a.id}`} className="block rounded-card border border-stone bg-surface p-4 hover:border-ink">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{CLUB[a.kind].icon} {CLUB[a.kind].label}</p>
                  <p className="mt-1 text-lg font-semibold">{a.title}</p>
                  <p className="text-sm">{eventTime(a.starts_at)} · {a.venue_name}{a.venue_area ? `, ${a.venue_area}` : ''}</p>
                  {details.length > 0 && <p className="text-sm text-muted">{details.join(' · ')}</p>}
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">{c?.going ?? 1}{a.capacity ? `/${a.capacity}` : ''} going</span>
                    {c?.waiting ? <span className="text-muted"> · {c.waiting} waiting</span> : null}
                    {a.host_id === user.id ? <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-bg">You&rsquo;re hosting</span>
                      : me === 'going' ? <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-bg">Going</span>
                      : me === 'waitlist' ? <span className="ml-2 rounded-full border border-ink px-2 py-0.5 text-xs font-bold">On the waiting list</span> : null}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-card border border-dashed border-stone px-4 py-8 text-center text-muted">
          Nothing planned yet{kind ? ` in ${CLUB[kind].label}` : ''}. <Link href="/community/clubs/new" className="font-semibold text-ink underline">Start the first one</Link>.
        </div>
      )}
    </CommunityShell>
  );
}
