'use server';
import { redirect } from 'next/navigation';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);
const fail = (m: string) => redirect(`/teach/welcome?error=${encodeURIComponent(m)}`);

// Saves an instructor's own contact and pay details. The database only lets them write their own row.
export async function saveDetails(f: FormData) {
  const { me } = await requireInstructor();
  if (!me) redirect('/teach');
  const sort = s(f, 'bank_sort_code', 12).replace(/[^0-9]/g, '');
  const account = s(f, 'bank_account_number', 12).replace(/[^0-9]/g, '');
  const postcode = s(f, 'postcode', 10).toUpperCase();
  const expires = s(f, 'insurance_expires', 10);
  const row = {
    instructor_id: me.id,
    full_name: s(f, 'full_name', 120),
    phone: s(f, 'phone', 30),
    address_line1: s(f, 'address_line1', 120),
    address_line2: s(f, 'address_line2', 120) || null,
    city: s(f, 'city', 80),
    postcode,
    bank_account_name: s(f, 'bank_account_name', 120),
    bank_sort_code: sort,
    bank_account_number: account,
    emergency_name: s(f, 'emergency_name', 120) || null,
    emergency_phone: s(f, 'emergency_phone', 30) || null,
    insurance_provider: s(f, 'insurance_provider', 120) || null,
    insurance_expires: /^\d{4}-\d{2}-\d{2}$/.test(expires) ? expires : null,
    self_employed: f.get('self_employed') === 'on',
    updated_at: new Date().toISOString(),
  };
  if (row.full_name.length < 2) fail('Add your full name.');
  if (row.phone.length < 7) fail('Add a mobile number.');
  if (row.address_line1.length < 2 || row.city.length < 2 || postcode.length < 4) fail('Add your full address and postcode.');
  if (row.bank_account_name.length < 2) fail('Add the name on your bank account.');
  if (sort.length !== 6) fail('Your sort code should be 6 digits.');
  if (account.length !== 8) fail('Your account number should be 8 digits.');
  if (f.get('confirm') !== 'on') fail('Tick the box to confirm your details are correct.');
  const supabase = await createClient();
  const { error } = await supabase.from('instructor_details').upsert(row);
  if (error) fail('That could not be saved. Check each field and try again.');
  redirect(f.get('first') === '1' ? '/teach/profile?welcome=1' : '/teach/welcome?ok=1');
}
