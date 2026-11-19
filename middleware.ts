import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Refreshes the Supabase session cookie on every request and sends signed-out
// visitors away from member-only areas. Real permission checks happen in the
// database (RLS) and in each page's server code; this is only a convenience.
const MEMBER_PATHS = ['/today', '/train', '/live', '/community', '/you', '/teach', '/studio', '/admin'];

// A random id per browser, so a membership can be limited to a set number of devices.
// It identifies the device only, never the person, and is not used for tracking or ads.
const DEVICE_COOKIE = 'bayse_device';
// The id only counts as a device once the browser sends it back (see lib/devices.ts), so a browser that
// has not stored it yet, or several page requests arriving at once, can never be counted as extra devices.
const withDevice = (res: NextResponse, id: string | null, secure: boolean, domain?: string) => {
  if (id) res.cookies.set(DEVICE_COOKIE, id, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 400, ...(domain ? { domain } : {}) });
  return res;
};

// thebayseclub.com and www.thebayseclub.com are the same site, but a browser keeps their cookies apart
// unless the cookie names the shared domain. Without this, one iPad opened both ways counts as two devices.
// Only our own domain is shared: preview addresses (netlify.app) and localhost keep a host-only cookie.
function sharedDomain(host: string | null) {
  const h = (host ?? '').split(':')[0].toLowerCase().replace(/^www\./, '');
  return h === 'thebayseclub.com' ? h : undefined;
}

export async function middleware(request: NextRequest) {
  const newDevice = request.cookies.get(DEVICE_COOKIE)?.value ? null : crypto.randomUUID();
  // A "secure" cookie is thrown away by the browser on a plain http address, so only mark it secure on https.
  const secure = (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol).startsWith('https');
  const domain = sharedDomain(request.headers.get('host'));
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return withDevice(response, newDevice, secure, domain);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user && MEMBER_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
    const to = request.nextUrl.clone();
    to.pathname = '/sign-in';
    to.searchParams.set('next', path);
    return withDevice(NextResponse.redirect(to), newDevice, secure, domain);
  }
  return withDevice(response, newDevice, secure, domain);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
