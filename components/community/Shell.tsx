import Link from 'next/link';
import { Notice, buttonClass } from '@/components/ui';
import type { Status } from '@/lib/community/data';

const TABS = [
  ['/community', 'Feed'],
  ['/community/circles', 'Circles'],
  ['/community/clubs', 'Clubs'],
  ['/community/settings', 'Privacy'],
] as const;

const OK: Record<string, string> = { reported: 'Thanks. Your report has gone to the BAYSE team.', blocked: 'Blocked. You won’t see each other’s posts, comments or activities.', saved: 'Saved.' };

export function CommunityShell({ active, title, intro, e, ok, children }: { active: string; title: string; intro?: string; e?: string; ok?: string; children: React.ReactNode }) {
  return (
    <main className="page space-y-5">
      <div>
        <h1 className="text-[30px] leading-none">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
      </div>
      <nav aria-label="Community" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={active === href ? 'page' : undefined}
            className="whitespace-nowrap rounded-full border border-stone px-4 py-2 text-sm font-medium aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg">{label}</Link>
        ))}
      </nav>
      {e && <Notice tone="error">{e}</Notice>}
      {ok && OK[ok] && <Notice tone="success">{OK[ok]}</Notice>}
      {children}
    </main>
  );
}

export function Gate({ status }: { status: Status }) {
  const copy: Record<Exclude<Status, 'ok'>, [string, string, string, string]> = {
    sign_in: ['Sign in to join the community', 'Create your account or sign in to meet other BAYSE members.', '/sign-in?next=/community', 'Sign in'],
    membership: ['Community comes with your membership', 'Your feed, Circles and the Padel, Walk and Social Clubs are included in every BAYSE plan, including the 7-day free trial.', '/you/membership', 'See memberships'],
    profile: ['Finish your profile first', 'Choose the name other members will see and confirm you are 18 or over.', '/start/name', 'Finish my profile'],
    restricted: ['Community access is paused', 'Your community access has been paused by the BAYSE team. Contact us if you think this is a mistake.', '/you', 'Go to You'],
  };
  if (status === 'ok') return null;
  const [t, b, href, cta] = copy[status];
  return (
    <main className="page space-y-5">
      <h1 className="text-[30px] leading-none">Community</h1>
      <div className="overflow-hidden rounded-card border border-stone bg-surface">
        <img src="/images/community-selfie.webp" alt="BAYSE members together after a class" className="aspect-[16/9] w-full object-cover" />
        <div className="space-y-2 p-5">
          <h2 className="text-xl uppercase">{t}</h2>
          <p className="text-muted">{b}</p>
          <Link href={href} className={`${buttonClass('primary')} mt-2`}>{cta}</Link>
        </div>
      </div>
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Circles waiting for you</h2>
        <div className="flex flex-wrap gap-2">
          {['Early Birds', 'Beginners Together', 'Lunchtime Movers', 'Evening Unwind', 'Strong & Sculpt Squad', 'Mums on the Move'].map((c) => (
            <span key={c} className="rounded-full border border-stone bg-surface px-3.5 py-1.5 text-sm">{c}</span>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2">
        <img src="/images/community-studio-sign.webp" alt="BAYSE members in front of the BAYSE sign" className="aspect-square w-full rounded-card object-cover" style={{ objectPosition: '50% 35%' }} />
        <img src="/images/community-friends.webp" alt="BAYSE members together in the studio" className="aspect-square w-full rounded-card object-cover" />
      </div>
      <ul className="grid gap-2 text-sm text-muted">
        <li>🗣️ <span className="font-semibold text-ink">The feed</span>: wins, questions, recipes and encouragement, with the BAYSE team.</li>
        <li>👯 <span className="font-semibold text-ink">Circles</span>: small groups who train at similar times and keep each other going.</li>
        <li>🎾 <span className="font-semibold text-ink">Clubs</span>: padel games, walks and socials, arranged by members near you.</li>
      </ul>
    </main>
  );
}
