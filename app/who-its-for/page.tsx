import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { PageHero } from '@/components/site/PageHero';
import { wrap, PHOTO, TrialCta } from '@/components/site/sections';
import { OPENING_IN_STAGES } from '@/lib/site/offer';

// Who The BAYSE Club is for (owner brief, 19 Nov 2026): the women we can help and the six programmes.
// BAYSE supports wellbeing and movement. It is not a medical or rehabilitation service, and the page says so.

export const metadata = { title: 'Who it’s for', description: 'The BAYSE Club is Pilates, strength, mobility, nutrition, coaching and community from home, for women at every age and stage: beginners, new mums, midlife, later life and everyone in between.' };

const WOMEN: { title: string; who: [string, string][] }[] = [
  { title: 'At every stage of life', who: [
    ['In your stronger years', 'Older women who want better strength, balance, mobility and confidence.'],
    ['After having a baby', 'Postnatal women returning to exercise, rebuilding core, pelvic floor and whole body gradually.'],
    ['Perimenopause and menopause', 'Strength training, movement, energy, confidence and lifestyle support through midlife.'],
  ] },
  { title: 'Starting, or starting again', who: [
    ['Complete beginners', 'Women who feel nervous or intimidated by gyms and studios.'],
    ['Back after a long break', 'Women returning to exercise after months or years away.'],
    ['Stiff or unsure', 'Women with stiffness or low confidence in movement who want gentle, progressive sessions.'],
    ['After injury or illness', 'Women recovering from an injury or illness, once cleared to exercise and with suitable adaptations.'],
  ] },
  { title: 'When life is full', who: [
    ['Busy mothers', 'Women managing childcare, work and family, who need sessions that fit the gaps.'],
    ['Too far from a studio', 'Women who can’t attend a studio because of location, transport, travel or time.'],
    ['Happier at home', 'Women who prefer exercising privately, in their own space.'],
    ['Reduced mobility', 'Women who need seated, standing or lower-impact options where appropriate.'],
  ] },
  { title: 'Wanting more than a video', who: [
    ['Someone in your corner', 'Accountability with plans, check-ins, progress tracking and encouragement.'],
    ['Food and habits too', 'Nutrition and healthy-habit support alongside exercise.'],
    ['Private support', 'One-to-one Zoom Pilates with an instructor who knows you.'],
    ['A welcoming community', 'Somewhere friendly, not a competitive fitness environment.'],
  ] },
];

const PROGRAMMES: { name: string; body: string; now: [string, string] | null }[] = [
  { name: 'BAYSE Begin', body: 'For beginners and women returning to movement. Start from the very first breath.', now: ['/start/welcome', 'Open now: 4 weeks, 3 short classes a week'] },
  { name: 'BAYSE Stronger Years', body: 'For women over 50: strength, balance and staying independent.', now: ['/start/welcome', 'Open now: 6 weeks, mostly standing'] },
  { name: 'BAYSE Postnatal', body: 'A gradual return after pregnancy and childbirth.', now: null },
  { name: 'BAYSE Midlife', body: 'Support through perimenopause and menopause.', now: ['/start/welcome', 'Open now: 6 weeks of strength, core and unwinding'] },
  { name: 'BAYSE Prenatal', body: 'Staying strong through pregnancy. Opens once our specialist instructors have signed it off.', now: null },
  { name: 'BAYSE At Home', body: 'Low-impact, adaptable sessions for your own space.', now: ['/start/welcome', 'Open now: 4 weeks, no equipment'] },
  { name: 'BAYSE Personal', body: 'Private one-to-one Pilates, coaching and accountability.', now: ['/instructors', 'Meet the instructors'] },
];

export default function WhoItsFor() {
  return (
    <SitePage>
      <PageHero eyebrow="Who it’s for" title="Every woman is welcome here" intro="Pilates, strength, mobility, nutrition, coaching and community, from home. Whatever your age, your starting point or how long it’s been." image={PHOTO.friends} />

      <section className={`${wrap} py-12`}>
        <p className="eyebrow">Women we can help</p>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">You’ll find yourself here</h2>
        <div className="mt-8 space-y-10">
          {WOMEN.map((group) => (
            <div key={group.title}>
              <h3 className="text-xl font-bold uppercase">{group.title}</h3>
              <div className="mt-4 grid gap-px border border-stone bg-stone sm:grid-cols-2">
                {group.who.map(([title, body]) => (
                  <div key={title} className="bg-bg p-5" data-who-card>
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-[15px] text-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="programmes" className={`${wrap} scroll-mt-28 pb-12`}>
        <p className="eyebrow">Programmes</p>
        <h2 className="mt-2 text-[30px] sm:text-[40px]">Six ways in</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMMES.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-3 border border-stone p-6">
              <p className="text-sm font-bold text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-2xl font-bold uppercase leading-tight">{p.name}</h3>
              <p className="flex-1 text-[15px] text-muted">{p.body}</p>
              {p.now
                ? <Link href={p.now[0]} className="text-sm font-bold uppercase tracking-[0.06em] underline">{p.now[1]} ›</Link>
                : <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{OPENING_IN_STAGES}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className={`${wrap} pb-12`}>
        <div className="border border-stone p-6">
          <p className="eyebrow">Looking after you</p>
          <h2 className="mt-2 text-2xl font-bold uppercase">Movement and wellbeing, not medical care</h2>
          <p className="mt-3 max-w-[70ch] text-muted">BAYSE supports your wellbeing and movement. It isn’t a medical or rehabilitation service. If you’re postnatal, recovering from an injury or illness, or living with significant pain or limited mobility, please get the all-clear from your doctor, physio or pelvic-health specialist first. Tell us in your health check and a suitably qualified instructor will adapt your sessions.</p>
        </div>
      </section>

      <TrialCta />
    </SitePage>
  );
}
