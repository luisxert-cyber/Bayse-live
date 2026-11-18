import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'instructor' | 'moderator' | 'studio_manager' | 'admin' | 'super_admin';
export type RoleRow = { role: Role; studio_id: string | null };

/** The signed-in user, verified with Supabase Auth (not just read from the cookie). */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(next = '/today') {
  const user = await getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

export async function getRoles(): Promise<RoleRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('user_roles').select('role, studio_id');
  return (data ?? []) as RoleRow[];
}

export const isAdminRole = (roles: RoleRow[]) => roles.some((r) => r.role === 'admin' || r.role === 'super_admin');
export const isSuperAdminRole = (roles: RoleRow[]) => roles.some((r) => r.role === 'super_admin');
export const managedStudios = (roles: RoleRow[]) =>
  roles.filter((r) => r.role === 'studio_manager' && r.studio_id).map((r) => r.studio_id as string);

/** Page guard for /admin. The database enforces the same rule on every query. */
export async function requireAdmin() {
  const user = await requireUser('/admin');
  const roles = await getRoles();
  if (!isAdminRole(roles)) redirect('/today?denied=admin');
  return { user, roles, isSuper: isSuperAdminRole(roles) };
}

/** Page guard for /studio. */
export async function requireStudioManager() {
  const user = await requireUser('/studio');
  const roles = await getRoles();
  const studios = managedStudios(roles);
  if (studios.length === 0 && !isAdminRole(roles)) redirect('/today?denied=studio');
  return { user, roles, studios, isAdmin: isAdminRole(roles) };
}

/** Where a safe internal redirect may go. Blocks //evil.com and absolute URLs. */
export function safeNext(next: string | null | undefined, fallback = '/today'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  return next;
}
