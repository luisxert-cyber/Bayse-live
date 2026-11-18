import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TrialWindow, FrameBridge } from '@/components/site/TrialWindow';

// One family, like the studio brand: Inter for headings (bold, uppercase) and text.
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });


export const metadata: Metadata = {
  title: { default: 'The BAYSE Club · Pilates, nutrition & personal coaching for women', template: '%s · The BAYSE Club' },
  description: 'The BAYSE Club: Pilates, nutrition & personal coaching for women. Your plan, live and on-demand classes, recipes, 1-to-1s and a community, from the BAYSE studio team.',
  applicationName: 'The BAYSE Club',
  robots: { index: false, follow: false }, // switched on at launch, with Luis's approval
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { color: '#000000' },
  ],
};

// Email links can land on any page (Supabase falls back to the site's home page). If the address carries
// sign-in tokens, hand them to /auth/link before anything else runs, so a password reset reaches the reset page.
const AUTH_LANDING = `(function(){try{var h=location.hash;if(!h||location.pathname==='/auth/link'||!/access_token=|error_code=/.test(h))return;var n=/type=recovery/.test(h)?'/auth/reset':'/auth/home';location.replace('/auth/link?next='+encodeURIComponent(n)+h);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <head><script dangerouslySetInnerHTML={{ __html: AUTH_LANDING }} /></head>
      <body>{children}<TrialWindow /><FrameBridge /></body>
    </html>
  );
}
