import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, loadFeed, namesFor } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { Composer, Feed } from '@/components/community/Feed';
import { joinCircle, leaveCircle } from '../../actions';

export const metadata = { title: 'Circle' };
export const dynamic = 'force-dynamic';

type Info = { id: string; kind: string; name: string; description: string | null; max_members: number; member_count: number; is_member: boolean; is_host: boolean };

export default async function CirclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string; ok?: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/community/circles/${id}`);
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.rpc('group_info', { g: id });
  const info = ((data ?? []) as Info[])[0];
  if (!info || info.kind !== 'circle') notFound();
  const back = `/community/circles/${id}`;
  let members: { name: string; host: boolean }[] = [];
  let posts: Awaited<ReturnType<typeof loadFeed>> = [];
  if (info.is_member) {
    const { data: rows } = await supabase.from('group_members').select('user_id, role').eq('group_id', id);
    const names = await namesFor((rows ?? []).map((r) => r.user_id as string));
    members = (rows ?? []).filter((r) => r.user_id === user.id || names.has(r.user_id)).map((r) => ({ name: r.user_id === user.id ? 'You' : names.get(r.user_id)!, host: r.role === 'host' }));
    posts = await loadFeed(id, user.id);
  }
  return (
    <CommunityShell active="/community/circles" title={info.name} intro={info.description ?? undefined} e={sp.e} ok={sp.ok}>
      <Link href="/community/circles" className="text-sm text-muted hover:text-ink">← All Circles</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-stone bg-surface p-4">
        <p className="text-sm">{info.member_count} of {info.max_members} members{info.is_host ? ' · you host this Circle' : ''}</p>
        {info.is_member
          ? !info.is_host && <form action={leaveCircle}><input type="hidden" name="group_id" value={id} /><input type="hidden" name="back" value={back} /><button className="rounded-full border border-stone px-4 py-2 text-sm">Leave Circle</button></form>
          : info.member_count < info.max_members && <form action={joinCircle}><input type="hidden" name="group_id" value={id} /><input type="hidden" name="back" value={back} /><button className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-bg">Join Circle</button></form>}
      </div>
      {info.is_member ? (
        <>
          <p className="text-sm text-muted">Members: {members.map((m) => `${m.name}${m.host ? ' (host)' : ''}`).join(', ')}</p>
          <Composer groupId={id} back={back} placeholder="Introduce yourself, share a win or plan a class together" />
          <Feed posts={posts} back={back} />
        </>
      ) : <p className="text-muted">Join to see who&rsquo;s in it and read the Circle&rsquo;s posts.</p>}
    </CommunityShell>
  );
}
