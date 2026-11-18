import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { ROLE_LABEL, ukDate, input, btn, btnSolid } from '@/lib/teach/format';
import { inviteStaff, resendLink, removeRole, cancelInvite, setInstructorStatus } from './actions';

export const metadata = { title: 'Staff and instructors' };
export const dynamic = 'force-dynamic';

type Row = { user_id: string | null; email: string; name: string | null; roles: string[]; instructor_id: string | null; instructor_status: string | null; last_sign_in: string | null; invited: boolean };

const OK: Record<string, string> = {
  invited: 'Added. They have been emailed a sign-in link.',
  added_no_email: 'Added, but the email could not be sent just now (email limit). Use “Send link” in a minute.',
  resent: 'Sign-in link sent.',
  rate: 'Could not send right now. Emails are limited to a few per hour; try again shortly.',
  removed: 'Role removed.',
  cancelled: 'Invite cancelled.',
  published: 'Profile is live on the website.',
  hidden: 'Profile hidden from the website.',
};

export default async function Staff({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { isSuper } = await requireStaff('staff');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc('staff_list');
  const rows = (data ?? []) as Row[];
  const pending = rows.filter((r) => r.instructor_status === 'pending');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Staff and instructors</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Add staff by email. They get a sign-in link straight away and can set a password with “Forgot password”. Instructors get their own portal to manage classes, 1-to-1s, their profile and pay. Profiles only appear on the website after you approve them.</p>
      </div>
      {sp.ok && <Notice tone="success">{OK[sp.ok] ?? 'Saved.'}{sp.email ? ` (${sp.email})` : ''}</Notice>}
      {sp.error && <Notice tone="error">{sp.error === 'admin' ? 'Only the owner account can add admins.' : sp.error === 'invalid' ? 'Check the email and role.' : 'That was not allowed.'}</Notice>}

      <form action={inviteStaff} className="grid gap-3 border border-stone p-4 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" required placeholder="name@example.com" className={input} /></label>
        <label className="grid gap-1 text-sm">Role
          <select name="role" className={input} defaultValue="instructor">
            <option value="instructor">Instructor</option>
            <option value="moderator">Community moderator</option>
            {isSuper && <option value="admin">Admin</option>}
          </select>
        </label>
        <button className={btnSolid}>Add and send link</button>
      </form>

      {pending.length > 0 && (
        <section className="border border-white p-4">
          <p className="font-bold">Waiting for approval</p>
          <ul className="mt-2 space-y-2 text-sm">
            {pending.map((r) => (
              <li key={r.instructor_id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{r.name ?? r.email}</span>
                <span className="flex gap-2">
                  <Link href={`/admin/staff/${r.instructor_id}`} className={btn}>Review</Link>
                  <form action={setInstructorStatus}><input type="hidden" name="id" value={r.instructor_id!} /><input type="hidden" name="status" value="published" /><button className={btnSolid}>Approve and publish</button></form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="divide-y divide-stone border border-stone">
        {rows.map((r) => (
          <li key={`${r.email}-${r.invited}`} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
            <div className="min-w-0">
              <p className="font-bold">{r.name ?? r.email}</p>
              <p className="text-muted">{r.email}</p>
              <p className="mt-1 flex flex-wrap gap-1.5">
                {r.roles.map((role) => <span key={role} className="border border-stone px-2 py-0.5 text-xs">{ROLE_LABEL[role] ?? role}</span>)}
                {r.invited && <span className="border border-white px-2 py-0.5 text-xs">Invited · not signed in yet</span>}
                {r.instructor_status && <span className="px-2 py-0.5 text-xs text-muted">Profile: {r.instructor_status}</span>}
              </p>
              {!r.invited && <p className="mt-1 text-xs text-muted">{r.last_sign_in ? `Last signed in ${ukDate(r.last_sign_in)}` : 'Has not signed in yet'}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {r.instructor_id && <Link href={`/admin/staff/${r.instructor_id}`} className={btn}>Profile</Link>}
              <form action={resendLink}><input type="hidden" name="email" value={r.email} /><button className={btn}>Send link</button></form>
              {r.invited ? (
                <form action={cancelInvite}><input type="hidden" name="email" value={r.email} /><button className={btn}>Cancel invite</button></form>
              ) : r.roles.filter((x) => x !== 'admin' && x !== 'super_admin').map((role) => (
                <form key={role} action={removeRole}><input type="hidden" name="user_id" value={r.user_id!} /><input type="hidden" name="role" value={role} /><button className={btn}>Remove {ROLE_LABEL[role]?.toLowerCase()}</button></form>
              ))}
            </div>
          </li>
        ))}
        {!rows.length && <li className="p-6 text-center text-sm text-muted">No staff yet.</li>}
      </ul>
    </div>
  );
}
