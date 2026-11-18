import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Refreshes the Supabase session cookie on every request and sends signed-out
// visitors away from member-only areas. Real permission checks happen in the
// database (RLS) and in each page's server code; this is only a convenience.
const MEMBER_PATHS = ['/today', '/train', '/live', '/community', '/you', '/teach', '/studio', '/admin'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

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
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
