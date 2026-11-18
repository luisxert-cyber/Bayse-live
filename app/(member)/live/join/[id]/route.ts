import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';

export const dynamic = 'force-dynamic';

// "Join" on a live class comes through here: it notes that the member has joined today's class
// (so the second instructor can see who is in, and the class counts towards the monthly challenge),
// then sends them on to Zoom. The Zoom link is only readable by members whose plan includes live classes.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const back = (q = '') => NextResponse.redirect(new URL(`/live${q}`, request.url));
  if (!isUuid(id)) return back();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/sign-in?next=/live', request.url));
  const { data: health } = await supabase.rpc('has_health_declaration');
  if (!health) return NextResponse.redirect(new URL('/you/health?next=/live', request.url));
  const { data: link } = await supabase.from('live_class_links').select('join_url').eq('class_id', id).maybeSingle();
  const url = link?.join_url as string | undefined;
  if (!url || !/^https:\/\//.test(url)) return back();
  // Best effort: a failed note must never stop someone getting into their class.
  const { error } = await supabase.from('live_checkins').upsert({ class_id: id, user_id: user.id }, { onConflict: 'class_id,class_date,user_id', ignoreDuplicates: true });
  if (error) console.error('[live] could not note the check-in:', error.message);
  return NextResponse.redirect(url);
}
