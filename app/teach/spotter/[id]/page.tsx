import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/billing/stripe-map';
import { Notice } from '@/components/ui';
import { AutoRefresh } from '@/components/teach/AutoRefresh';
import { sendCheer } from '../actions';

export const metadata = { title: 'Spotter' };
export const dynamic = 'force-dynamic';

type Row = { user_id: string; member_name: string; joined_at: string; live_count: number; first_live: boolean; cheered: boolean };
const EMOJI = ['👏', '💪', '🔥', '⭐', '❤️'];
const time = (iso: string) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export default async function SpotterClass({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  await requireInstructor();
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const [{ data: cls }, { data: teaches }, { data: link }, { data: roster }] = await Promise.all([
    supabase.from('live_classes').select('id, name, starts_at, minutes').eq('id', id).maybeSingle(),
    supabase.rpc('teaches_class', { p_class: id }),
    supabase.from('live_class_links').select('join_url').eq('class_id', id).maybeSingle(),
    supabase.rpc('class_roster', { p_class: id }),
  ]);
  if (!cls) notFound();
  const rows = (roster ?? []) as Row[];
  const fresh = rows.filter((r) => r.first_live).length;
  return (
    <div className="space-y-5">
      <AutoRefresh seconds={15} />
      <Link href="/teach/spotter" className="text-sm text-muted hover:text-ink">← Spotter</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{cls.name} · {String(cls.starts_at).slice(0, 5)}</h1>
          <p className="mt-1 text-sm text-muted">{rows.length} joined today{fresh ? ` · ${fresh} at their first live class` : ''} · updates by itself every 15 seconds</p>
        </div>
        {link?.join_url && <a href={link.join_url as string} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center bg-white px-4 text-xs font-bold uppercase text-black">Open Zoom</a>}
      </div>

      {teaches !== true && <Notice tone="warning">You are not on this class, so you cannot see who has joined. Ask the BAYSE team to add you.</Notice>}
      {sp.sent && <Notice tone="success">Cheer sent. They will see it on their Today screen.</Notice>}
      {sp.error && <Notice tone="error">That cheer could not be sent. Please try again.</Notice>}

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.user_id} className="border border-stone p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">{r.member_name}{r.first_live && <span className="ml-2 bg-white px-2 py-0.5 text-[11px] font-bold uppercase text-black">First live class</span>}</p>
              <p className="text-xs text-muted">Joined {time(r.joined_at)} · {r.live_count} live {r.live_count === 1 ? 'class' : 'classes'}{r.cheered ? ' · cheered today' : ''}</p>
            </div>
            <form action={sendCheer} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="class" value={id} /><input type="hidden" name="user" value={r.user_id} />
              <input name="note" maxLength={140} placeholder="Add a few words (optional)" aria-label={`Note for ${r.member_name}`} className="min-h-[40px] min-w-0 flex-1 basis-48 border border-stone bg-bg px-3 text-sm" />
              <span className="flex gap-1">
                {EMOJI.map((e) => <button key={e} name="emoji" value={e} aria-label={`Send ${e} to ${r.member_name}`} className="grid h-10 w-10 place-items-center border border-stone text-lg hover:border-ink">{e}</button>)}
              </span>
            </form>
          </li>
        ))}
        {teaches === true && !rows.length && <li className="border border-dashed border-stone p-6 text-center text-sm text-muted">Nobody has joined yet. Members appear here as soon as they tap Join in the app.</li>}
      </ul>
      <p className="max-w-[65ch] text-xs text-muted">Names appear when a member taps Join in the BAYSE app. Someone who opens Zoom another way will not show here. Greet new members by name, watch their form on Zoom, and send a cheer at the end.</p>
    </div>
  );
}
