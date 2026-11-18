import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/session';
import { hasAccount } from '@/lib/auth/account';
import { SitePage } from '@/components/site/SitePage';
import { wrap } from '@/components/site/sections';
import { photoUrl, money, WEEKDAYS, ukDayKey, ukTime, btnSolid, input } from '@/lib/teach/format';
import { bookSession } from '../actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('instructors').select('display_name, headline').eq('slug', slug).eq('status', 'published').maybeSingle();
  return { title: data ? `${data.display_name} · BAYSE instructor` : 'Instructor', description: data?.headline ?? undefined };
}

export default async function Instructor({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: t } = await supabase.from('instructors').select('*').eq('slug', slug).eq('status', 'published').eq('active', true).maybeSingle();
  if (!t) notFound();
  const user = await getUser().catch(() => null);
  const signedIn = hasAccount(user);
  const [{ data: classes }, { data: slots }, { data: settings }, credits] = await Promise.all([
    supabase.from('live_class_instructors').select('lead, live_classes(name, weekday, starts_at, active, one_off_date)').eq('instructor_id', t.id),
    t.offers_private ? supabase.rpc('instructor_open_slots', { p_instructor: t.id, p_days: 21 }) : Promise.resolve({ data: [] }),
    supabase.from('booking_settings').select('price_pence, member_price_pence, session_minutes, cancel_cutoff_hours').single(),
    signedIn ? supabase.from('coaching_credits').select('id').is('session_id', null).gt('expires_at', new Date().toISOString()) : Promise.resolve({ data: [] }),
  ]);
  const openSlots = ((slots ?? []) as { starts_at: string }[]).map((s) => s.starts_at);
  const byDay = openSlots.reduce<Record<string, string[]>>((acc, iso) => { (acc[ukDayKey(iso)] ??= []).push(iso); return acc; }, {});
  const hasCredit = (credits.data ?? []).length > 0;
  const [main, ...more] = t.photos ?? [];
  return (
    <SitePage>
      <section className={`${wrap} grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr]`}>
        <div className="space-y-2">
          <div className="aspect-[4/5] overflow-hidden border border-stone bg-surface">
            {main ? <img src={photoUrl(main)} alt={t.display_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-7xl font-bold text-muted">{t.display_name[0]}</div>}
          </div>
          {more.length > 0 && <div className="grid grid-cols-3 gap-2">{more.map((p: string) => <img key={p} src={photoUrl(p)} alt="" className="aspect-square w-full border border-stone object-cover" />)}</div>}
        </div>
        <div>
          <p className="eyebrow"><Link href="/instructors">Our instructors</Link></p>
          <h1 className="mt-3 text-[40px] leading-none sm:text-[56px]">{t.display_name}</h1>
          {t.headline && <p className="mt-3 text-lg text-muted">{t.headline}</p>}
          {t.bio && <div className="mt-5 space-y-3 whitespace-pre-line text-[16px] leading-relaxed">{t.bio}</div>}
          {(t.specialities?.length > 0 || t.studios?.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">{[...(t.specialities ?? []), ...(t.studios ?? [])].map((x: string) => <span key={x} className="border border-stone px-2.5 py-1 text-xs">{x}</span>)}</div>
          )}
          {classes && classes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Live classes</p>
              <ul className="mt-2 text-sm text-muted">{classes.map((c, i) => { const lc = c.live_classes as unknown as { name: string; weekday: number; starts_at: string; active: boolean; one_off_date: string | null } | null; return lc?.active && !lc.one_off_date ? <li key={i}>{WEEKDAYS[lc.weekday - 1]} {lc.starts_at.slice(0, 5)} · {lc.name}</li> : null; })}</ul>
              <Link href="/live-classes" className="mt-1 inline-block text-xs underline">Full timetable</Link>
            </div>
          )}

          {t.offers_private && (
            <section id="book" className="mt-8 border-2 border-white p-5">
              <p className="text-xl font-bold uppercase">Book a 1-to-1 with {t.display_name.split(' ')[0]}</p>
              <p className="mt-1 text-sm text-muted">{settings?.session_minutes} minutes on Zoom · {money(settings?.price_pence)}{hasCredit ? ' · you have a free Personal Coaching session to use' : ''}. Free to cancel up to {settings?.cancel_cutoff_hours} hours before.</p>
              {sp.error && <p role="alert" className="mt-3 border border-white p-3 text-sm">{sp.error === 'slot' ? 'Please pick a time.' : decodeURIComponent(sp.error)}</p>}
              {openSlots.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No times free in the next three weeks. Check back soon.</p>
              ) : (
                <form action={bookSession} className="mt-4 space-y-4">
                  <input type="hidden" name="slug" value={t.slug} /><input type="hidden" name="instructor_id" value={t.id} />
                  <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                    {Object.entries(byDay).map(([day, times]) => (
                      <fieldset key={day}>
                        <legend className="mb-1.5 text-sm font-bold">{new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</legend>
                        <div className="flex flex-wrap gap-2">
                          {times.map((iso) => (
                            <label key={iso} className="cursor-pointer">
                              <input type="radio" name="starts_at" value={iso} required className="peer sr-only" />
                              <span className="inline-flex min-h-[40px] items-center border border-stone px-3 text-sm peer-checked:border-white peer-checked:bg-white peer-checked:font-bold peer-checked:text-black peer-focus-visible:outline peer-focus-visible:outline-2">{ukTime(iso)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                  <label className="grid gap-1 text-sm">Anything {t.display_name.split(' ')[0]} should know? (optional)<textarea name="note" rows={2} maxLength={500} placeholder="Goals, injuries, experience…" className={input} /></label>
                  {hasCredit && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="use_credit" value="yes" defaultChecked />Use my free Personal Coaching session</label>}
                  <button className={`${btnSolid} w-full min-h-[48px] text-sm`}>{signedIn ? (hasCredit ? 'Request this time' : `Request and pay ${money(settings?.price_pence)}`) : 'Sign in to book'}</button>
                  <p className="text-xs text-muted">{t.display_name.split(' ')[0]} confirms your session, then the Zoom link appears in My BAYSE. If they can’t make it, you get your money or credit back.</p>
                </form>
              )}
            </section>
          )}
        </div>
      </section>
    </SitePage>
  );
}
