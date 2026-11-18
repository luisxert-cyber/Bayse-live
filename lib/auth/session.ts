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
  const user = await getUser();
  if (!user) redirect('/staff');
  const roles = await getRoles();
  if (!isAdminRole(roles)) redirect(isStaff(roles) ? '/admin/videos' : '/staff?denied=1');
  return { user, roles, isSuper: isSuperAdminRole(roles) };
}

/** Staff areas of the back end, and which roles can use each. Admins can use everything. */
export type StaffArea = 'overview' | 'members' | 'plans' | 'content' | 'reports' | 'rewards' | 'flags' | 'audit' | 'staff' | 'classes' | 'sessions' | 'pay';
const AREA_ROLES: Record<StaffArea, Role[]> = {
  overview: ['admin', 'super_admin'],
  members: ['admin', 'super_admin'],
  plans: ['admin', 'super_admin'],
  content: ['admin', 'super_admin', 'instructor'],
  reports: ['admin', 'super_admin', 'moderator'],
  rewards: ['admin', 'super_admin'],
  flags: ['admin', 'super_admin'],
  audit: ['admin', 'super_admin'],
  staff: ['admin', 'super_admin'],
  classes: ['admin', 'super_admin'],
  sessions: ['admin', 'super_admin'],
  pay: ['admin', 'super_admin'],
};
export const canUse = (roles: RoleRow[], area: StaffArea) => roles.some((r) => AREA_ROLES[area].includes(r.role));
export const isStaff = (roles: RoleRow[]) => roles.some((r) => ['admin', 'super_admin', 'instructor', 'moderator'].includes(r.role));

/** Page guard for the staff back end. Signed-out people go to the staff sign-in; members without a staff role are turned away. */
export async function requireStaff(area?: StaffArea) {
  const user = await getUser();
  if (!user) redirect('/staff');
  const roles = await getRoles();
  if (!isStaff(roles)) redirect('/staff?denied=1');
  if (area && !canUse(roles, area)) redirect(roles.some((r) => r.role === 'instructor') ? '/teach' : canUse(roles, 'reports') ? '/admin/reports' : '/staff?denied=1');
  return { user, roles, isAdmin: isAdminRole(roles), isSuper: isSuperAdminRole(roles) };
}

/** Page guard for the instructor portal (/teach). Admins can look in too. */
export async function requireInstructor() {
  const user = await getUser();
  if (!user) redirect('/staff');
  const supabase = await createClient();
  const [{ data: me }, roles] = await Promise.all([
    supabase.from('instructors').select('*').eq('user_id', user.id).maybeSingle(),
    getRoles(),
  ]);
  if (!me && !isAdminRole(roles)) redirect(isStaff(roles) ? '/admin' : '/staff?denied=1');
  return { user, roles, me, isAdmin: isAdminRole(roles) };
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
