import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { requireHealthCheck } from '@/lib/health/gate';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';
import { bookClass, cancelBooking, joinClass, toggleInterest } from './actions';
import { DAYS, equipmentText, clock, type TimetableClass } from '@/lib/site/timetable';

export const metadata = { title: 'Live' };
export const dynamic = 'force-dynamic';

type Slot = { class_id: string; class_date: string; starts_at: string; name: string; minutes: number; starts_ts: string; booked: number; mine: boolean; state: 'upcoming' | 'open' | 'finished' | 'cancelled' };

const pretty = (t: string) => { const h = Number(t.slice(0, 2)); const m = t.slice(3, 5); return `${h % 12 || 12}${m === '00' ? '' : `:${m}`}${h < 12 ? 'am' : 'pm'}`; };
const dayLabel = (iso: string, i: number) => (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }));
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const going = (n: number, mine: boolean) => (n === 0 ? 'Be the first to book' : mine ? (n === 1 ? 'You are booked' : `You + ${n - 1} booked`) : `${n} booked`);

function Hidden({ s }: { s: Slot }) {
  return <><input type="hidden" name="class_id" value={s.class_id} /><input type="hidden" name="class_date" value={s.class_date} /></>;
}

/** The one button a class needs right now: book, join (from 15 minutes before) or nothing once it has finished. */
function Action({ s, canJoin, big = false }: { s: Slot; canJoin: boolean; big?: boolean }) {
  const size = big ? '' : '!min-h-[38px] !px-4 text-sm';
  if (s.state === 'cancelled') return <span className="text-xs font-bold uppercase text-clay">Cancelled</span>;
  if (s.state === 'finished') return <span className="text-xs text-muted">Finished</span>;
  if (!canJoin) return <span className="text-xs text-muted">Inner Circle</span>;
  if (s.state === 'open') return <form action={joinClass}><Hidden s={s} /><button className={`${buttonClass('solid')} ${size}`}>Join now</button></form>;
  if (s.mine) return <span className={`inline-flex items-center border border-ink px-3 text-xs font-bold uppercase ${big ? 'min-h-[44px]' : 'min-h-[38px]'}`}>✓ Booked</span>;
  return <form action={bookClass}><Hidden s={s} /><button className={`${buttonClass('secondary')} ${size}`}>Book</button></form>;
}

export default async function Live({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  await requireUser('/live');
  await requireHealthCheck('/live');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: entitled }, { data: roles }, { data: timetable }, { data: interest }] = await Promise.all([
    supabase.rpc('live_schedule', { p_days: 7 }),
    supabase.rpc('has_entitlement', { k: 'live_classes' }),
    supabase.from('user_roles').select('role'),
    supabase.rpc('public_timetable'),
    supabase.from('live_class_interest').select('class_id'),
  ]);
  const all = (timetable ?? []) as TimetableClass[];
  const info = new Map(all.map((c) => [c.id, c]));
  const soon = all.filter((c) => c.status === 'coming_soon');
  const wanted = new Set((interest ?? []).map((i) => i.class_id as string));
  const slots = (data ?? []) as Slot[];
  const canJoin = entitled === true || (roles ?? []).some((r) => ['admin', 'super_admin', 'virtual_assistant'].includes(r.role as string));
  const days = [...new Set(slots.map((s) => s.class_date))];
  const next = slots.find((s) => s.state !== 'finished' && s.state !== 'cancelled' && (s.state === 'open' || s.class_date === days[0]));
  const mine = slots.filter((s) => s.mine && s.state !== 'finished');

  return (
    <main className="page space-y-5">
      <div>
        <h1 className="text-[30px] leading-none">Live</h1>
        <p className="mt-2 text-muted">Live classes on Zoom, UK time. Book your place, then join from 15 minutes before the start.</p>
      </div>

      {sp.e && <Notice tone="error">{sp.e}</Notice>}
      {sp.ok === 'booked' && <Notice tone="success" title="You are booked">The join button appears here 15 minutes before the class starts.</Notice>}
      {sp.ok === 'cancelled' && <Notice tone="success">Booking cancelled.</Notice>}
      {sp.ok === 'notify' && <Notice tone="success" title="We’ll let you know">You’ll get a notice in the app when that class launches. You can change your mind any time.</Notice>}
      {sp.ok === 'unnotify' && <Notice tone="success">Removed. We won’t notify you about that class.</Notice>}

      {!canJoin && (
        <Notice title="Live classes come with BAYSE Inner Circle">
          You can see the timetable. To book and join, choose BAYSE Inner Circle or BAYSE Black, or use a BAYSE code. <Link href="/join" className="underline">See membership</Link>
        </Notice>
      )}

      {next && (
        <div className="ink-panel p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{next.state === 'open' ? (new Date(next.starts_ts) <= new Date() ? 'On now' : 'Room open · starts soon') : 'Next today'}</p>
          <p className="mt-1 font-display text-2xl font-extrabold uppercase">{pretty(next.starts_at)} · {next.name}</p>
          <p className="text-sm text-muted">{next.minutes} min · {going(next.booked, next.mine)} · camera on for pointers, or off</p>
          <div className="mt-4"><Action s={next} canJoin={canJoin} big /></div>
        </div>
      )}

      <section id="bookings" className="scroll-mt-16">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.1em]">My bookings</h2>
        {mine.length ? (
          <ul className="divide-y divide-stone border border-stone">
            {mine.map((s) => (
              <li key={`${s.class_id}-${s.class_date}`} className="flex items-center gap-3 p-4">
                <span className="min-w-0 flex-1"><span className="block font-semibold">{shortDay(s.class_date)} · {pretty(s.starts_at)}</span><span className="text-sm text-muted">{s.name} · {going(s.booked, true)}</span></span>
                {s.state === 'open'
                  ? <form action={joinClass}><Hidden s={s} /><button className={`${buttonClass('solid')} !min-h-[38px] !px-4 text-sm`}>Join now</button></form>
                  : s.state === 'cancelled' ? <span className="text-xs font-bold uppercase text-clay">Class cancelled</span>
                  : <form action={cancelBooking}><Hidden s={s} /><button className="px-2 py-2 text-sm text-muted underline">Cancel</button></form>}
              </li>
            ))}
          </ul>
        ) : <p className="border border-dashed border-stone p-4 text-sm text-muted">{canJoin ? 'No classes booked yet. Pick one below and it will show here.' : 'Your booked classes will show here.'}</p>}
      </section>

      {days.map((d, i) => (
        <section key={d}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.1em]">{dayLabel(d, i)}</h2>
          <div className="space-y-2">
            {slots.filter((s) => s.class_date === d).map((s) => (
              <Card key={s.class_id} className={`flex items-center gap-4 !p-4 ${s.state === 'finished' || s.state === 'cancelled' ? 'opacity-50' : ''}`}>
                <span className="w-14 shrink-0 font-display text-lg font-extrabold">{pretty(s.starts_at)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted">{s.minutes} min · {info.get(s.class_id)?.level ?? 'All levels'} · {info.get(s.class_id) ? equipmentText(info.get(s.class_id)!) : 'Mat'}</span>
                  {s.state !== 'finished' && s.state !== 'cancelled' && <span className="mt-0.5 block text-xs text-muted">{going(s.booked, s.mine)}</span>}
                </span>
                <Action s={s} canJoin={canJoin} />
              </Card>
            ))}
          </div>
        </section>
      ))}
      {soon.length > 0 && (
        <section id="coming-soon" className="scroll-mt-16">
          <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Coming soon · {soon.length} more classes a week</h2>
          <p className="mb-2 text-sm text-muted">We’re growing to {all.length} live classes a week. These aren’t bookable yet. Tap Notify me and we’ll tell you in the app when one launches.</p>
          <div className="space-y-2">
            {soon.map((c) => {
              const on = wanted.has(c.id);
              return (
                <Card key={c.id} className="flex items-center gap-4 !p-4 border-dashed">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-[0.1em] text-muted">{DAYS[c.weekday - 1]} · {clock(c.starts_at)} · Coming soon</span>
                    <span className="block font-semibold">{c.name}</span>
                    <span className="block text-sm text-muted">{c.minutes} min · {c.level} · {equipmentText(c)}</span>
                  </span>
                  <form action={toggleInterest}><input type="hidden" name="class_id" value={c.id} /><input type="hidden" name="on" value={on ? '0' : '1'} />
                    <button className={`${on ? buttonClass('solid') : buttonClass('secondary')} !min-h-[38px] !px-3 text-xs`}>{on ? '✓ Notifying you' : 'Notify me'}</button>
                  </form>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-xs text-muted">Every class is 40 minutes: a 5-minute warm-up, 30-minute main class and 5-minute cool-down. Joining opens Zoom, where you wait in the lobby until your instructor lets everyone in. If you are pregnant, postnatal or injured, tell your instructor at the start and they will give you options.</p>
    </main>
  );
}
