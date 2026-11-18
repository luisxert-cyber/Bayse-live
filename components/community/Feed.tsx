import { Card } from '@/components/ui';
import { when, type FeedPost, type Pin } from '@/lib/community/data';
import { createPost, deletePost, toggleClap, addComment, deleteComment } from '@/app/(member)/community/actions';
import { ReportBlock } from './ReportBlock';

const Badge = () => <span className="ml-1.5 rounded-full bg-ink px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-bg">BAYSE team</span>;

/** Pinned notes and prompts from the BAYSE team. */
export function Pins({ pins }: { pins: Pin[] }) {
  if (!pins.length) return null;
  return (
    <ul className="space-y-3">
      {pins.map((p, i) => (
        <li key={p.id} className={`rounded-card p-4 ${i === 0 ? 'bg-ink text-bg' : 'border border-stone bg-surface'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${i === 0 ? 'opacity-70' : 'text-muted'}`}>📌 {p.label}</p>
          <p className="mt-1 font-display text-lg font-extrabold uppercase leading-tight">{p.title}</p>
          <p className={`mt-1.5 text-sm ${i === 0 ? 'opacity-90' : 'text-muted'}`}>{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

const input = 'w-full rounded-[10px] border border-stone bg-bg px-3 py-2 text-base';

export function Composer({ groupId, back, placeholder }: { groupId: string; back: string; placeholder: string }) {
  return (
    <form action={createPost} className="rounded-card border border-stone bg-surface p-3">
      <input type="hidden" name="group_id" value={groupId} /><input type="hidden" name="back" value={back} />
      <label htmlFor={`post-${groupId}`} className="sr-only">Write a post</label>
      <textarea id={`post-${groupId}`} name="body" required maxLength={2000} rows={3} placeholder={placeholder} className={input} />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Be kind. No health details about other people.</p>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-bg">Post</button>
      </div>
    </form>
  );
}

export function Feed({ posts, back }: { posts: FeedPost[]; back: string }) {
  if (!posts.length) return <p className="rounded-card border border-dashed border-stone px-4 py-6 text-center text-muted">Be one of the first to post here. Say hello and give the next person someone to reply to.</p>;
  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.id}>
          <Card className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm"><span className="font-semibold">{p.author}</span>{p.staff && <Badge />} <span className="text-muted">· {when(p.created_at)}</span></p>
              {p.mine
                ? <form action={deletePost}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="back" value={back} /><button className="text-xs text-muted underline">Delete</button></form>
                : <ReportBlock targetType="post" targetId={p.id} userId={p.authorId} name={p.author} back={back} />}
            </div>
            {p.hidden && <p className="mt-1 text-xs text-clay">Hidden by a moderator. Only you can see this.</p>}
            <p className="mt-2 whitespace-pre-wrap break-words">{p.body}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <form action={toggleClap}>
                <input type="hidden" name="post_id" value={p.id} /><input type="hidden" name="on" value={p.clapped ? '1' : '0'} /><input type="hidden" name="back" value={back} />
                <button aria-pressed={p.clapped} className="rounded-full border border-stone px-3 py-1 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg">👏 {p.claps || ''}<span className="sr-only">{p.clapped ? 'Remove clap' : 'Clap'}</span></button>
              </form>
              <span className="text-muted">{p.comments.length} {p.comments.length === 1 ? 'reply' : 'replies'}</span>
            </div>
            <details className="mt-2" open={p.comments.length > 0 && p.comments.length <= 3}>
              <summary className="cursor-pointer text-sm font-semibold">Reply</summary>
              <ul className="mt-2 space-y-2">
                {p.comments.map((c) => (
                  <li key={c.id} className="rounded-xl bg-bg px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p><span className="font-semibold">{c.author}</span>{c.staff && <Badge />} <span className="text-muted">· {when(c.created_at)}</span></p>
                      {c.mine
                        ? <form action={deleteComment}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="back" value={back} /><button className="text-xs text-muted underline">Delete</button></form>
                        : <ReportBlock targetType="comment" targetId={c.id} userId={c.authorId} name={c.author} back={back} />}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
                  </li>
                ))}
              </ul>
              <form action={addComment} className="mt-2 flex gap-2">
                <input type="hidden" name="post_id" value={p.id} /><input type="hidden" name="back" value={back} />
                <label htmlFor={`c-${p.id}`} className="sr-only">Write a reply</label>
                <input id={`c-${p.id}`} name="body" required maxLength={1000} placeholder="Write a reply" className={input} />
                <button className="rounded-full bg-ink px-4 text-sm font-bold text-bg">Send</button>
              </form>
            </details>
          </Card>
        </li>
      ))}
    </ul>
  );
}
