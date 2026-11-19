import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SitePage } from '@/components/site/SitePage';
import { wrap } from '@/components/site/sections';
import { photoUrl, money } from '@/lib/teach/format';

export const metadata = { title: 'Our instructors', description: 'Meet the BAYSE instructors and book a 40-minute 1-to-1 on Zoom.' };
export const dynamic = 'force-dynamic';

export default async function Instructors() {
  const supabase = await createClient();
  const [{ data: team }, { data: settings }] = await Promise.all([
    supabase.from('instructors').select('slug, display_name, headline, photos, specialities, offers_private').eq('status', 'published').eq('active', true).order('sort').order('display_name'),
    supabase.from('booking_settings').select('price_pence, session_minutes').single(),
  ]);
  return (
    <SitePage>
      <section className={`${wrap} py-10`}>
        <p className="eyebrow">The BAYSE Club</p>
        <h1 className="mt-3 text-[40px] leading-none sm:text-[56px]">Our instructors</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">The same team that teaches in our studios. Join their live classes, or book a {settings?.session_minutes ?? 40}-minute 1-to-1 on Zoom for {money(settings?.price_pence ?? 4499)}. One every 28 days is included with BAYSE Black.</p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(team ?? []).map((t) => (
            <li key={t.slug}>
              <Link href={`/instructors/${t.slug}`} className="group block" data-instructor-card>
                <div className="aspect-[4/5] overflow-hidden border border-stone bg-surface">
                  {t.photos?.[0] ? <img src={photoUrl(t.photos[0])} alt={t.display_name} className="h-full w-full object-cover transition group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-5xl font-bold text-muted">{t.display_name[0]}</div>}
                </div>
                <p className="mt-3 text-lg font-bold uppercase">{t.display_name}</p>
                {t.headline && <p className="text-sm text-muted">{t.headline}</p>}
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] group-hover:underline">{t.offers_private ? 'Meet and book ›' : 'Meet ›'}</p>
              </Link>
            </li>
          ))}
        </ul>
        {!team?.length && (
          <div className="mt-8 border border-dashed border-stone p-8 text-center" data-instructors-soon>
            <p className="text-xs font-bold uppercase tracking-[0.14em]">Coming soon</p>
            <p className="mx-auto mt-3 max-w-[46ch] text-lg">Meet the team behind your live classes and 1-to-1s.</p>
            <p className="mx-auto mt-2 max-w-[52ch] text-sm text-muted">Instructor profiles and 1-to-1 booking open here shortly. BAYSE Black members keep their included session for each paid 28 days, and we’ll let you know as soon as booking opens.</p>
            <Link href="/live-classes" className="mt-5 inline-flex min-h-[44px] items-center border border-white px-5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-white hover:text-black">See the live timetable</Link>
          </div>
        )}
      </section>
    </SitePage>
  );
}
