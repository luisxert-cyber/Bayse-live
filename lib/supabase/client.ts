'use client';
import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/env';

/** Browser client. Only ever holds the public anon key; RLS protects every row. */
export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
