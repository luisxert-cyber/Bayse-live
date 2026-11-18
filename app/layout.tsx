import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TrialWindow, FrameBridge } from '@/components/site/TrialWindow';

// One family, like the studio brand: Inter for headings (bold, uppercase) and text.
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });


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
    { color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>{children}<TrialWindow /><FrameBridge /></body>
    </html>
  );
}
