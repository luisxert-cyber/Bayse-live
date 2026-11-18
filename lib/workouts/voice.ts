'use client';
// Recorded voice cues from the "move-voice" bucket: <move>.mp3 (or .m4a/.wav) for each move,
// and shared phrases _start, _rest, _done. Loaded once per page.
import { createClient } from '@/lib/supabase/client';

export const VOICE_BUCKET = 'move-voice';
let cache: Promise<Map<string, string>> | null = null;

export function loadVoice(): Promise<Map<string, string>> {
  if (!cache) {
    cache = (async () => {
      const map = new Map<string, string>();
      try {
        const store = createClient().storage.from(VOICE_BUCKET);
        const { data } = await store.list('', { limit: 1000 });
        for (const f of data ?? []) {
          const m = /^([a-z0-9_-]+)\.(mp3|m4a|wav|aac)$/i.exec(f.name);
          if (m) map.set(m[1].toLowerCase(), `${store.getPublicUrl(f.name).data.publicUrl}?v=${encodeURIComponent(f.updated_at ?? '')}`);
        }
      } catch { /* built-in voice is the fallback */ }
      return map;
    })();
  }
  return cache;
}
export const resetVoice = () => { cache = null; };
