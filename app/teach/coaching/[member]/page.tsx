import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { KIND_LABEL, when, type CoachingMessage } from '@/lib/coaching';
import { input, btn, btnSolid } from '@/lib/teach/format';
import { coachReply } from '../actions';

export const metadata = { title: 'Coaching' };

export default async function CoachingThread({ params, searchParams }: { params: Promise<{ member: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { me } = await requireInstructor();
  if (!me) return null;
  const { member } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: mine } = await supabase.rpc('is_my_black_member', { p_member: member });
  if (!mine) notFound();
  const [{ data: list }, { data: msgs }] = await Promise.all([
    supabase.rpc('black_members'),
    supabase.from('coaching_messages').select('*').eq('member_id', member).order('created_at').limit(300),
  ]);
  const who = ((list ?? []) as { user_id: string; name: string }[]).find((r) => r.user_id === member)?.name ?? 'Member';
  const thread = (msgs ?? []) as CoachingMessage[];
  const lastReview = [...thread].reverse().find((m) => m.kind === 'review');
  const answered = lastReview && thread.some((m) => m.kind === 'feedback' && m.created_at > lastReview.created_at);
  return (
    <div className="space-y-5">
      <p className="text-sm"><Link href="/teach/coaching" className="text-muted hover:text-ink">← Black members</Link></p>
      <h1 className="text-xl font-semibold">{who}</h1>
      {sp.ok && <Notice tone="success">Sent.</Notice>}
      {sp.e && <Notice tone="error">{sp.e === 'empty' ? 'Write a message first.' : 'That could not be sent.'}</Notice>}
      <ul className="space-y-2">
        {thread.map((m) => (
          <li key={m.id} className={`border p-3 text-sm ${m.member_id === m.author_id ? 'mr-6 border-white' : 'ml-6 border-stone'}`}>
            <p className="text-xs text-muted">{m.member_id === m.author_id ? who : 'You'} · {KIND_LABEL[m.kind]}{m.rating ? ` · ${m.rating}/5` : ''} · {when(m.created_at)}</p>
            <p className="mt-1 whitespace-pre-line">{m.body}</p>
            {m.focus && <p className="mt-2 border-t border-stone pt-2"><b>Focus:</b> {m.focus}</p>}
          </li>
        ))}
        {!thread.length && <li className="border border-dashed border-stone p-4 text-sm text-muted">No messages yet.</li>}
      </ul>
      {lastReview && !answered && (
        <form action={coachReply} className="space-y-2 border border-white p-4">
          <input type="hidden" name="member_id" value={member} /><input type="hidden" name="kind" value="feedback" />
          <p className="font-bold">Reply to their progress review</p>
          <label className="grid gap-1 text-sm">Feedback<textarea name="body" rows={4} required maxLength={2000} className={input} /></label>
          <label className="grid gap-1 text-sm">Their focus for the next 28 days (shown at the top of their coaching page)<textarea name="focus" rows={3} maxLength={600} placeholder="E.g. 3 sessions a week: Strength & Sculpt, Morning Core and one walk. Work on pelvic stability in bridges." className={input} /></label>
          <button className={btnSolid}>Send feedback</button>
        </form>
      )}
      <form action={coachReply} className="space-y-2">
        <input type="hidden" name="member_id" value={member} /><input type="hidden" name="kind" value="reply" />
        <label className="grid gap-1 text-sm">Reply<textarea name="body" rows={3} required maxLength={2000} className={input} /></label>
        <button className={btn}>Send reply</button>
      </form>
    </div>
  );
}
