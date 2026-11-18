import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type Status = 'ok' | 'sign_in' | 'restricted' | 'membership' | 'profile';

export async function communityStatus(): Promise<Status> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('community_status');
  return ((data as string) ?? 'sign_in') as Status;
}

/** Display names for people the caller can already see in context (blocked people are left out). */
export async function namesFor(ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase.rpc('public_names', { p_ids: unique });
  return new Map(((data ?? []) as { id: string; display_name: string }[]).map((r) => [r.id, r.display_name]));
}

export type FeedPost = {
  id: string; author: string; authorId: string; mine: boolean; body: string; created_at: string; hidden: boolean;
  claps: number; clapped: boolean;
  comments: { id: string; author: string; authorId: string; mine: boolean; body: string; created_at: string }[];
};

export async function loadFeed(groupId: string, me: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data: posts } = await supabase.from('posts').select('id, author_id, body, created_at, hidden_at')
    .eq('group_id', groupId).order('created_at', { ascending: false }).limit(40);
  const ids = (posts ?? []).map((p) => p.id as string);
  if (!ids.length) return [];
  const [{ data: comments }, { data: reactions }] = await Promise.all([
    supabase.from('comments').select('id, post_id, author_id, body, created_at').in('post_id', ids).is('hidden_at', null).order('created_at').limit(400),
    supabase.from('reactions').select('post_id, user_id').in('post_id', ids),
  ]);
  const names = await namesFor([...(posts ?? []).map((p) => p.author_id as string), ...(comments ?? []).map((c) => c.author_id as string)]);
  const nm = (id: string) => (id === me ? 'You' : names.get(id) ?? 'BAYSE member');
  return (posts ?? []).map((p) => ({
    id: p.id, authorId: p.author_id, author: nm(p.author_id), mine: p.author_id === me, body: p.body, created_at: p.created_at, hidden: Boolean(p.hidden_at),
    claps: (reactions ?? []).filter((r) => r.post_id === p.id).length,
    clapped: (reactions ?? []).some((r) => r.post_id === p.id && r.user_id === me),
    comments: (comments ?? []).filter((c) => c.post_id === p.id).map((c) => ({ id: c.id, authorId: c.author_id, author: nm(c.author_id), mine: c.author_id === me, body: c.body, created_at: c.created_at })),
  }));
}

export const when = (iso: string) => {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' });
};

export const eventTime = (iso: string) => new Date(iso).toLocaleString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London',
});
