import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Right of access: a member downloads everything BAYSE holds about them, as JSON.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const { data, error } = await supabase.rpc('export_my_data');
  if (error) return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="bayse-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
