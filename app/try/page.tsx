import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder';

export const metadata = { title: 'Try a free workout' };

export default function Try() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="eyebrow">Free taster · no sign-up</p>
        <h1 className="mt-2 text-[34px] leading-none">Build your free workout</h1>
        <p className="mt-2 text-muted">Choose what you want to work on and how long you have. Then follow the BAYSE instructor and the timer does the rest.</p>
        <div className="mt-6"><WorkoutBuilder initial={{ areas: ['core', 'mobility'], minutes: 10, level: 1, avoid: [], seed: 1, style: 'mat', equipment: [] }} exitHref="/start/welcome" /></div>
        <p className="mt-6 text-center text-sm">Enjoyed it? <Link href="/start/welcome" className="font-semibold underline">Build your plan and start 7 days free</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
