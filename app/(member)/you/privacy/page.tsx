import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, buttonClass } from '@/components/ui';
import { withdrawConsent } from '../actions';
import { DeleteAccountForm } from '@/components/you/DeleteAccountForm';

export const metadata = { title: 'Privacy and your data' };
export const dynamic = 'force-dynamic';

const LABEL: Record<string, string> = {
  wellness_data: 'Women’s wellness interests',
  dietary_needs: 'Allergies and intolerances',
  marketing_email: 'BAYSE news and offers by email',
  celebrations: 'Birthday and anniversary messages',
  share_wellness_with_coach: 'Share wellness information with my coach',
  health_screening: 'Live class health check',
};

export default async function Privacy({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser('/you/privacy');
  const supabase = await createClient();
  const { data: consents } = await supabase.from('consent_records').select('purpose, granted, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
  const latest = new Map<string, boolean>();
  for (const c of consents ?? []) if (!latest.has(c.purpose)) latest.set(c.purpose, c.granted);
  const active = [...latest].filter(([, g]) => g).map(([p]) => p);

  return (
    <main className="page space-y-5">
      <Link href="/you" className="text-sm text-muted hover:text-ink">← You</Link>
      <h1 className="text-xl font-semibold">Privacy and your data</h1>
      {sp.withdrawn && <Notice tone="success">Done. The information covered by that permission has been deleted.</Notice>}
      <Card>
        <p className="eyebrow">Permissions you have given</p>
        {active.length ? (
          <ul className="mt-3 divide-y divide-stone">
            {active.map((p) => (
              <li key={p} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm">{LABEL[p] ?? p}</span>
                <form action={withdrawConsent}><input type="hidden" name="purpose" value={p} /><button className="text-sm text-clay hover:underline">Withdraw</button></form>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">You have not given any optional permissions.</p>}
        <p className="mt-3 text-xs text-muted">Withdrawing wellness or allergy permission deletes that information straight away.</p>
      </Card>
      <Card>
        <p className="eyebrow">Download your data</p>
        <p className="mt-2 text-sm text-muted">Everything BAYSE holds about you, as a file.</p>
        <a href="/api/me/export" className={`${buttonClass('secondary')} mt-3`}>Download my data</a>
      </Card>
      <Card>
        <p className="eyebrow">Delete account</p>
        <div className="mt-3"><DeleteAccountForm /></div>
      </Card>
    </main>
  );
}
