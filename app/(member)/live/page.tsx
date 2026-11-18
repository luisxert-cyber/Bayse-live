import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { requireHealthCheck } from '@/lib/health/gate';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';

export const metadata = { title: 'Live' };
export const dynamic = 'force-dynamic';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** ISO weekday (1 = Monday) and HH:MM right now in the UK. */
function ukNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.find((p) => p.type === 'weekday')!.value) + 1;
  const hm = `${parts.find((p) => p.type === 'hour')!.value}:${parts.find((p) => p.type === 'minute')!.value}`;
  return { wd, hm };
}
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const pretty = (t: string) => { const h = Number(t.slice(0, 2)); const m = t.slice(3, 5); return `${h % 12 || 12}${m === '00' ? '' : `:${m}`}${h < 12 ? 'am' : 'pm'}`; };

export default async function Live() {
  await requireUser('/live');
  await requireHealthCheck('/live');
  const supabase = await createClient();
  const [{ data: classes }, { data: links }] = await Promise.all([
    supabase.from('live_classes').select('id, weekday, starts_at, name, minutes').eq('active', true).order('weekday').order('starts_at'),
    // RLS returns rows only to members whose plan includes live classes (or admins).
    supabase.from('live_class_links').select('class_id, join_url'),
  ]);
  const linkFor = new Map((links ?? []).map((l) => [l.class_id as string, l.join_url as string]));
  const canJoin = linkFor.size > 0;
  const { wd, hm } = ukNow();
  const now = toMin(hm);
  const ordered = [...DAYS.keys()].map((i) => ((wd - 1 + i) % 7) + 1); // today first
  const next = (classes ?? []).find((c) => c.weekday === wd && toMin(c.starts_at) + c.minutes > now);

  return (
    <main className="page space-y-5">
      <div>
        <h1 className="text-[30px] leading-none">Live</h1>
        <p className="mt-2 text-muted">17 classes a week, all 45 minutes, UK time. Two instructors in every class.</p>
      </div>

      {!canJoin && (
        <Notice title="Live classes come with BAYSE Inner Circle">
          You can see the timetable. To join, choose BAYSE Inner Circle or BAYSE Black, or use a BAYSE code. <Link href="/join" className="underline">See membership</Link>
        </Notice>
      )}

      {next && (
        <div className="ink-panel p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{toMin(next.starts_at) <= now ? 'On now' : 'Next today'}</p>
          <p className="mt-1 font-display text-2xl font-extrabold uppercase">{pretty(next.starts_at)} · {next.name}</p>
          <p className="text-sm text-muted">{next.minutes} min · camera on for pointers, or off</p>
          {linkFor.get(next.id) && <a href={`/live/join/${next.id}`} target="_blank" rel="noopener" className={`${buttonClass('primary')} mt-4`}>Join on Zoom</a>}
        </div>
      )}

      {ordered.map((d) => {
        const day = (classes ?? []).filter((c) => c.weekday === d);
        if (!day.length) return null;
        return (
          <section key={d}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.1em]">{d === wd ? 'Today' : DAYS[d - 1]}</h2>
            <div className="space-y-2">
              {day.map((c) => {
                const over = d === wd && toMin(c.starts_at) + c.minutes <= now;
                const url = linkFor.get(c.id);
                return (
                  <Card key={c.id} className={`flex items-center gap-4 !p-4 ${over ? 'opacity-50' : ''}`}>
                    <span className="w-14 shrink-0 font-display text-lg font-extrabold">{pretty(c.starts_at)}</span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold">{c.name}</span><span className="text-sm text-muted">{c.minutes} min · mat</span></span>
                    {over ? <span className="text-xs text-muted">Finished</span> : url
                      ? <a href={`/live/join/${c.id}`} target="_blank" rel="noopener" className={`${buttonClass('secondary')} !min-h-[38px] !px-4 text-sm`}>Join</a>
                      : <span className="text-xs text-muted">Club</span>}
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-muted">The join button opens Zoom. If you are pregnant, postnatal or injured, tell your instructor at the start and they will give you options.</p>
    </main>
  );
}
