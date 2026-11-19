'use server';
// Every write goes through the signed-in member's own Supabase session, so row-level security
// and the database functions decide what is allowed. Errors come back as a short ?e= message.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const back = (f: FormData) => { const p = str(f, 'back'); return p.startsWith('/community') ? p : '/community'; };
function done(f: FormData, error?: { message: string } | null, okPath?: string): never {
  const to = okPath ?? back(f);
  revalidatePath('/community', 'layout');
  if (error) redirect(`${back(f).split('?')[0]}?e=${encodeURIComponent(friendly(error.message))}`);
  redirect(to);
}
function friendly(m: string) {
  if (/row-level security|not allowed|42501/i.test(m)) return 'Sorry, you can’t do that here.';
  if (/check constraint|violates/i.test(m)) return 'Please check what you entered and try again.';
  return m.length < 120 ? m : 'Something went wrong. Please try again.';
}
async function db() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/community');
  return { supabase, me: user.id };
}

export async function createPost(f: FormData) {
  const { supabase, me } = await db();
  const body = str(f, 'body');
  if (!body) done(f, { message: 'Write something first.' });
  const { error } = await supabase.from('posts').insert({ group_id: str(f, 'group_id'), author_id: me, body: body.slice(0, 2000) });
  done(f, error);
}
export async function deletePost(f: FormData) {
  const { supabase } = await db();
  const { error } = await supabase.from('posts').delete().eq('id', str(f, 'id'));
  done(f, error);
}
export async function toggleClap(f: FormData) {
  const { supabase, me } = await db();
  const post = str(f, 'post_id');
  if (f.get('on') === '1') {
    const { error } = await supabase.from('reactions').delete().eq('post_id', post).eq('user_id', me);
    done(f, error);
  }
  const { error } = await supabase.from('reactions').insert({ post_id: post, user_id: me, kind: 'clap' });
  done(f, error);
}
export async function addComment(f: FormData) {
  const { supabase, me } = await db();
  const body = str(f, 'body');
  if (!body) done(f, { message: 'Write a reply first.' });
  const { error } = await supabase.from('comments').insert({ post_id: str(f, 'post_id'), author_id: me, body: body.slice(0, 1000) });
  done(f, error);
}
export async function deleteComment(f: FormData) {
  const { supabase } = await db();
  const { error } = await supabase.from('comments').delete().eq('id', str(f, 'id'));
  done(f, error);
}

const REASONS = ['harassment', 'unsafe', 'spam', 'inappropriate', 'privacy', 'other'];
const TARGETS = ['post', 'comment', 'activity', 'activity_message', 'profile', 'room_message'];
export async function report(f: FormData) {
  const { supabase, me } = await db();
  const reason = str(f, 'reason'), type = str(f, 'target_type');
  if (!REASONS.includes(reason) || !TARGETS.includes(type)) done(f, { message: 'Choose a reason.' });
  const { error } = await supabase.from('reports').insert({ reporter_id: me, target_type: type, target_id: str(f, 'target_id'), reason, details: str(f, 'details').slice(0, 1000) || null });
  done(f, error, error ? undefined : `${back(f).split('?')[0]}?ok=reported`);
}
export async function block(f: FormData) {
  const { supabase, me } = await db();
  const other = str(f, 'user_id');
  if (other === me) done(f, { message: 'You can’t block yourself.' });
  const { error } = await supabase.from('blocks').upsert({ blocker_id: me, blocked_id: other }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true });
  done(f, error, error ? undefined : `${back(f).split('?')[0]}?ok=blocked`);
}
export async function unblock(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', me).eq('blocked_id', str(f, 'user_id'));
  done(f, error);
}

export async function createCircle(f: FormData) {
  const { supabase } = await db();
  const { data, error } = await supabase.rpc('create_circle', { p_name: str(f, 'name'), p_description: str(f, 'description') });
  done(f, error, error ? undefined : `/community/circles/${data}`);
}
export async function joinCircle(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('group_members').insert({ group_id: str(f, 'group_id'), user_id: me, role: 'member' });
  done(f, error ? { message: 'That Circle is full or not open to you.' } : null);
}
export async function leaveCircle(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('group_members').delete().eq('group_id', str(f, 'group_id')).eq('user_id', me);
  done(f, error, error ? undefined : '/community/circles');
}

const KINDS = ['padel', 'walk', 'social'];
export async function createActivity(f: FormData) {
  const { supabase, me } = await db();
  const kind = str(f, 'kind');
  if (!KINDS.includes(kind)) done(f, { message: 'Choose Padel, Walk or Social.' });
  const date = str(f, 'date'), time = str(f, 'time');
  // The form is in UK time; work out the UTC instant for that London wall-clock time.
  const guess = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(guess.getTime())) done(f, { message: 'Choose a date and time.' });
  const london = new Date(guess.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const offset = london.getTime() - new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const starts = new Date(guess.getTime() - offset);
  const cap = Number(str(f, 'capacity')) || null;
  const row: Record<string, unknown> = {
    kind, host_id: me, title: str(f, 'title'), description: str(f, 'description') || null,
    venue_name: str(f, 'venue_name'), venue_area: str(f, 'venue_area') || null,
    starts_at: starts.toISOString(), capacity: cap, level: str(f, 'level') || null,
    repeats_weekly: f.get('repeats_weekly') === 'on',
  };
  if (kind === 'padel') row.padel_format = str(f, 'padel_format') || 'doubles';
  if (kind === 'walk') { row.distance_km = Number(str(f, 'distance_km')) || null; row.pace = str(f, 'pace') || null; }
  const { data, error } = await supabase.from('activities').insert(row).select('id').single();
  done(f, error, error ? undefined : `/community/clubs/${data?.id}`);
}
export async function joinActivity(f: FormData) {
  const { supabase } = await db();
  const { error } = await supabase.rpc('join_activity', { a: str(f, 'activity_id') });
  done(f, error);
}
export async function leaveActivity(f: FormData) {
  const { supabase } = await db();
  const { error } = await supabase.rpc('leave_activity', { a: str(f, 'activity_id') });
  done(f, error);
}
export async function cancelActivity(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('activities').update({ status: 'cancelled' }).eq('id', str(f, 'activity_id')).eq('host_id', me);
  done(f, error);
}
export async function sendMessage(f: FormData) {
  const { supabase, me } = await db();
  const body = str(f, 'body');
  if (!body) done(f, { message: 'Write a message first.' });
  const { error } = await supabase.from('activity_messages').insert({ activity_id: str(f, 'activity_id'), author_id: me, body: body.slice(0, 1000) });
  done(f, error);
}

const INTERESTS = ['padel', 'walk', 'social', 'pilates_friends', 'accountability'];
export async function savePrefs(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('discovery_prefs').upsert({
    user_id: me,
    discoverable: f.get('discoverable') === 'on',
    allow_messages: false,
    interests: f.getAll('interests').map(String).filter((i) => INTERESTS.includes(i)),
    notify_new_activities: f.get('notify') === 'on',
    show_in_rankings: f.get('rankings') === 'on',
    town: str(f, 'town').replace(/\s+/g, ' ').slice(0, 60).length >= 2 ? str(f, 'town').replace(/\s+/g, ' ').slice(0, 60) : null,
  });
  done(f, error, error ? undefined : '/community/settings?ok=saved');
}


// General Chat. Row-level security only lets members of the room read and write, and only people who can take part in the community join.
export async function sendChat(f: FormData) {
  const { supabase, me } = await db();
  const body = str(f, 'body');
  if (!body) done(f, { message: 'Write a message first.' });
  const { error } = await supabase.from('room_messages').insert({ group_id: str(f, 'group_id'), author_id: me, body: body.slice(0, 1000) });
  done(f, error);
}
export async function deleteChat(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('room_messages').delete().eq('id', str(f, 'id')).eq('author_id', me);
  done(f, error);
}
