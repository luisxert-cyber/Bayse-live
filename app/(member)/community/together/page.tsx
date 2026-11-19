import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, eventTime } from '@/lib/community/data';
import { CLUB } from '@/lib/community/clubs';
import { CommunityShell, Gate } from '@/components/community/Shell';

export const metadata = { title: 'BAYSE Together' };
export const dynamic = 'force-dynamic';

const INTEREST: Record<string, string> = { padel: 'Padel', walk: 'Walks', social: 'Socials', pilates_friends: 'Pilates friends', accountability: 'Accountability' };
const KIND_FOR: Record<string, string> = { padel: 'padel', walk: 'walk', social: 'social' };
type Person = { id: string; display_name: string; shared: string[]; near?: boolean };
type Circle = { id: string; name: string; description: string | null; max_members: number; member_count: number; is_member: boolean; official: boolean };

export default async function Together() {
  const user = await requireUser('/community/together');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const supabase = await createClient();
  const [{ data: prefs }, { data: people }, { data: circles }] = await Promise.all([
    supabase.from('discovery_prefs').select('discoverable, interests, town').eq('user_id', user.id).maybeSingle(),
    supabase.rpc('suggest_members'),
    supabase.rpc('list_circles'),
  ]);
  const interests = (prefs?.interests ?? []) as string[];
  const kinds = interests.map((i) => KIND_FOR[i]).filter(Boolean);
  const { data: acts } = kinds.length
    ? await supabase.from('activities').select('id, kind, title, starts_at, venue_area').eq('status', 'open').gt('starts_at', new Date().toISOString()).in('kind', kinds).order('starts_at').limit(6)
    : { data: [] as { id: string; kind: string; title: string; starts_at: string; venue_area: string | null }[] };
  const openCircles = ((circles ?? []) as Circle[]).filter((c) => !c.is_member && c.member_count < c.max_members).slice(0, 4);
  const matches = (people ?? []) as Person[];
  const town = ((prefs?.town as string | null) ?? '').trim() || null;

  return (
    <CommunityShell active="/community/together" title="BAYSE Together" intro="Meet members who share your interests, then train, walk, play or grab a coffee together.">
      {!interests.length || !prefs?.discoverable ? (
        <div className="border-2 border-white p-4">
          <p className="font-bold">{interests.length ? 'Let others find you too' : 'Tell us what you’d enjoy'}</p>
          <p className="mt-1 text-sm text-muted">Add your town or city to find members near you, wherever you live. Pick your interests and switch on &ldquo;Let other members find me&rdquo;. Only your display name and shared interests are shown. You can switch it off at any time.</p>
          <Link href="/community/settings" className="mt-3 inline-block border border-ink px-4 py-2 text-sm font-bold uppercase">Set up in Privacy</Link>
        </div>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">{town ? `People near ${town} and people like you` : 'People like you'}</h2>
        {!town && interests.length > 0 && prefs?.discoverable && <p className="text-sm text-muted"><Link href="/community/settings" className="underline">Add your town or city</Link> to see members near you.</p>}
        {matches.length ? (
          <ul className="divide-y divide-stone border-y border-stone">
            {matches.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone font-bold">{p.display_name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0"><span className="block font-semibold">{p.display_name}</span><span className="block text-sm text-muted">{[p.near && town ? `Also in ${town}` : null, p.shared.length ? `${p.near && town ? 'into' : 'Also into'} ${p.shared.map((s) => INTEREST[s] ?? s).join(', ').toLowerCase()}` : null].filter(Boolean).join(' · ')}</span></span>
                {p.near && <span className="ml-auto shrink-0 rounded-full border border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Near you</span>}
              </li>
            ))}
          </ul>
        ) : <p className="border border-dashed border-stone p-4 text-sm text-muted">{interests.length ? 'Nobody with your interests has made themselves findable yet. As members join, they’ll appear here. Meanwhile, join a Circle or start a Club activity below.' : 'Choose your interests to see members who share them.'}</p>}
        <p className="text-xs text-muted">Say hello in a shared Circle or at a Club activity. Private messages are coming later.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Circles with space</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {openCircles.map((c) => (
            <li key={c.id}><Link href={`/community/circles/${c.id}`} className="block border border-stone p-3 hover:border-ink"><span className="block font-semibold">{c.name}</span><span className="mt-0.5 block line-clamp-2 text-sm text-muted">{c.description}</span></Link></li>
          ))}
        </ul>
        <Link href="/community/circles" className="text-sm underline">All Circles</Link>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Coming up for you</h2>
        {(acts ?? []).length ? (
          <ul className="divide-y divide-stone border-y border-stone">
            {(acts ?? []).map((a) => (
              <li key={a.id}><Link href={`/community/clubs/${a.id}`} className="block py-3"><span className="block text-xs uppercase tracking-[0.12em] text-muted">{CLUB[a.kind]?.label}</span><span className="block font-semibold">{a.title}</span><span className="block text-sm text-muted">{eventTime(a.starts_at)}{a.venue_area ? ` · ${a.venue_area}` : ''}</span></Link></li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">Nothing planned for your interests yet. <Link href="/community/clubs" className="underline">Start one in Clubs</Link>.</p>}
      </section>
    </CommunityShell>
  );
}
