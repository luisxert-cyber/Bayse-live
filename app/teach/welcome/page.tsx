import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { input, btnSolid } from '@/lib/teach/format';
import { saveDetails } from './actions';

export const metadata = { title: 'Your details' };
export const dynamic = 'force-dynamic';

type Details = Record<string, string | boolean | null>;

// Instructor onboarding: the details BAYSE needs to contact and pay an instructor. Private to them and BAYSE admins.
export default async function Welcome({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { me, user } = await requireInstructor();
  if (!me) return null;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('instructor_details').select('*').eq('instructor_id', me.id).maybeSingle();
  const d = (data ?? {}) as Details;
  const v = (k: string) => (typeof d[k] === 'string' ? (d[k] as string) : '');
  const first = !data;
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{first ? 'Welcome to BAYSE. Let’s get you set up' : 'Your details'}</h1>
        <p className="mt-1 text-sm text-muted">{first ? 'Three steps: your details (this page), your instructor profile, then the times you can teach. ' : ''}These details are private. Only you and BAYSE admins can see them, and they are used to contact you and to pay you.</p>
      </div>
      {sp.ok && <Notice tone="success">Your details are saved.</Notice>}
      {sp.error && <Notice tone="error">{sp.error}</Notice>}
      <form action={saveDetails} className="space-y-6">
        <input type="hidden" name="first" value={first ? '1' : '0'} />
        <fieldset className="space-y-3 border border-stone p-4">
          <legend className="px-1 text-sm font-bold">About you</legend>
          <label className="grid gap-1 text-sm">Full legal name<input name="full_name" defaultValue={v('full_name')} required minLength={2} maxLength={120} autoComplete="name" className={input} /></label>
          <label className="grid gap-1 text-sm">Email<input value={user.email ?? ''} readOnly disabled className={`${input} text-muted`} /></label>
          <label className="grid gap-1 text-sm">Mobile number<input name="phone" type="tel" defaultValue={v('phone')} required minLength={7} maxLength={30} autoComplete="tel" className={input} /></label>
        </fieldset>
        <fieldset className="space-y-3 border border-stone p-4">
          <legend className="px-1 text-sm font-bold">Home address</legend>
          <label className="grid gap-1 text-sm">Address line 1<input name="address_line1" defaultValue={v('address_line1')} required maxLength={120} autoComplete="address-line1" className={input} /></label>
          <label className="grid gap-1 text-sm">Address line 2 (optional)<input name="address_line2" defaultValue={v('address_line2')} maxLength={120} autoComplete="address-line2" className={input} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Town or city<input name="city" defaultValue={v('city')} required maxLength={80} autoComplete="address-level2" className={input} /></label>
            <label className="grid gap-1 text-sm">Postcode<input name="postcode" defaultValue={v('postcode')} required maxLength={10} autoComplete="postal-code" className={input} /></label>
          </div>
        </fieldset>
        <fieldset className="space-y-3 border border-stone p-4">
          <legend className="px-1 text-sm font-bold">Bank details for pay</legend>
          <p className="text-xs text-muted">UK account. You are paid every 28 days for the live classes and 1-to-1s you teach.</p>
          <label className="grid gap-1 text-sm">Name on the account<input name="bank_account_name" defaultValue={v('bank_account_name')} required maxLength={120} className={input} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Sort code<input name="bank_sort_code" inputMode="numeric" defaultValue={v('bank_sort_code')} required placeholder="12-34-56" maxLength={8} className={input} /></label>
            <label className="grid gap-1 text-sm">Account number<input name="bank_account_number" inputMode="numeric" defaultValue={v('bank_account_number')} required placeholder="8 digits" maxLength={8} className={input} /></label>
          </div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="self_employed" defaultChecked={d.self_employed === true} className="mt-1" />I am self-employed and look after my own tax and National Insurance</label>
        </fieldset>
        <fieldset className="space-y-3 border border-stone p-4">
          <legend className="px-1 text-sm font-bold">Safety (optional, but helpful)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Emergency contact name<input name="emergency_name" defaultValue={v('emergency_name')} maxLength={120} className={input} /></label>
            <label className="grid gap-1 text-sm">Emergency contact number<input name="emergency_phone" type="tel" defaultValue={v('emergency_phone')} maxLength={30} className={input} /></label>
            <label className="grid gap-1 text-sm">Insurance provider<input name="insurance_provider" defaultValue={v('insurance_provider')} maxLength={120} className={input} /></label>
            <label className="grid gap-1 text-sm">Insurance valid until<input name="insurance_expires" type="date" defaultValue={v('insurance_expires')} className={input} /></label>
          </div>
        </fieldset>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" required className="mt-1" />These details are correct, and I am happy for BAYSE to use them to contact and pay me</label>
        <button className={btnSolid}>{first ? 'Save and continue to my profile' : 'Save my details'}</button>
      </form>
    </div>
  );
}
