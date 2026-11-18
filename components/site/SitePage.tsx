import { hasAccount } from '@/lib/auth/account';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getUser } from '@/lib/auth/session';

/** Shell for a public website page: header, content, footer. */
export async function SitePage({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => null);
  return (
    <>
      <SiteHeader signedIn={hasAccount(user)} />
      <main className="pt-2">{children}</main>
      <SiteFooter />
    </>
  );
}
