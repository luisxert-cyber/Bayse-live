'use client';
// Shows a move: the real video clip when one has been uploaded for it, otherwise the illustrated
// instructor. Clips live in the public "move-clips" bucket, one file per move, named <move>.mp4.
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Figure } from './Figure';
import { previewClip } from '@/lib/workouts/preview-clips';

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

/** The clip to show for a move: an uploaded (filmed) clip first, else a temporary preview demo. */
export function useClip(move: string): { url: string; preview: boolean } | null {
  const fallback = previewClip(move);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setUrl(null);
    void loadClips().then((m) => { if (live) setUrl(m.get(move) ?? null); });
    return () => { live = false; };
  }, [move]);
  if (url) return { url, preview: false };
  return fallback ? { url: fallback, preview: true } : null;
}

export function MoveMedia({ move, playing = true, className = '' }: { move: string; playing?: boolean; className?: string }) {
  const clip = useClip(move);
  const [failed, setFailed] = useState<string | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {}); else v.pause();
  }, [playing, clip?.url]);
  if (clip && failed !== clip.url) {
    return (
      <div className="relative">
        <video ref={ref} key={clip.url} src={clip.url} className={`aspect-[16/10] w-full bg-black object-cover ${className}`}
          loop muted playsInline autoPlay={playing} preload="auto" onError={() => setFailed(clip.url)}
          aria-label="The BAYSE instructor demonstrating the exercise" />
        {clip.preview && <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Preview demo</span>}
      </div>
    );
  }
  return <Figure move={move} playing={playing} className={className} />;
}
