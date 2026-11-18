import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Free challenge sign-ups' };
export const dynamic = 'force-dynamic';

type Lead = { id: string; email: string; first_name: string; marketing_ok: boolean; started_on: string; days_done: number[]; created_at: string };

export default async function Leads() {
  await requireStaff('members');
  const supabase = await createClient();
  const { data, count } = await supabase.from('challenge_leads').select('id, email, first_name, marketing_ok, started_on, days_done, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(500);
  const leads = (data ?? []) as Lead[];
  const finished = leads.filter((l) => l.days_done.length >= 7).length;
  const canEmail = leads.filter((l) => l.marketing_ok);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Free challenge sign-ups</h1>
      <p className="max-w-[70ch] text-sm text-muted">People who started the free 7-day Pilates challenge on the website. Only email BAYSE news and offers to people marked &ldquo;Yes&rdquo; under marketing: the others agreed to the challenge only.</p>
      <div className="grid gap-px border border-stone bg-stone sm:grid-cols-3">
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{count ?? leads.length}</p><p className="text-xs text-muted">Sign-ups</p></div>
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{finished}</p><p className="text-xs text-muted">Finished all 7 days</p></div>
        <div className="bg-bg p-4"><p className="text-2xl font-bold">{canEmail.length}</p><p className="text-xs text-muted">Said yes to BAYSE emails</p></div>
      </div>
      {canEmail.length > 0 && (
        <label className="grid gap-1 text-sm">Emails you can market to (copy and paste)
          <textarea readOnly rows={3} className="w-full border border-stone bg-bg px-3 py-2 text-xs" value={canEmail.map((l) => l.email).join(', ')} />
        </label>
      )}
      <div className="overflow-x-auto border border-stone">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-stone text-xs uppercase text-muted"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Started</th><th className="p-3">Days done</th><th className="p-3">Marketing</th></tr></thead>
          <tbody className="divide-y divide-stone">
            {leads.map((l) => (
              <tr key={l.id}><td className="p-3">{l.first_name}</td><td className="p-3">{l.email}</td><td className="p-3">{new Date(`${l.started_on}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</td><td className="p-3">{l.days_done.length} of 7</td><td className="p-3">{l.marketing_ok ? 'Yes' : 'No'}</td></tr>
            ))}
            {!leads.length && <tr><td colSpan={5} className="p-6 text-center text-muted">Nobody has started the free challenge yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
