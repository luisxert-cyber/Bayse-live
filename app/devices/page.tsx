import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Wordmark, Notice } from '@/components/ui';
import { currentDevice } from '@/lib/devices';
import { DeviceList } from '@/components/member/DeviceList';
import { continueHere } from './actions';

export const metadata = { title: 'Too many devices' };
export const dynamic = 'force-dynamic';

// Shown when a member opens BAYSE on one device more than their membership allows.
export default async function Devices({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser('/devices');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: devices }, { data: settings }, me] = await Promise.all([
    supabase.from('user_devices').select('*').eq('user_id', user.id).order('last_seen', { ascending: false }),
    supabase.from('site_settings').select('max_devices').single(),
    currentDevice(),
  ]);
  const max = settings?.max_devices ?? 2;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-4 py-10">
      <Wordmark className="h-7" />
      <div>
        <h1 className="text-[28px] leading-tight">You’re using BAYSE on {max} devices already</h1>
        <p className="mt-2 text-muted">A membership can be used on up to {max} devices, such as your phone and a laptop. To use BAYSE on this {me.label.split(' · ')[0].toLowerCase()}, remove one of these first.</p>
      </div>
      {sp.removed && <Notice tone="success">Device removed.</Notice>}
      {sp.still && <Notice tone="warning">You are still at the limit. Remove a device first.</Notice>}
      <DeviceList devices={devices ?? []} thisDevice={me.id} back="/devices" />
      <form action={continueHere}><button className="inline-flex min-h-[52px] w-full items-center justify-center bg-white px-6 font-bold uppercase text-black">Use BAYSE on this device</button></form>
      <p className="text-xs text-muted">Memberships are for one person. Devices you have not used for 30 days are removed automatically. Not you? Change your password from Forgot password on the sign-in page.</p>
      <form action="/auth/sign-out" method="post"><button className="w-full py-2 text-sm text-muted underline">Sign out</button></form>
    </main>
  );
}
