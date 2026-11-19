import Link from 'next/link';
import { buttonClass } from '@/components/ui';
import { TIERS, LIVE_CLASSES_PER_WEEK } from '@/lib/site/offer';

/** Shown when a member opens a part of BAYSE their plan does not include. Says what it is and where to add it. */
export function UpgradeGate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="page space-y-4">
      <h1 className="text-[30px] leading-none">{title}</h1>
      <div className="space-y-3 border border-stone p-5">
        <p className="eyebrow">Not in your plan yet</p>
        <p className="text-muted">{children}</p>
        <div className="border border-ink p-4">
          <p className="font-bold uppercase">It comes with BAYSE Inner Circle</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>{LIVE_CLASSES_PER_WEEK} live Zoom classes a week with BAYSE instructors</li>
            <li>Your personal plan and six programmes for your stage of life</li>
            <li>Nutrition: recipes with videos, a weekly food plan and a food diary</li>
            <li>Daily recovery, sleep and effort scores, levels and the weekly league</li>
          </ul>
          <p className="mt-3 text-sm text-muted">{TIERS[1].price} every 28 days, or {TIERS[1].studioPrice} for BAYSE studio members. BAYSE Black adds a private session with your own instructor every 28 days.</p>
        </div>
        <Link href="/you/membership" className={buttonClass('solid')}>Upgrade my membership</Link>
      </div>
    </main>
  );
}
