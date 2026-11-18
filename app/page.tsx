import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { buttonClass } from '@/components/ui';
import { getUser } from '@/lib/auth/session';
import { LIVE_TIMETABLE, LIVE_CLASSES_PER_WEEK, LIVE_CLASS_MINUTES, PROGRAMMES, CLUBS, FAQS, TIERS, OPENING_IN_STAGES } from '@/lib/site/offer';
import { PhoneTour } from '@/components/site/PhoneTour';
import { Icon } from '@/components/site/Graphics';

// Home: 70% BAYSE (black, bold Helvetica, square buttons), 30% lifestyle (linen sections,
// big photography, an editorial italic). Order: offer → community → how it works → live →
// progress → studio members → membership → questions.

const PHOTO = {
  hero: '/images/studio-bird-dog.webp',
  plank: '/images/studio-side-plank.webp',
  core: '/images/studio-mat-core.webp',
  move: '/images/studio-movement.webp',
  selfie: '/images/community-selfie.webp',
  sign: '/images/community-studio-sign.webp',
  friends: '/images/community-friends.webp',
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;
const Tick = () => <span aria-hidden className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink text-[9px] font-bold text-bg">✓</span>;
const Chip = ({ children = OPENING_IN_STAGES }: { children?: React.ReactNode }) => <span className="chip">{children}</span>;
const CLUB_ICONS = [Icon.padel, Icon.walk, Icon.coffee, Icon.circle];
const wrap = 'mx-auto max-w-5xl px-4 sm:px-6';

export default async function Home() {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        {/* 1 · Hero: one big photograph and the promise */}
        <section className="relative isolate overflow-hidden bg-black">
          <img src={PHOTO.hero} alt="A BAYSE instructor in the studio, mid-movement on the mat" className="absolute inset-0 -z-10 h-full w-full object-cover" style={{ objectPosition: '50% 35%' }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className={`${wrap} flex min-h-[560px] flex-col justify-end pb-12 pt-40 sm:min-h-[640px] sm:pb-16`}>
            <p className="eyebrow !text-white/80">BAYSE online · from the BAYSE studios</p>
            <h1 className="mt-4 max-w-2xl text-[42px] sm:text-[68px]">Move well. <span className="script block text-[46px] sm:text-[74px]">Feel good.</span>Find your people.</h1>
            <p className="mt-5 max-w-lg text-lg text-white/90">Live and on-demand Pilates, a plan made around you, and a community of women who keep you going, at home and near your studio.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/start/welcome" className={buttonClass('secondary')}>Start 7 days free</Link>
              <Link href="#studio" className={buttonClass('primary')}>Studio member? It&rsquo;s included</Link>
            </div>
          </div>
        </section>

        {/* 2 · The offer, as a way of life */}
        <section className="warm">
          <div className={`${wrap} py-16 sm:py-24`}>
            <div className="max-w-2xl">
              <Eyebrow>More than a class</Eyebrow>
              <h2 className="mt-3 text-[34px] sm:text-[48px]">Pilates is where it starts. <span className="script block">What it gives you is the point.</span></h2>
              <p className="mt-5 text-lg text-muted">Stronger, calmer, more like yourself. BAYSE brings together the training, the support and the people, all connected to the studios you already love.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <article>
                <img src={PHOTO.plank} alt="A BAYSE instructor holding a side plank" className="aspect-[4/5] w-full object-cover" />
                <p className="eyebrow mt-5">Move</p>
                <h3 className="mt-2 text-xl">Pilates that fits your life</h3>
                <p className="mt-2 text-muted">{LIVE_CLASSES_PER_WEEK} live classes a week, an on-demand library and a programme built from your answers.</p>
              </article>
              <article>
                <img src={PHOTO.friends} alt="BAYSE members together in the studio" className="aspect-[4/5] w-full object-cover" style={{ objectPosition: '50% 40%' }} />
                <p className="eyebrow mt-5">Belong</p>
                <h3 className="mt-2 text-xl">Your Circle, your studio, <span className="script">your people</span></h3>
                <p className="mt-2 text-muted">Small groups who train at your times, plus padel, walks and coffee arranged by members near your studio.</p>
              </article>
              <article>
                <img src={PHOTO.move} alt="A BAYSE instructor moving through a mat sequence" className="aspect-[4/5] w-full object-cover" />
                <div className="mt-5 flex flex-wrap items-center gap-2"><p className="eyebrow">Thrive</p><Chip /></div>
                <h3 className="mt-2 text-xl">Food, rest and every life stage</h3>
                <p className="mt-2 text-muted">Simple recipes and meal ideas, plus private women&rsquo;s wellness support. Never a crash diet.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 3 · Community: a main reason to join and to stay */}
        <section id="community" className="bg-black">
          <div className={`${wrap} py-16 sm:py-24`}>
            <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3"><Eyebrow>Your people</Eyebrow><Chip /></div>
                <h2 className="mt-3 text-[34px] sm:text-[52px]">The best part of BAYSE <span className="script block">happens after class.</span></h2>
              </div>
              <p className="text-lg text-muted">Friendships are why people stay. Join the BAYSE community and your studio&rsquo;s own group, take on monthly challenges together, and meet up in real life through clubs run by members, for members.</p>
            </div>
            <figure className="relative mt-12">
              <img src={PHOTO.selfie} alt="A group of BAYSE members laughing together after a class" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" style={{ objectPosition: '50% 45%' }} />
              <figcaption className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em]">BAYSE members, after class</figcaption>
            </figure>
            <div className="grid gap-px bg-white/15 sm:grid-cols-2">
              {CLUBS.map((c, i) => (
                <div key={c.name} className="flex gap-5 bg-black p-6 sm:p-8">
                  <span className="h-10 w-10 shrink-0 text-white">{CLUB_ICONS[i]}</span>
                  <div>
                    <h3 className="text-xl uppercase">{c.name}</h3>
                    <p className="mt-2 text-muted">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">Adults only. Meet in public places. Members can report, block and choose who can find them.</p>
          </div>
        </section>

        {/* 4 · How it works, with the app */}
        <section id="how" className="warm">
          <div className={`${wrap} grid items-center gap-14 py-16 sm:py-24 md:grid-cols-[1fr_auto]`}>
            <div>
              <Eyebrow>How BAYSE works</Eyebrow>
              <h2 className="mt-3 text-[34px] sm:text-[48px]">Three steps <span className="script">to your first class</span></h2>
              <ol className="mt-10 space-y-8">
                {[
                  ['Tell us about you', 'Your goals, experience and how much time you have. About a minute. Food and wellness can wait until you are ready.'],
                  ['Get your plan', 'We recommend a programme, explain why, and set out each week. Train live, on demand, or both.'],
                  ['Show up, together', 'Book live classes with two instructors watching your form, join your Circle, and see what is on near your studio.'],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-5">
                    <span className="script w-10 shrink-0 text-[40px] leading-none">{i + 1}</span>
                    <div><h3 className="text-xl uppercase">{t}</h3><p className="mt-1.5 max-w-md text-muted">{b}</p></div>
                  </li>
                ))}
              </ol>
              <Link href="/start/welcome" className={`${buttonClass('secondary')} mt-10`}>Build my plan</Link>
            </div>
            <div className="flex justify-center"><PhoneTour photos={{ hero: PHOTO.hero, a: PHOTO.core, b: PHOTO.plank, c: PHOTO.move, group: PHOTO.friends }} /></div>
          </div>
        </section>

        {/* 5 · Live */}
        <section id="live" className="bg-black">
          <div className={`${wrap} py-16 sm:py-24`}>
            <div className="grid gap-10 md:grid-cols-2 md:items-end">
              <div>
                <Eyebrow>Live classes</Eyebrow>
                <h2 className="mt-3 text-[34px] sm:text-[52px]">{LIVE_CLASSES_PER_WEEK} live classes <span className="script block">every week.</span></h2>
              </div>
              <p className="text-lg text-muted">All {LIVE_CLASS_MINUTES} minutes, all on the mat. Two BAYSE instructors in every class: one teaches, the other watches your form and answers your questions. Camera on for pointers, or off if you prefer.</p>
            </div>
            <div className="mt-12 grid gap-px border-y border-white/20 bg-white/20 sm:grid-cols-7">
              {LIVE_TIMETABLE.map((d) => (
                <div key={d.day} className="flex gap-4 bg-black py-4 sm:block sm:px-3">
                  <p className="w-12 shrink-0 text-sm font-bold uppercase sm:w-auto">{d.short}</p>
                  <ul className="flex-1 space-y-3 sm:mt-3">
                    {d.classes.map((c) => (
                      <li key={c.time} className="flex items-baseline gap-3 sm:block">
                        <span className="w-[60px] shrink-0 text-lg font-bold sm:w-auto sm:text-xl">{c.time}</span>
                        <span className="text-sm text-muted sm:mt-0.5 sm:block">{c.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">UK time. Included with BAYSE Club and BAYSE Coaching. The app always shows the latest timetable.</p>
          </div>
        </section>

        {/* 6 · Progress and programmes */}
        <section id="progress" className="warm">
          <div className={`${wrap} grid gap-12 py-16 sm:py-24 md:grid-cols-2 md:items-center`}>
            <div className="relative">
              <img src={PHOTO.core} alt="A BAYSE instructor teaching a mat Pilates core exercise" className="aspect-[4/5] w-full object-cover" />
              <div className="absolute -bottom-6 right-4 w-[230px] bg-surface p-4 shadow-card sm:-right-6">
                <p className="eyebrow">Your weekly progress</p>
                <div className="mt-3 flex gap-1.5">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="flex-1 text-center"><div className={`mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full text-[10px] ${i === 0 || i === 2 ? 'bg-ink text-bg' : i === 4 ? 'border border-dashed border-ink/50' : 'bg-ink/[0.06]'}`}>{i === 0 || i === 2 ? '✓' : ''}</div><span className="text-[10px] text-muted">{d}</span></div>
                ))}</div>
                <p className="mt-2 text-sm">2 of 3 this week</p>
              </div>
            </div>
            <div>
              <Eyebrow>Your programme</Eyebrow>
              <h2 className="mt-3 text-[34px] sm:text-[48px]">Progress you can see, <span className="script block">and feel.</span></h2>
              <p className="mt-4 text-lg text-muted">A 4 to 12-week plan matched to you, with a weekly goal you can actually hit, streaks, milestones, and a nudge from your coach when life gets busy.</p>
              <ul className="mt-8 divide-y divide-stone border-y border-stone">
                {PROGRAMMES.map((p) => (
                  <li key={p.name} className="flex items-baseline justify-between gap-4 py-3">
                    <span><span className="font-bold">{p.name}</span><span className="block text-sm text-muted">{p.for}</span></span>
                    <span className="shrink-0 text-xs uppercase tracking-[0.1em] text-muted">{p.weeks}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 7 · Studio members: the biggest value, made obvious */}
        <section id="studio" className="bg-black">
          <div className={`${wrap} py-16 sm:py-24`}>
            <div className="panel grid overflow-hidden md:grid-cols-2">
              <img src={PHOTO.sign} alt="BAYSE studio members in front of the BAYSE sign" className="h-72 w-full object-cover md:h-full" style={{ objectPosition: '50% 35%' }} />
              <div className="p-7 sm:p-12">
                <Eyebrow>Already a BAYSE studio member?</Eyebrow>
                <h2 className="mt-3 text-[32px] sm:text-[44px]">Your membership <span className="script block">just got bigger.</span></h2>
                <p className="mt-4 text-lg text-muted">On a £99 or £148 studio membership? BAYSE Club is included: live classes, your programme, on demand, your Circle and clubs near your studio.</p>
                <p className="mt-4 text-sm"><span className="silver-text text-[28px] font-extrabold">£39.99</span> <span className="text-muted">a month of value, at no extra cost</span></p>
                <Link href="/start/welcome" className={`${buttonClass('secondary')} mt-8`}>Link my studio membership</Link>
                <p className="mt-3 text-xs text-muted">Choose your studio when you sign up. Your studio confirms your membership, then everything switches on.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8 · Membership */}
        <section id="membership" className="warm">
          <div className={`${wrap} py-16 sm:py-24`}>
            <div className="max-w-2xl">
              <Eyebrow>Membership</Eyebrow>
              <h2 className="mt-3 text-[34px] sm:text-[48px]">Find your fit. <span className="script">7 days free.</span></h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {TIERS.map((t) => {
                const featured = 'featured' in t && t.featured;
                return (
                  <div key={t.key} className={`flex flex-col p-7 ${featured ? 'ink-panel' : 'border border-stone bg-surface'}`}>
                    <p className="script text-[26px] leading-none">{t.tagline}</p>
                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.06em]">{t.name}{featured && <span className="ml-2 font-normal text-muted">· Most popular</span>}</p>
                    <p className="mt-1"><span className="text-[36px] font-extrabold leading-none">{t.price}</span> <span className="text-sm text-muted">/ month</span></p>
                    <p className="mt-3 text-sm text-muted">{t.bestFor}</p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm">{t.items.map((i) => <li key={i} className="flex gap-3"><Tick />{i}</li>)}</ul>
                    <Link href="/start/welcome" className={`${buttonClass(featured ? 'secondary' : 'primary', true)} mt-7`}>Start free trial</Link>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm text-muted">Studio members on £99 or £148: BAYSE Club is included. Prices are being finalised before launch. Cancel any time; no charge if you cancel during your trial. Coaching, nutrition, wellness and Clubs open in stages, and the app always shows what is live.</p>
          </div>
        </section>

        {/* 9 · Questions and close */}
        <section id="faq" className="bg-black">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="text-[34px] sm:text-[44px]">Questions</h2>
            <div className="mt-6 divide-y divide-white/20 border-y border-white/20">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-muted">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-20 text-center">
              <h2 className="text-[34px] sm:text-[48px]">Your first class <span className="script block">is a minute away.</span></h2>
              <Link href="/start/welcome" className={`${buttonClass('secondary')} mt-8`}>Start 7 days free</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
