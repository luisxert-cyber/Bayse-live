import Link from 'next/link';
import { buttonClass } from '@/components/ui';
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 text-xl font-semibold">We could not find that page</h1>
      <Link href="/" className={`${buttonClass('secondary')} mt-6`}>Go home</Link>
    </main>
  );
}
