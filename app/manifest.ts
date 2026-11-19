import type { MetadataRoute } from 'next';

// Lets members add The BAYSE Club to their phone's home screen, where it opens full screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The BAYSE Club',
    short_name: 'BAYSE',
    description: 'Pilates, nutrition & personal coaching for women.',
    id: '/today',
    start_url: '/today',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'en-GB',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Today', url: '/today' },
      { name: 'Live classes', url: '/live' },
      { name: 'Build my workout', url: '/train/build' },
    ],
  };
}
