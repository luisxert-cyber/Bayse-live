import type { Metadata, Viewport } from 'next';
import { Archivo, DM_Sans } from 'next/font/google';
import './globals.css';

const display = Archivo({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display', display: 'swap' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body', display: 'swap' });


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
    { color: '#ffffff' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
