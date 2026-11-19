import Link from 'next/link';
import { buttonClass } from '@/components/ui';

/** Shown when a member opens a part of BAYSE their plan does not include. Says what it is and where to add it. */
export function UpgradeGate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="page space-y-4">
      <h1 className="text-[30px] leading-none">{title}</h1>
      <div className="space-y-3 border border-stone p-5">
        <p className="eyebrow">Not in your plan yet</p>
        <p className="text-muted">{children}</p>
        <p className="text-sm text-muted">It comes with BAYSE Foundation, Inner Circle and Black. BAYSE studio members add it with Inner Circle or Black at half price.</p>
        <Link href="/you/membership" className={buttonClass('solid')}>See memberships</Link>
      </div>
    </main>
  );
}
