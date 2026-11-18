import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createOffer, setActive } from './actions';

export const metadata = { title: 'Rewards' };
export const dynamic = 'force-dynamic';

const input = 'w-full border border-stone bg-bg px-3 py-2 text-sm';

export default async function Rewards() {
  await requireStaff('rewards');
  const supabase = await createClient();
  const [{ data: offers }, { data: claims }] = await Promise.all([
    supabase.from('reward_offers').select('*').order('created_at', { ascending: false }),
    supabase.from('reward_claims').select('offer_id'),
  ]);
  const count = (id: string) => (claims ?? []).filter((c) => c.offer_id === id).length;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">BAYSE Rewards</h1>
      <p className="max-w-[70ch] text-sm text-muted">Rewards unlock when a member finishes a number of classes. Every reward has a claim limit and an optional end date, so the cost is always capped. Codes are only shown to members who qualify. New rewards start switched off.</p>
      <ul className="space-y-3">
        {(offers ?? []).map((o) => (
          <li key={o.id} className="border border-stone p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{o.title}{o.partner ? <span className="font-normal text-muted"> · {o.partner}</span> : null}</p>
                <p className="mt-1 text-muted">{o.description}</p>
                <p className="mt-2 text-xs text-muted">Unlocks at {o.min_classes} classes · {count(o.id)} of {o.max_claims} claimed{o.ends_at ? ` · ends ${new Date(o.ends_at).toLocaleDateString('en-GB')}` : ''}{o.code ? ' · code set' : ' · no code'}</p>
              </div>
              <form action={setActive}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="active" value={o.active ? '0' : '1'} />
                <button className={`border px-3 py-1.5 text-xs font-bold uppercase ${o.active ? 'border-white bg-white text-black' : 'border-stone'}`}>{o.active ? 'Live · switch off' : 'Off · switch on'}</button></form>
            </div>
          </li>
        ))}
        {!(offers ?? []).length && <li className="border border-dashed border-stone p-6 text-center text-sm text-muted">No rewards yet.</li>}
      </ul>
      <form action={createOffer} className="space-y-3 border border-stone p-4">
        <p className="font-bold">New reward</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Title<input name="title" required minLength={2} maxLength={80} placeholder="10% off at Partner Café" className={input} /></label>
          <label className="grid gap-1 text-sm">Partner (optional)<input name="partner" maxLength={80} className={input} /></label>
        </div>
        <label className="grid gap-1 text-sm">What members get<textarea name="description" required minLength={2} maxLength={500} rows={2} className={input} /></label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">Unlocks at (classes)<input name="min_classes" type="number" min={1} max={1000} defaultValue={25} className={input} /></label>
          <label className="grid gap-1 text-sm">Claim limit<input name="max_claims" type="number" min={1} max={100000} defaultValue={50} className={input} /></label>
          <label className="grid gap-1 text-sm">Ends (optional)<input name="ends_at" type="date" className={input} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Code (optional)<input name="code" maxLength={80} className={input} /></label>
          <label className="grid gap-1 text-sm">How to use it (optional)<input name="how_to_use" maxLength={300} placeholder="Show this code at the till" className={input} /></label>
        </div>
        <button className="border border-ink px-5 py-2 text-sm font-bold uppercase">Save (starts switched off)</button>
      </form>
    </div>
  );
}
