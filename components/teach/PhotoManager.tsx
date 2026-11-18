'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { photoUrl } from '@/lib/teach/format';
import { savePhotos } from '@/app/teach/actions';

// Upload, reorder and remove instructor photos. Files go to the instructor's own folder (enforced by storage policies);
// the first photo is the main one on the website.
export function PhotoManager({ instructorId, photos: initial }: { instructorId: string; photos: string[] }) {
  const [photos, setPhotos] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const persist = (next: string[]) => start(async () => {
    const res = await savePhotos(instructorId, next);
    if (res?.error) setMsg(res.error); else { setPhotos(next); setMsg('Saved.'); }
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setMsg('Uploading…');
    const supabase = createClient();
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, 6 - photos.length)) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg('Use JPG, PNG or WebP photos.'); continue; }
      if (file.size > 5 * 1024 * 1024) { setMsg('Each photo must be under 5 MB.'); continue; }
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${instructorId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('instructor-photos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
      if (error) { setMsg('Upload failed. Please try again.'); continue; }
      added.push(path);
    }
    if (added.length) persist([...photos, ...added]);
  }

  const move = (i: number, d: number) => { const n = [...photos]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); persist(n); };
  const remove = async (i: number) => {
    const path = photos[i];
    persist(photos.filter((_, j) => j !== i));
    if (!path.startsWith('http')) await createClient().storage.from('instructor-photos').remove([path]);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {photos.map((p, i) => (
          <figure key={p} className="relative border border-stone">
            <img src={photoUrl(p)} alt="" className="aspect-[4/5] w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 bg-white px-1.5 text-[10px] font-bold uppercase text-black">Main</span>}
            <div className="flex justify-between bg-bg/90 text-xs">
              <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="px-2 py-1 disabled:opacity-30" aria-label="Move left">‹</button>
              <button type="button" disabled={busy} onClick={() => remove(i)} className="px-2 py-1">Remove</button>
              <button type="button" disabled={busy || i === photos.length - 1} onClick={() => move(i, 1)} className="px-2 py-1 disabled:opacity-30" aria-label="Move right">›</button>
            </div>
          </figure>
        ))}
        {photos.length < 6 && (
          <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center border border-dashed border-stone text-center text-xs text-muted hover:border-white">
            <span className="text-2xl">+</span>Add photos
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">Up to 6 photos, under 5 MB each. Portrait photos look best. The first one is used on the website.{msg ? ` · ${msg}` : ''}</p>
    </div>
  );
}
