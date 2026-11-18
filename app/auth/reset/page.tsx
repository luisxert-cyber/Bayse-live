import { requireUser } from '@/lib/auth/session';
import { ResetForm } from '@/components/auth/ResetForm';

export const metadata = { title: 'Choose a new password' };

export default async function ResetPage() {
  await requireUser('/auth/reset');
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <p className="mb-6 mt-1 text-muted">At least 10 characters.</p>
      <ResetForm />
    </main>
  );
}
