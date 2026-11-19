import { wrap } from '@/components/site/sections';

// "Over 3,000 five-star reviews": the Google reviews of the BAYSE studios, as one graphic.
// Checked 19 Nov 2026: 4,077 Google reviews across the ten BAYSE studio listings, every one rated
// 4.9 or 5.0, which puts the five-star count above 3,800. Re-check before raising the number.
// These are reviews of the studios, so the line underneath says so.

const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 sm:h-9 sm:w-9" fill="#fff"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.5z" /></svg>
);

export function ReviewsBadge() {
  return (
    <section className={`${wrap} py-10`} aria-label="Over 3,000 five-star reviews">
      <div className="flex flex-col items-center gap-3 border border-stone px-5 py-8 text-center" data-reviews-badge>
        <div className="flex gap-1.5" role="img" aria-label="Five stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>
        <p className="font-display text-[34px] font-bold uppercase leading-[1.02] sm:text-[52px]">Over 3,000<br className="sm:hidden" /> five-star reviews</p>
        <p className="max-w-[44ch] text-sm text-muted">From members of our BAYSE Reformer Pilates studios, on Google. The same team now coaches you at home.</p>
      </div>
    </section>
  );
}
