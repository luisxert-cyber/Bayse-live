'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const args = (f: FormData) => ({
  p_class: z.string().uuid().parse(f.get('class_id')),
  p_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(f.get('class_date')),
});
const fail = (message: string) => `/live?e=${encodeURIComponent(message.slice(0, 160))}`;

export async function bookClass(f: FormData) {
  await requireUser('/live');
  const supabase = await createClient();
  const { error } = await supabase.rpc('book_live_class', args(f));
  revalidatePath('/live');
  redirect(error ? fail(error.message) : '/live?ok=booked#bookings');
}

export async function cancelBooking(f: FormData) {
  await requireUser('/live');
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_live_booking', args(f));
  revalidatePath('/live');
  revalidatePath('/you');
  if (f.get('back') === '/you') redirect(error ? `/you?error=${encodeURIComponent(error.message.slice(0, 120))}` : '/you?cancelled=class');
  redirect(error ? fail(error.message) : '/live?ok=cancelled');
}

// Opens the Zoom room. The database only hands the link over from 15 minutes before the class.
export async function joinClass(f: FormData) {
  await requireUser('/live');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('join_live_class', args(f));
  if (error || typeof data !== 'string' || !/^https:\/\//.test(data)) redirect(fail(error?.message ?? 'The Zoom link for this class has not been set yet.'));
  redirect(data as string);
}
