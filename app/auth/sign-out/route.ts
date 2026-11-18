import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/session';

// POST only, so a link or image on another site cannot sign members out.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const next = safeNext(request.nextUrl.searchParams.get('next'), '/');
  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
