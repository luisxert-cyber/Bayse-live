import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

// Montserrat matches the BAYSE logo and studio website. One family, several weights.
const sans = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-brand', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'BAYSE: your programme, your coach, your people', template: '%s · BAYSE' },
  description: 'Personalised Pilates programmes, live classes with real instructors, nutrition, coaching and a community of women, from BAYSE studios.',
  applicationName: 'BAYSE',
  robots: { index: false, follow: false }, // switched on at launch, with Luis's approval
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { color: '#0A0A0A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
