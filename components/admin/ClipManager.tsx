'use client';
// Admin: which moves have a video clip, upload or replace one, and a shot list to film from.
// Uploads go straight to the "move-clips" bucket; storage policies only allow BAYSE admins.
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EXERCISES } from '@/lib/workouts/catalog';
import { FigureStill } from '@/components/workout/Figure';
import { CLIP_BUCKET, loadClips, resetClips } from '@/components/workout/MoveMedia';
import { previewClip } from '@/lib/workouts/preview-clips';

type Row = { move: string; name: string; cue: string };

const ROWS: Row[] = (() => {
  const seen = new Map<string, Row>();
  for (const e of Object.values(EXERCISES)) if (!seen.has(e.move)) seen.set(e.move, { move: e.move, name: e.name, cue: e.cue });
  if (!seen.has('childs')) seen.set('childs', { move: 'childs', name: "Child's pose (rest)", cue: 'Shown during rests.' });
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

export function ClipManager() {
  const [clips, setClips] = useState<Map<string, string>>(new Map());
  const [q, setQ] = useState('');
  const [only, setOnly] = useState<'all' | 'missing' | 'done'>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const refresh = () => { resetClips(); void loadClips().then(setClips); };
  useEffect(() => { resetClips(); void loadClips().then(setClips); }, []);

  const shown = useMemo(() => ROWS.filter((r) =>
    (!q || `${r.name} ${r.move}`.toLowerCase().includes(q.toLowerCase())) &&
    (only === 'all' || (only === 'done') === clips.has(r.move))), [q, only, clips]);

  async function upload(move: string, file: File) {
    setMsg(null);
    const ext = /webm$/i.test(file.type) ? 'webm' : 'mp4';
    if (!/^video\/(mp4|webm)$/.test(file.type)) { setMsg('Please choose an MP4 or WebM video.'); return; }
    if (file.size > 8 * 1024 * 1024) { setMsg('That file is over 8 MB. Export it smaller and try again.'); return; }
    setBusy(move);
    const store = createClient().storage.from(CLIP_BUCKET);
    const other = ext === 'mp4' ? 'webm' : 'mp4';
    const { error } = await store.upload(`${move}.${ext}`, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
    if (!error) await store.remove([`${move}.${other}`]);
    setBusy(null);
    setMsg(error ? `Upload failed: ${error.message}` : `Uploaded the clip for ${move}.`);
    refresh();
  }

  async function remove(move: string) {
    setBusy(move);
    const { error } = await createClient().storage.from(CLIP_BUCKET).remove([`${move}.mp4`, `${move}.webm`]);
    setBusy(null);
    setMsg(error ? `Could not remove: ${error.message}` : `Removed the clip for ${move}. The drawing is back.`);
    refresh();
  }

  const shotList = ROWS.map((r) => `${r.move}.mp4\t${r.name}\t${r.cue}`).join('\n');
  const copy = async () => {
    try { await navigator.clipboard.writeText(`File name\tMove\tCue\n${shotList}`); setMsg('Shot list copied. Paste it into a spreadsheet.'); }
    catch { setMsg('Could not copy automatically. Select the list under "Shot list" instead.'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-semibold">{clips.size} of {ROWS.length} moves have a video</p>
        <button type="button" onClick={copy} className="rounded-full border border-stone px-4 py-2 text-sm hover:border-ink">Copy shot list</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search moves" aria-label="Search moves"
          className="min-h-[40px] rounded-[10px] border border-stone bg-surface px-3 text-sm" />
        {(['all', 'missing', 'done'] as const).map((o) => (
          <button key={o} type="button" aria-pressed={only === o} onClick={() => setOnly(o)}
            className="rounded-full border border-stone px-3 py-1.5 text-sm aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg">
            {o === 'all' ? 'All' : o === 'missing' ? 'Needs a video' : 'Has a video'}
          </button>
        ))}
      </div>
      {msg && <p role="status" className="rounded-xl bg-surface px-3 py-2 text-sm">{msg}</p>}
      <ul className="grid gap-2 md:grid-cols-2">
        {shown.map((r) => {
          const url = clips.get(r.move);
          return (
            <li key={r.move} className="flex items-center gap-3 rounded-2xl border border-stone bg-surface p-2">
              <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-bg">
                {url ? <video src={url} muted loop playsInline autoPlay className="aspect-[16/10] w-full object-cover" /> : <FigureStill move={r.move} t={0.7} className="block w-full" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate font-mono text-xs text-muted">{r.move}.mp4</p>
                <p className="text-xs">{url ? 'Filmed video live' : previewClip(r.move) ? 'Preview demo (replace with filmed clip)' : 'Drawing'}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <label className="cursor-pointer rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-bg">
                  {busy === r.move ? 'Working…' : url ? 'Replace' : 'Upload'}
                  <input type="file" accept="video/mp4,video/webm" className="sr-only" disabled={busy !== null}
                    onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(r.move, f); }} />
                </label>
                {url && <button type="button" onClick={() => remove(r.move)} disabled={busy !== null} className="text-xs text-muted underline">Remove</button>}
              </div>
            </li>
          );
        })}
      </ul>
      <details className="rounded-2xl border border-stone p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Shot list ({ROWS.length} moves)</summary>
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-xs">{shotList}</pre>
      </details>
    </div>
  );
}
