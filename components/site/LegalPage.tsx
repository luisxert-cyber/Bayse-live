import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Notice } from '@/components/ui';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
        <div className="mt-6"><Notice tone="warning" title="Draft for review">This is a working draft written for launch preparation. It must be reviewed by BAYSE and a qualified adviser before the platform opens to the public.</Notice></div>
        <div className="prose-bayse mt-8 space-y-4 text-[15px] leading-7 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
