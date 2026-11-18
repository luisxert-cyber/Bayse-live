import Link from 'next/link';
import { wrap } from './sections';

// The standard top of a standalone website page: eyebrow, big title, one line, trial button.
export function PageHero({ eyebrow, title, intro, image, cta = true }: { eyebrow: string; title: string; intro: string; image?: string; cta?: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-stone">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        </div>
      )}
      <div className={`${wrap} relative py-14 sm:py-20`}>
        <p className="eyebrow !text-white/80">{eyebrow}</p>
        <h1 className="mt-4 max-w-[16ch] text-[40px] leading-[0.98] sm:text-[60px]">{title}</h1>
        <p className="mt-5 max-w-[46ch] text-[17px] text-white/85 sm:text-lg">{intro}</p>
        {cta && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/start/welcome" className="inline-flex min-h-[52px] items-center justify-center bg-white px-7 text-[15px] font-bold uppercase tracking-[0.02em] text-black hover:opacity-90">Start my 7-day free trial</Link>
            <Link href="/pricing" className="inline-flex min-h-[52px] items-center justify-center border border-white/70 px-7 text-[15px] font-bold uppercase tracking-[0.02em] hover:bg-white hover:text-black">See pricing</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export const Check = ({ on = true }: { on?: boolean }) => on
  ? <span aria-label="Included" className="inline-flex h-6 w-6 items-center justify-center bg-white text-sm font-bold text-black">✓</span>
  : <span aria-label="Not included" className="inline-flex h-6 w-6 items-center justify-center text-muted">–</span>;
