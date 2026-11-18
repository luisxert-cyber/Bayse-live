import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Before any class or booking: members must have a current health check and agreement. */
export async function requireHealthCheck(next: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc('has_health_declaration');
  if (!data) redirect(`/you/health?next=${encodeURIComponent(next)}`);
}
