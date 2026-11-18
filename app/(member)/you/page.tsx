import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { loadMember } from '@/lib/data/member';
import { Card } from '@/components/ui';
import { ProfileForm } from '@/components/you/ProfileForm';

export const metadata = { title: 'You' };
export const dynamic = 'force-dynamic';

const ROWS = [
  { href: '/you/personalise', label: 'Personalise BAYSE' },
  { href: '/you/membership', label: 'Membership and billing' },
  { href: '/you/privacy', label: 'Privacy and your data' },
];

export default async function You() {
  const user = await requireUser('/you');
  const m = await loadMember(user.id);
  return (
    <main className="page space-y-5">
      <h1 className="text-xl font-semibold">You</h1>
      <Card>
        <p className="eyebrow mb-4">Profile</p>
        <ProfileForm firstName={m.profile?.first_name ?? ''} displayName={m.profile?.display_name ?? ''} />
        <p className="mt-4 text-sm text-muted">Signed in as {user.email}</p>
      </Card>
      <Card className="p-0">
        <ul className="divide-y divide-stone">
          {ROWS.map((r) => (
            <li key={r.href}><Link href={r.href} className="flex min-h-[56px] items-center justify-between px-5 hover:bg-stone/30">{r.label}<span aria-hidden className="text-muted">›</span></Link></li>
          ))}
          <li className="flex min-h-[56px] items-center justify-between px-5 text-muted">Progress, Coaching, Nutrition and Wellness <span className="text-xs">Coming soon</span></li>
        </ul>
      </Card>
      <form action="/auth/sign-out" method="post"><button className="w-full py-3 text-sm text-muted hover:text-ink">Sign out</button></form>
    </main>
  );
}
