import 'server-only';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/** A readable name for the device, from the browser's user agent (e.g. "iPhone · Safari"). */
export function deviceLabel(ua: string) {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Android phone' : 'Android tablet')
    : /Macintosh|Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows PC' : /CrOS/.test(ua) ? 'Chromebook' : /SmartTV|Tizen|Web0S|AppleTV/.test(ua) ? 'TV' : /Linux/.test(ua) ? 'Linux computer' : 'Device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${os} · ${browser}`;
}

export async function currentDevice() {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return { id: c.get('bayse_device')?.value ?? null, label: deviceLabel(h.get('user-agent') ?? '') };
}

/** Registers this device for the signed-in member. 'limit' means they are over their device allowance. */
export async function checkDevice(): Promise<'ok' | 'limit'> {
  const { id, label } = await currentDevice();
  if (!id) return 'ok';
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('register_device', { p_device: id, p_label: label });
  if (error) { console.error('[devices] register failed', error.message); return 'ok'; }
  return data === 'limit' ? 'limit' : 'ok';
}
