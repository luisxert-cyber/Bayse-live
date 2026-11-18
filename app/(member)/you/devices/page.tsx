import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { currentDevice } from '@/lib/devices';
import { DeviceList } from '@/components/member/DeviceList';
import { signOutOthers } from '@/app/devices/actions';

export const metadata = { title: 'My devices' };
export const dynamic = 'force-dynamic';

export default async function MyDevices({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser('/you/devices');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: devices }, { data: settings }, me] = await Promise.all([
    supabase.from('user_devices').select('*').eq('user_id', user.id).order('last_seen', { ascending: false }),
    supabase.from('site_settings').select('max_devices').single(),
    currentDevice(),
  ]);
  return (
    <main className="page space-y-5">
      <p className="text-sm"><Link href="/you" className="text-muted">← You</Link></p>
      <div>
        <h1 className="text-2xl font-bold uppercase">My devices</h1>
        <p className="mt-1 text-muted">You can use BAYSE on up to {settings?.max_devices ?? 2} devices. Your membership is just for you, so please don’t share your login.</p>
      </div>
      {sp.removed && <Notice tone="success">Device removed.</Notice>}
      {sp.others && <Notice tone="success">Signed out everywhere else. Only this device is signed in now.</Notice>}
      <DeviceList devices={devices ?? []} thisDevice={me.id} back="/you/devices" />
      <form action={signOutOthers}><button className="inline-flex min-h-[48px] items-center border border-current px-5 text-sm font-bold uppercase">Sign out of all other devices</button></form>
      <p className="text-xs text-muted">See a device you don’t recognise? Sign out of the others and change your password with Forgot password on the sign-in page.</p>
    </main>
  );
}
