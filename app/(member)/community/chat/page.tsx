import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, loadChat, when } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { Badge, Level } from '@/components/community/Feed';
import { ReportBlock } from '@/components/community/ReportBlock';
import { ChatRefresh } from '@/components/community/ChatRefresh';
import { sendChat, deleteChat } from '../actions';

export const metadata = { title: 'General Chat' };
export const dynamic = 'force-dynamic';

// General Chat: one open room for every member. Newest messages at the bottom, like a messaging app.
export default async function Chat({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const user = await requireUser('/community/chat');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: room } = await supabase.from('groups').select('id, name, description').eq('kind', 'room').eq('slug', 'general').eq('archived', false).maybeSingle();
  if (!room) {
    return <CommunityShell active="/community/chat" title="General Chat" e={sp.e}><p className="text-muted">The chat room is being set up. Please check back soon.</p></CommunityShell>;
  }
  // Everyone who can take part in the community is a member of General Chat: join quietly on the first visit.
  await supabase.from('group_members').upsert({ group_id: room.id, user_id: user.id, role: 'member' }, { onConflict: 'group_id,user_id', ignoreDuplicates: true });
  const messages = await loadChat(room.id, user.id);
  const back = '/community/chat';
  return (
    <CommunityShell active="/community/chat" title="General Chat" intro={room.description ?? undefined} e={sp.e} ok={sp.ok}>
      <ChatRefresh />
      <div className="border border-stone bg-surface">
        {messages.length ? (
          <ul className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <li key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] border px-3 py-2 md:max-w-[70%] ${m.mine ? 'border-ink bg-ink text-bg' : 'border-stone bg-bg'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs"><span className="font-bold">{m.author}</span>{!m.mine && (m.staff ? <Badge /> : <Level name={m.level} />)} <span className={m.mine ? 'opacity-70' : 'text-muted'}>· {when(m.created_at)}</span></p>
                    {m.mine
                      ? <form action={deleteChat}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="back" value={back} /><button className="text-xs underline opacity-70">Delete</button></form>
                      : <ReportBlock targetType="room_message" targetId={m.id} userId={m.authorId} name={m.author} back={back} />}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="px-4 py-10 text-center text-muted">Nobody has said anything yet. Say hello and get it started.</p>}
        <form action={sendChat} className="flex gap-2 border-t border-stone p-3">
          <input type="hidden" name="group_id" value={room.id} /><input type="hidden" name="back" value={back} />
          <label htmlFor="chat-body" className="sr-only">Write a message</label>
          <input id="chat-body" name="body" required maxLength={1000} autoComplete="off" placeholder="Write a message" className="min-h-[44px] w-full border border-stone bg-bg px-3 text-base" />
          <button className="shrink-0 bg-ink px-5 text-sm font-bold uppercase text-bg">Send</button>
        </form>
      </div>
      <p className="text-xs text-muted">Adults only. Be kind, and never share someone else&rsquo;s health details. New messages appear on their own every few seconds. <Link href="/community-guidelines" className="underline">Community guidelines</Link></p>
    </CommunityShell>
  );
}
