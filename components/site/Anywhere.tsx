import Link from 'next/link';
import { buttonClass } from '@/components/ui';

// "Use it anywhere": the same membership on a phone, a tablet and a laptop.
// The screens are small, faithful sketches of real member screens (example content), drawn in the page so they stay sharp at any size.

function Screen({ photo, eyebrow, title, meta, position = '50% 35%' }: { photo: string; eyebrow: string; title: string; meta: string; position?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white">
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.3)_55%,rgba(0,0,0,0.15)_100%)]" />
      <div className="absolute inset-x-[7%] bottom-[8%]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[9px]">{eyebrow}</p>
        <p className="mt-0.5 text-[13px] font-bold uppercase leading-none sm:text-[16px]">{title}</p>
        <p className="mt-1 text-[8px] text-white/75 sm:text-[10px]">{meta}</p>
      </div>
    </div>
  );
}

const DEVICES = ['Phone', 'Tablet', 'Laptop'] as const;

export function AnywhereSection({ photos }: { photos: { a: string; b: string; c: string } }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid items-center gap-10 border border-stone p-6 sm:p-10 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <p className="eyebrow">Phone · Tablet · Laptop</p>
          <h2 className="mt-3 text-[36px] leading-[1.0] sm:text-[48px]">Your studio, wherever you are</h2>
          <p className="mt-4 max-w-[46ch] text-[17px] text-muted">Roll out a mat at home, in a hotel room or in the garden. The BAYSE Club runs in your browser, so there is nothing to download and your plan, classes and progress are always in step.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {DEVICES.map((d) => <li key={d} className="border border-stone px-3 py-1.5 text-sm font-bold uppercase tracking-[0.06em]">{d}</li>)}
          </ul>
          <p className="mt-4 text-sm text-muted">One membership is for one person, on one device at a time. Sign in on another and it simply takes over.</p>
          <Link href="/start/welcome" className={`${buttonClass('solid')} mt-6`}>Start my 7-day free trial</Link>
        </div>

        {/* Laptop at the back, tablet and phone in front. Sizes are percentages so the group scales with the column. */}
        <div className="relative mx-auto aspect-[16/11] w-full max-w-[560px]" role="img" aria-label="The BAYSE Club shown on a laptop, a tablet and a phone">
          <div className="absolute left-[8%] top-0 w-[78%]">
            <div className="rounded-t-[10px] bg-[#1b1b1b] p-[2.2%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]">
              <div className="aspect-[16/10] overflow-hidden rounded-[4px]"><Screen photo={photos.a} eyebrow="Live now" title="Morning Flow" meta="45 min · Taught live by the BAYSE team" position="60% 30%" /></div>
            </div>
            <div className="mx-[-7%] h-[10px] rounded-b-[10px] bg-[#2a2a2a] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
          </div>
          <div className="absolute bottom-0 left-0 w-[40%] rounded-[14px] bg-[#1b1b1b] p-[1.6%] shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
            <div className="aspect-[3/4] overflow-hidden rounded-[9px]"><Screen photo={photos.b} eyebrow="Your plan" title="Core & Posture" meta="Week 2 of 6" /></div>
          </div>
          <div className="absolute bottom-0 right-[2%] w-[21%] rounded-[16px] bg-[#1b1b1b] p-[1.2%] shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
            <div className="aspect-[9/19] overflow-hidden rounded-[12px]"><Screen photo={photos.c} eyebrow="Today" title="Core Control" meta="15 min · Mat" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
