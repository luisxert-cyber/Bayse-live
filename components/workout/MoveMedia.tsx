'use client';
// Shows a move: the real video clip when one has been uploaded for it, otherwise the illustrated
// instructor. Clips live in the public "move-clips" bucket, one file per move, named <move>.mp4.
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Figure } from './Figure';

export const CLIP_BUCKET = 'move-clips';
let cache: Promise<Map<string, string>> | null = null;

/** Every uploaded clip, as move key → public URL. Loaded once per page. */
export function loadClips(): Promise<Map<string, string>> {
  if (!cache) {
    cache = (async () => {
      const map = new Map<string, string>();
      try {
        const store = createClient().storage.from(CLIP_BUCKET);
        const { data, error } = await store.list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
        if (error || !data) return map;
        for (const f of data) {
          const m = /^([a-z0-9-]+)\.(mp4|webm)$/i.exec(f.name);
          if (m) map.set(m[1].toLowerCase(), `${store.getPublicUrl(f.name).data.publicUrl}?v=${encodeURIComponent(f.updated_at ?? '')}`);
        }
      } catch { /* drawings are the fallback */ }
      return map;
    })();
  }
  return cache;
}
export const resetClips = () => { cache = null; };

export function useClip(move: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void loadClips().then((m) => { if (live) setUrl(m.get(move) ?? null); });
    return () => { live = false; };
  }, [move]);
  return url;
}

export function MoveMedia({ move, playing = true, className = '' }: { move: string; playing?: boolean; className?: string }) {
  const url = useClip(move);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { setFailed(false); }, [url]);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {}); else v.pause();
  }, [playing, url]);
  if (url && !failed) {
    return (
      <video ref={ref} key={url} src={url} className={`aspect-[16/10] w-full object-cover ${className}`}
        loop muted playsInline autoPlay={playing} preload="auto" onError={() => setFailed(true)}
        aria-label="The BAYSE instructor demonstrating the exercise" />
    );
  }
  return <Figure move={move} playing={playing} className={className} />;
}
