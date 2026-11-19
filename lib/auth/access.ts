import 'server-only';
import { createClient } from '@/lib/supabase/server';

/** True when the signed-in member's plan includes this part of BAYSE (for example 'programmes' or 'progress'). Checked in the database. */
export async function hasEntitlement(key: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc('has_entitlement', { k: key });
    return data === true;
  } catch {
    return false;
  }
}

/** True when the signed-in person has an account with on-demand access (paid, free trial or a BAYSE code). Checked in the database. */
export async function hasOnDemand(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return false;
    const { data } = await supabase.rpc('has_entitlement', { k: 'on_demand' });
    return data === true;
  } catch {
    return false;
  }
}
