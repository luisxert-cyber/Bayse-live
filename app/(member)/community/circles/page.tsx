import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { createCircle, joinCircle } from '../actions';

export const metadata = { title: 'Circles' };
export const dynamic = 'force-dynamic';

type Circle = { id: string; name: string; description: string | null; max_members: number; member_count: number; is_member: boolean };

export default async function Circles({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireUser('/community/circles');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc('list_circles');
  const circles = (data ?? []) as Circle[];
  const mine = circles.filter((c) => c.is_member), open = circles.filter((c) => !c.is_member);
  const Row = ({ c }: { c: Circle }) => (
    <li className="flex items-center justify-between gap-3 rounded-card border border-stone bg-surface p-4">
      <div className="min-w-0">
        <p className="font-semibold">{c.name}</p>
        {c.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{c.description}</p>}
        <p className="mt-1 text-xs text-muted">{c.member_count} of {c.max_members} members</p>
      </div>
      {c.is_member
        ? <Link href={`/community/circles/${c.id}`} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-bold text-bg">Open</Link>
        : c.member_count >= c.max_members
          ? <span className="shrink-0 text-sm text-muted">Full</span>
          : <form action={joinCircle}><input type="hidden" name="group_id" value={c.id} /><input type="hidden" name="back" value={`/community/circles/${c.id}`} /><button className="shrink-0 rounded-full border border-ink px-4 py-2 text-sm font-bold">Join</button></form>}
    </li>
  );
  return (
    <CommunityShell active="/community/circles" title="Circles" intro="Small groups of up to 12 who train at similar times, share wins and keep each other going." e={sp.e}>
      {mine.length > 0 && <section className="space-y-2"><h2 className="text-sm font-bold uppercase tracking-[0.1em]">Your Circles</h2><ul className="space-y-2">{mine.map((c) => <Row key={c.id} c={c} />)}</ul></section>}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Find a Circle</h2>
        {open.length ? <ul className="space-y-2">{open.map((c) => <Row key={c.id} c={c} />)}</ul>
          : <p className="rounded-card border border-dashed border-stone px-4 py-6 text-center text-muted">No open Circles yet. Start the first one.</p>}
      </section>
      <details className="rounded-card border border-stone bg-surface p-4" open={!circles.length}>
        <summary className="cursor-pointer font-semibold">Start a Circle</summary>
        <form action={createCircle} className="mt-3 space-y-3">
          <input type="hidden" name="back" value="/community/circles" />
          <label className="grid gap-1 text-sm"><span className="font-semibold">Name</span>
            <input name="name" required minLength={2} maxLength={80} placeholder="Morning Movers, Beginners Together…" className="rounded-[10px] border border-stone bg-bg px-3 py-2 text-base" /></label>
          <label className="grid gap-1 text-sm"><span className="font-semibold">Who is it for?</span>
            <textarea name="description" maxLength={500} rows={3} placeholder="e.g. Early birds who do the 7am live class and want a bit of accountability." className="rounded-[10px] border border-stone bg-bg px-3 py-2 text-base" /></label>
          <p className="text-xs text-muted">You&rsquo;ll host it. Up to 12 members, and you can host up to two Circles.</p>
          <button className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-bg">Start Circle</button>
        </form>
      </details>
    </CommunityShell>
  );
}
