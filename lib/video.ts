// Filmed classes: where to play them from. Uploaded files are private (signed links); outside links are embedded.
import { publicEnv } from '@/lib/env';

export const VIDEO_STYLES: Record<string, string> = { mat: 'Mat Pilates', sculpt: 'Sculpt', stretch: 'Stretch and mobility', prenatal: 'Pre and postnatal', beginner: 'Beginners', reformer: 'Reformer' };
export const coverUrl = (p: string | null) => (p ? `${publicEnv.supabaseUrl}/storage/v1/object/public/class-covers/${p}` : null);

/** YouTube / Vimeo links become embed URLs; anything else plays in a normal video player. */
export function embedFor(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?rel=0`;
    if (host.endsWith('youtube.com')) { const id = u.searchParams.get('v') ?? u.pathname.split('/').pop(); return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null; }
    if (host === 'vimeo.com') { const id = u.pathname.split('/').filter(Boolean)[0]; return id ? `https://player.vimeo.com/video/${id}` : null; }
    if (host === 'player.vimeo.com') return url;
    return null;
  } catch { return null; }
}
