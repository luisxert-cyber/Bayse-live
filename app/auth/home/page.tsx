import { redirect } from 'next/navigation';
import { getUser, getRoles } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Where an email sign-in link lands when it cannot say where to go: staff to their back end, members to Today.
export default async function AuthHome() {
  const user = await getUser().catch(() => null);
  if (!user) redirect('/sign-in');
  const roles = await getRoles();
  if (roles.some((r) => r.role === 'admin' || r.role === 'super_admin')) redirect('/admin');
  if (roles.some((r) => r.role === 'virtual_assistant')) redirect('/admin/members');
  if (roles.some((r) => r.role === 'instructor')) redirect('/teach');
  if (roles.some((r) => r.role === 'moderator')) redirect('/admin/reports');
  redirect('/today');
}
