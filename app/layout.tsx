import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TrialWindow, FrameBridge } from '@/components/site/TrialWindow';
import { SITE, GOOGLE_SITE_VERIFICATION } from '@/lib/site/seo';

// One family, like the studio brand: Inter for headings (bold, uppercase) and text.
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });


export const metadata: Metadata = {
  title: { default: 'The BAYSE Club · Pilates, nutrition & personal coaching for women', template: '%s · The BAYSE Club' },
  description: 'Online Pilates for women from the BAYSE studio team: live and on-demand classes, a workout builder, your personal plan, nutrition, 1-to-1 coaching and a community. Try it free for 7 days.',
  applicationName: 'The BAYSE Club',
  // Home-screen app: icon, name and full-screen display on iPhone (Android uses app/manifest.ts).
  appleWebApp: { capable: true, title: 'BAYSE', statusBarStyle: 'black-translucent' },
  icons: { icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }], apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }] },
  // Search engines switched on 20 Nov 2026, on Luis's instruction. Private areas are kept out in
  // app/robots.ts and by an X-Robots-Tag header (next.config.ts).
  metadataBase: new URL(SITE),
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  alternates: { canonical: './' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  keywords: ['online Pilates', 'Pilates classes online', 'Pilates for women', 'live Pilates classes', 'on-demand Pilates', 'Pilates at home', 'reformer Pilates at home', 'Pilates app UK', 'Pilates nutrition', 'online Pilates coaching', 'BAYSE'],
  openGraph: {
    type: 'website', siteName: 'The BAYSE Club', locale: 'en_GB', url: SITE,
    title: 'The BAYSE Club · Pilates, nutrition & personal coaching for women',
    description: 'Live and on-demand Pilates classes, a workout builder, nutrition, progress and your own coach, from the BAYSE studio team. 7 days free.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'The BAYSE Club: Pilates, nutrition and personal coaching for women' }],
  },
  twitter: { card: 'summary_large_image', title: 'The BAYSE Club · Pilates, nutrition & personal coaching for women', description: 'Live and on-demand Pilates classes for women, from the BAYSE studio team. 7 days free.', images: ['/og.jpg'] },
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
