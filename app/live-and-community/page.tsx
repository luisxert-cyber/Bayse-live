import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_TIMETABLE, LIVE_CLASSES_PER_WEEK, LIVE_CLASS_MINUTES, CLUBS, FAQS, OPENING_IN_STAGES } from '@/lib/site/offer';
import { PhoneTour } from '@/components/site/PhoneTour';
import { Icon } from '@/components/site/Graphics';

// Live classes, community, how it works and questions: the BAYSE Live sections, on their own page
// so the homepage can follow the BAYSE On Demand layout.

const PHOTO = {
  hero: '/images/studio-bird-dog.webp',
  plank: '/images/studio-side-plank.webp',
  core: '/images/studio-mat-core.webp',
  move: '/images/studio-movement.webp',
  selfie: '/images/community-selfie.webp',
  sign: '/images/community-studio-sign.webp',
  friends: '/images/community-friends.webp',
};

const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const Chip = ({ children = OPENING_IN_STAGES }: { children?: React.ReactNode }) => <span className="chip">{children}</span>;
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];

function SecHead({ eyebrow, title, children, chip }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; chip?: boolean }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-3"><Eyebrow>{eyebrow}</Eyebrow>{chip && <Chip />}</div>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">{title}</h2>
      </div>
      {children && <p className="max-w-[52ch] text-muted">{children}</p>}
    </div>
  );
}

export const metadata = { title: 'Live classes & community' };

export default async function LiveAndCommunity() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* Live */}
        <section id="live" className={`${wrap} scroll-mt-20 pb-10 pt-10 sm:pt-14`}>
          <SecHead eyebrow="Live classes" title={`${LIVE_CLASSES_PER_WEEK} live classes every week`}>All {LIVE_CLASS_MINUTES} minutes. One instructor teaches, the other watches your form and answers questions. Included with BAYSE Club and BAYSE Coaching.</SecHead>
          <div className="grid gap-3 sm:grid-cols-7">
            {LIVE_TIMETABLE.map((d) => (
              <div key={d.day} className="flex gap-4 rounded-card border border-stone bg-surface p-4 sm:block">
                <p className="w-12 shrink-0 text-sm font-bold uppercase sm:w-auto">{d.short}</p>
                <ul className="flex-1 space-y-3 sm:mt-3">
                  {d.classes.map((c) => (
                    <li key={c.time} className="flex items-baseline gap-3 sm:block">
                      <span className="w-[56px] shrink-0 font-display text-lg font-extrabold sm:w-auto">{c.time}</span>
                      <span className="text-sm text-muted sm:block">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">UK time. The app always shows the latest timetable.</p>
        </section>

        {/* Community (black band) */}
        <section id="community" className="band scroll-mt-16 py-14 sm:py-20">
          <div className={wrap}>
            <SecHead eyebrow="Your people" chip title={<>The best part of BAYSE <span className="script">happens after class</span></>}>
              Friendships are why people stay. Find your Circle, take on monthly challenges together, and meet up in real life through clubs run by members, for members.
            </SecHead>
            <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
              <figure className="relative overflow-hidden rounded-card">
                <img src={PHOTO.selfie} alt="A group of BAYSE members laughing together after a class" className="aspect-[4/3] h-full w-full object-cover" style={{ objectPosition: '50% 45%' }} />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold">BAYSE members, after class</figcaption>
              </figure>
              <img src={PHOTO.sign} alt="BAYSE members together in front of the BAYSE sign" className="aspect-[4/3] h-full w-full rounded-card object-cover sm:aspect-auto" style={{ objectPosition: '50% 35%' }} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CLUBS.map((c, i) => (
                <div key={c.name} className="flex gap-4 rounded-card border border-stone p-5">
                  <span className="h-9 w-9 shrink-0">{CLUB_ICONS[i]}</span>
                  <div><h3 className="text-lg uppercase">{c.name}</h3><p className="mt-1 text-muted">{c.body}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">Adults only. Meet in public places. Members can report, block and choose who can find them.</p>
          </div>
        </section>

        {/* How it works + app */}
        <section id="how" className={`${wrap} grid scroll-mt-20 items-center gap-12 py-14 md:grid-cols-[1fr_auto]`}>
          <div>
            <Eyebrow>How BAYSE works</Eyebrow>
            <h2 className="mt-2 text-[30px] sm:text-[40px]">Three steps <span className="script">to your first class</span></h2>
            <ol className="mt-8 space-y-6">
              {[
                ['Tell us about you', 'Your goals, experience and how much time you have. About a minute.'],
                ['Get your plan', 'We recommend a programme, explain why, and set out each week. Train live, on demand, or both.'],
                ['Show up, together', 'Book live classes, join your Circle and see what is on near you.'],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display font-extrabold text-bg">{i + 1}</span>
                  <div><h3 className="text-lg uppercase">{t}</h3><p className="mt-1 max-w-md text-muted">{b}</p></div>
                </li>
              ))}
            </ol>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-8`}>Build my plan</Link>
          </div>
          <div className="flex justify-center"><PhoneTour photos={{ hero: PHOTO.hero, a: PHOTO.core, b: PHOTO.plank, c: PHOTO.move, group: PHOTO.friends }} /></div>
        </section>

        {/* Questions */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-[30px] sm:text-[40px]">Questions</h2>
          <div className="mt-6 divide-y divide-stone border-y border-stone">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-16 rounded-3xl bg-surface p-8 text-center">
            <h2 className="text-[30px] sm:text-[40px]">Your first class <span className="script">is a minute away</span></h2>
            <Link href="/start/welcome" className={`${buttonClass('primary')} mt-6`}>Start 7 days free</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
