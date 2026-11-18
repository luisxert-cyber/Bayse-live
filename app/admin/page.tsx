import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice } from '@/components/ui';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

async function count(table: string, filter?: (q: any) => any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const supabase = await createClient();
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: n } = await q;
  return n ?? 0;
}

export default async function AdminHome() {
  await requireStaff('overview');
  const [members, onboarded, trials, active] = await Promise.all([
    count('profiles'),
    count('profiles', (q) => q.not('onboarding_completed_at', 'is', null)),
    count('subscriptions', (q) => q.eq('status', 'trialing')),
    count('subscriptions', (q) => q.eq('status', 'active')),
  ]);
  const tiles = [
    ['Accounts', members], ['Finished onboarding', onboarded], ['On free trial', trials],
    ['Members (paid or code)', active],
  ] as const;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Overview</h1>
      <Notice tone="warning" title="Test mode">Billing runs in Stripe test mode and member emails are off until you approve launch. Counts include test accounts.</Notice>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([label, n]) => (
          <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-1 font-serif text-2xl">{n}</p></Card>
        ))}
      </div>
    </div>
  );
}
