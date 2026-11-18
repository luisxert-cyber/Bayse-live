import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, loadFeed, loadPins, communityPulse } from '@/lib/community/data';
import { CommunityHero } from '@/components/community/Hero';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { Composer, Feed, Pins } from '@/components/community/Feed';

export const metadata = { title: 'Community' };
export const dynamic = 'force-dynamic';

const LABEL: Record<string, string> = { 'bayse-global': 'Everyone' };

export default async function Community({ searchParams }: { searchParams: Promise<{ g?: string; e?: string; ok?: string }> }) {
  const user = await requireUser('/community');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  const supabase = await createClient();
  await supabase.rpc('join_default_groups');
  const { data: groups } = await supabase.from('groups').select('id, slug, name, kind, description')
    .in('kind', ['global', 'topic']).eq('archived', false).order('kind').order('name');
  const list = groups ?? [];
  const current = list.find((g) => g.slug === sp.g) ?? list.find((g) => g.kind === 'global') ?? list[0];
  const back = `/community${current ? `?g=${current.slug}` : ''}`;
  const [posts, pins, pulse] = await Promise.all([current ? loadFeed(current.id, user.id) : [], current ? loadPins(current.id) : [], communityPulse()]);
  return (
    <CommunityShell active="/community" title="Community" intro="Wins, questions, recipes and encouragement from BAYSE members." e={sp.e} ok={sp.ok}>
      <CommunityHero circles={pulse.circles} upcoming={pulse.upcoming} />
      <div className="flex flex-wrap gap-2">
        {list.map((g) => (
          <Link key={g.id} href={`/community?g=${g.slug}`} aria-current={g.id === current?.id ? 'true' : undefined}
            className="rounded-full border border-stone bg-surface px-3.5 py-1.5 text-sm aria-[current=true]:border-ink aria-[current=true]:font-bold">{LABEL[g.slug] ?? g.name}</Link>
        ))}
      </div>
      {current ? (
        <>
          {current.description && <p className="text-sm text-muted">{current.description}</p>}
          <Pins pins={pins} />
          <Composer groupId={current.id} back={back} placeholder={current.kind === 'global' ? 'Share a win, ask a question or say hello' : `Post in ${current.name}`} />
          <Feed posts={posts} back={back} />
        </>
      ) : <p className="text-muted">The community feed is being set up.</p>}
      <p className="text-xs text-muted">Adults only. Be kind, keep it public-place only when meeting up, and never share someone else&rsquo;s health details. <Link href="/community-guidelines" className="underline">Community guidelines</Link></p>
    </CommunityShell>
  );
}
