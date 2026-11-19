import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { input, btn, btnSolid, ukDate } from '@/lib/teach/format';
import { createCodes, setCodeActive } from './actions';

export const metadata = { title: 'Studio member codes' };
export const dynamic = 'force-dynamic';

type Code = {
  id: string; code: string; tier: string; max_uses: number; uses: number; access_days: number;
  expires_at: string | null; note: string | null; active: boolean; created_at: string; studios: { name: string } | null;
};
const TIER: Record<string, string> = { studio_99: '£99', studio_148: '£148', other: 'Other' };

export default async function StudioCodes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { isAdmin } = await requireStaff('plans');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: studios }, { data: rows }] = await Promise.all([
    supabase.from('studios').select('id, name').eq('status', 'open').order('name'),
    supabase.from('studio_codes').select('id, code, tier, max_uses, uses, access_days, expires_at, note, active, created_at, studios(name)')
      .order('created_at', { ascending: false }).limit(500),
  ]);
  const codes = (rows ?? []) as unknown as Code[];
  const now = Date.now();
  const usable = (c: Code) => c.active && c.uses < c.max_uses && !(c.expires_at && new Date(c.expires_at).getTime() < now);
  const ready = codes.filter(usable);
  const used = codes.reduce((a, c) => a + c.uses, 0);
  const latest = sp.made ? codes.slice(0, Number(sp.made)) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Studio member codes</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Give a code to a studio member on a £99 or £148 membership. When they enter it under You → Membership, their studio membership is linked straight away: BAYSE Foundation (£19.99) is free and Inner Circle and Black are at the studio member price. No checking by hand.</p>
      </div>
      {sp.made && <Notice tone="success" title={`${sp.made} code${sp.made === '1' ? '' : 's'} made`}>Copy them from the box below and hand them out.</Notice>}
      {sp.saved && <Notice tone="success">Saved.</Notice>}
      {sp.error && <Notice tone="error">{sp.error === 'denied' ? 'Only admins can make or change codes.' : 'Please check the form and try again.'}</Notice>}

      {latest.length > 0 && (
        <section className="border border-white p-4">
          <p className="font-bold">Your new codes</p>
          <textarea readOnly rows={Math.min(10, latest.length + 1)} className={`${input} mt-2 font-mono`} defaultValue={latest.map((c) => c.code).join('\n')} />
          <p className="mt-1 text-xs text-muted">Select all and copy. They also stay in the list below.</p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-px border border-stone bg-stone">
        <div className="bg-bg p-4"><p className="text-xs uppercase tracking-[0.08em] text-muted">Codes ready to give</p><p className="mt-1 text-2xl font-bold">{ready.length}</p></div>
        <div className="bg-bg p-4"><p className="text-xs uppercase tracking-[0.08em] text-muted">Times used</p><p className="mt-1 text-2xl font-bold">{used}</p></div>
        <div className="bg-bg p-4"><p className="text-xs uppercase tracking-[0.08em] text-muted">All codes</p><p className="mt-1 text-2xl font-bold">{codes.length}</p></div>
      </div>

      {isAdmin && (
        <form action={createCodes} className="grid gap-3 border border-stone p-4 sm:grid-cols-2 lg:grid-cols-3">
          <p className="font-bold sm:col-span-2 lg:col-span-3">Make codes</p>
          <label className="grid gap-1 text-sm">Studio
            <select name="studio_id" required className={input}>{(studios ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm">Studio membership
            <select name="tier" className={input}><option value="studio_99">£99 membership</option><option value="studio_148">£148 membership</option></select>
          </label>
          <label className="grid gap-1 text-sm">How many codes
            <input name="count" type="number" min={1} max={200} defaultValue={10} className={input} />
          </label>
          <label className="grid gap-1 text-sm">People per code
            <input name="max_uses" type="number" min={1} max={1000} defaultValue={1} className={input} />
            <span className="text-xs text-muted">1 = one person each (safest). Higher = one shared code.</span>
          </label>
          <label className="grid gap-1 text-sm">Access lasts (days)
            <input name="access_days" type="number" min={7} max={730} defaultValue={365} className={input} />
            <span className="text-xs text-muted">After this the member shows as due a re-check in Studio member checks.</span>
          </label>
          <label className="grid gap-1 text-sm">Code must be used by (optional)
            <input name="expires" type="date" className={input} />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">Note (optional)
            <input name="note" maxLength={120} placeholder="e.g. January welcome pack" className={input} />
          </label>
          <div className="flex items-end"><button className={btnSolid}>Make codes</button></div>
        </form>
      )}

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">All codes</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border border-stone text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="p-2 font-normal">Code</th><th className="font-normal">Studio</th><th className="font-normal">Used</th><th className="font-normal">Use by</th><th className="font-normal">Note</th><th className="p-2 font-normal" /></tr></thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className={`border-t border-stone ${usable(c) ? '' : 'text-muted'}`}>
                  <td className="p-2 font-mono">{c.code}</td>
                  <td>{c.studios?.name?.replace('BAYSE ', '') ?? '—'} · {TIER[c.tier] ?? c.tier}</td>
                  <td>{c.uses} of {c.max_uses}</td>
                  <td>{c.expires_at ? ukDate(c.expires_at) : 'No limit'}</td>
                  <td className="max-w-[200px] truncate">{c.note ?? ''}</td>
                  <td className="p-2 text-right">
                    {isAdmin && (
                      <form action={setCodeActive}>
                        <input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(!c.active)} />
                        <button className={btn}>{c.active ? 'Switch off' : 'Switch on'}</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {!codes.length && <tr><td colSpan={6} className="p-3 text-muted">No codes yet. Make your first batch above.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Who used a code shows in <Link href="/admin/studio-links" className="underline">Studio member checks</Link> (their link says “Code …”). Ending a link there stops their free access as usual.</p>
      </section>
    </div>
  );
}
