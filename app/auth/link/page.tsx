import { Suspense } from 'react';
import { LinkSignIn } from '@/components/auth/LinkSignIn';

export const metadata = { title: 'Signing you in' };

export default function LinkPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <Suspense><LinkSignIn /></Suspense>
    </main>
  );
}
