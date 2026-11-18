import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice } from '@/components/ui';
import { setFlag } from '../actions';

export const metadata = { title: 'Feature flags' };
export const dynamic = 'force-dynamic';

export default async function Flags({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireStaff('flags');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('feature_flags').select('key, enabled, description').order('key');
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Feature flags</h1>
      {sp.ok && <Notice tone="success">Saved.</Notice>}
      {sp.error === 'confirm' && <Notice tone="warning" title="Confirmation needed">Type the flag name exactly to switch on {sp.key}. This affects real members or real money.</Notice>}
      {sp.error && sp.error !== 'confirm' && <Notice tone="error">Not allowed.</Notice>}
      <Card className="p-0">
        <ul className="divide-y divide-stone">
          {data?.map((f) => {
            const risky = ['live_billing', 'member_emails'].includes(f.key);
            return (
              <li key={f.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div><p className="font-mono text-sm">{f.key}</p><p className="text-sm text-muted">{f.description}</p></div>
                <form action={setFlag} className="flex items-center gap-2">
                  <input type="hidden" name="key" value={f.key} />
                  <input type="hidden" name="enabled" value={String(!f.enabled)} />
                  {risky && !f.enabled && <input name="confirm" placeholder={`type ${f.key}`} className="min-h-tap w-36 rounded-2xl border border-stone bg-surface px-3 text-xs" />}
                  <button className={`min-h-tap rounded-pill px-4 text-sm ${f.enabled ? 'bg-sage/20' : 'border border-stone'}`}>{f.enabled ? 'On · switch off' : 'Off · switch on'}</button>
                </form>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
