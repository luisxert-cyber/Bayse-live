'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';
import { checkDevice, currentDevice } from '@/lib/devices';

const back = (f: FormData) => (f.get('back') === '/you/devices' ? '/you/devices' : '/devices');

export async function removeDevice(f: FormData) {
  await requireUser('/devices');
  const supabase = await createClient();
  await supabase.from('user_devices').delete().eq('id', z.string().uuid().parse(f.get('id')));
  revalidatePath('/you/devices');
  redirect(`${back(f)}?removed=1`);
}

export async function continueHere() {
  await requireUser('/devices');
  redirect((await checkDevice()) === 'ok' ? '/today' : '/devices?still=1');
}

// Signs out every other browser and forgets the other devices, so only this one stays signed in.
export async function signOutOthers() {
  const user = await requireUser('/you/devices');
  const supabase = await createClient();
  const { id } = await currentDevice();
  await supabase.auth.signOut({ scope: 'others' });
  if (id) await supabase.from('user_devices').delete().eq('user_id', user.id).neq('device_id', id);
  revalidatePath('/you/devices');
  redirect('/you/devices?others=1');
}
