'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const err = (e: { message: string } | null) => (e ? encodeURIComponent(e.message.slice(0, 120)) : '');

export async function closePayRun(f: FormData) {
  await requireStaff('pay');
  const start = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(f.get('period_start'));
  const supabase = await createClient();
  const { error } = await supabase.rpc('close_pay_run', { p_start: start });
  revalidatePath('/admin/pay');
  redirect(`/admin/pay?${error ? `error=${err(error)}` : 'ok=closed'}`);
}

export async function markPaid(f: FormData) {
  await requireStaff('pay');
  const supabase = await createClient();
  const { error } = await supabase.rpc('mark_pay_run_paid', { p_id: z.string().uuid().parse(f.get('id')) });
  revalidatePath('/admin/pay');
  redirect(`/admin/pay?${error ? `error=${err(error)}` : 'ok=paid'}`);
}

const pence = (v: FormDataEntryValue | null) => Math.round(Math.max(0, Number(String(v ?? '').replace(/[£,\s]/g, '')) || 0) * 100);
const int = (v: FormDataEntryValue | null, lo: number, hi: number, d: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

export async function saveSettings(f: FormData) {
  await requireStaff('pay');
  const supabase = await createClient();
  const { error } = await supabase.from('booking_settings').update({
    price_pence: pence(f.get('price')),
    member_price_pence: pence(f.get('member_price')),
    cancel_cutoff_hours: int(f.get('cancel_cutoff_hours'), 0, 168, 12),
    booking_notice_hours: int(f.get('booking_notice_hours'), 0, 168, 12),
    booking_window_days: int(f.get('booking_window_days'), 1, 180, 28),
    credit_valid_months: int(f.get('credit_valid_months'), 1, 12, 2),
    instructor_rate_pence: pence(f.get('instructor_rate')),
    ...(f.get('live_class_rate') != null ? { live_class_rate_pence: pence(f.get('live_class_rate')) } : {}),
    pay_late_cancellations: f.get('pay_late_cancellations') === 'on',
    pay_cycle_anchor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(f.get('pay_cycle_anchor')),
    updated_at: new Date().toISOString(),
  }).eq('id', true);
  revalidatePath('/admin/pay');
  redirect(`/admin/pay?${error ? `error=${err(error)}` : 'ok=settings'}`);
}
