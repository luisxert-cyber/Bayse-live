import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { HealthForm } from '@/components/health/HealthForm';
import { saveHealthMember } from '@/lib/health/actions';

export const metadata = { title: 'Health check' };
export const dynamic = 'force-dynamic';

export default async function Health({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser('/you/health');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: last }, { data: profile }] = await Promise.all([
    supabase.from('health_declarations').select('created_at, expires_at, any_yes').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('profiles').select('first_name').eq('id', user.id).maybeSingle(),
  ]);
  const current = last && new Date(last.expires_at) > new Date();
  const d = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <main className="page space-y-5">
      <p className="text-sm"><Link href="/you" className="text-muted">← You</Link></p>
      <div>
        <h1 className="text-2xl font-bold uppercase">Health check</h1>
        <p className="mt-1 text-muted">{sp.next ? 'Before your first class, please answer a few health questions and agree to our safety terms. It takes about a minute.' : 'Keep this up to date if anything about your health changes, such as an injury, a new condition or a pregnancy.'}</p>
      </div>
      {sp.saved && <Notice tone="success">Thank you. Your health check is saved.</Notice>}
      {current && !sp.next && <Notice tone="info">Last confirmed {d(last.created_at)}. Valid until {d(last.expires_at)}.{last.any_yes ? ' You told us about a health condition, so please keep following your doctor’s advice.' : ''}</Notice>}
      {last && !current && <Notice tone="warning">Your health check has expired. Please confirm it again.</Notice>}
      <HealthForm action={saveHealthMember} next={sp.next} defaultName={profile?.first_name ?? undefined} />
    </main>
  );
}
