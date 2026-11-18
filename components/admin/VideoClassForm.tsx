'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { publicEnv } from '@/lib/env';
import { VIDEO_STYLES, coverUrl } from '@/lib/video';
import { saveVideoClass } from '@/app/admin/on-demand/actions';

type V = { id?: string; title?: string; description?: string | null; style?: string; level?: string; minutes?: number; equipment?: string[]; instructor_id?: string | null; video_path?: string | null; video_url?: string | null; cover_path?: string | null; free?: boolean; status?: string; sort?: number };
const input = 'w-full border border-stone bg-bg px-3 py-2 text-sm';
const EQUIPMENT = ['Mat', 'Light weights', 'Resistance band', 'Pilates ball', 'Ankle weights', 'Reformer'];

// Upload with a progress bar (straight to private storage), then save the class details.
function uploadWithProgress(bucket: string, path: string, file: File, token: string, onProgress: (n: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${publicEnv.supabaseUrl}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', publicEnv.supabaseAnonKey);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(xhr.status === 413 ? 'too_large' : `upload_${xhr.status}`)));
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(file);
  });
}

export function VideoClassForm({ v = {}, instructors, isAdmin }: { v?: V; instructors: { id: string; display_name: string }[]; isAdmin: boolean }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [source, setSource] = useState<'file' | 'link'>(v.video_url ? 'link' : 'file');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('signin');
      const video = form.get('video_file') as File | null;
      if (source === 'file' && video && video.size > 0) {
        const ext = video.type === 'video/quicktime' ? 'mov' : video.type === 'video/webm' ? 'webm' : 'mp4';
        const path = `${crypto.randomUUID()}.${ext}`;
        setProgress(0);
        await uploadWithProgress('class-videos', path, video, session.access_token, setProgress);
        form.set('video_path', path);
      }
      const cover = form.get('cover_file') as File | null;
      if (cover && cover.size > 0) {
        const path = `${crypto.randomUUID()}.${cover.type === 'image/png' ? 'png' : cover.type === 'image/webp' ? 'webp' : 'jpg'}`;
        const { error } = await supabase.storage.from('class-covers').upload(path, cover, { contentType: cover.type, cacheControl: '31536000' });
        if (error) throw new Error('cover');
        form.set('cover_path', path);
      }
      form.delete('video_file'); form.delete('cover_file');
      if (source === 'link') form.set('video_path', ''); else form.set('video_url', '');
      const res = await saveVideoClass(form);
      if (res?.error) setMsg(res.error); else window.location.href = '/admin/on-demand?ok=saved';
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      setMsg(m === 'too_large' ? 'That video is bigger than your storage plan allows for one file. Compress it (1080p, H.264 MP4) or paste a Vimeo/YouTube link instead.' : m === 'cover' ? 'The cover image could not be uploaded (JPG, PNG or WebP under 5 MB).' : 'Upload failed. Check your connection and try again.');
    } finally { setBusy(false); setProgress(null); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-stone p-4">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="video_path" defaultValue={v.video_path ?? ''} />
      <input type="hidden" name="cover_path" defaultValue={v.cover_path ?? ''} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Class name<input name="title" required minLength={2} maxLength={80} defaultValue={v.title} placeholder="Full Body Sculpt" className={input} /></label>
        <label className="grid gap-1 text-sm">Instructor
          <select name="instructor_id" defaultValue={v.instructor_id ?? ''} className={input}><option value="">BAYSE team</option>{instructors.map((i) => <option key={i.id} value={i.id}>{i.display_name}</option>)}</select>
        </label>
      </div>
      <label className="grid gap-1 text-sm">What it is (shown to members)<textarea name="description" rows={3} maxLength={800} defaultValue={v.description ?? ''} className={input} /></label>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="grid gap-1 text-sm">Style<select name="style" defaultValue={v.style ?? 'mat'} className={input}>{Object.entries(VIDEO_STYLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Level<select name="level" defaultValue={v.level ?? 'Steady'} className={input}>{['Gentle', 'Steady', 'Strong'].map((l) => <option key={l}>{l}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Length (minutes)<input name="minutes" type="number" min={1} max={180} required defaultValue={v.minutes ?? 30} className={input} /></label>
        <label className="grid gap-1 text-sm">Order<input name="sort" type="number" min={0} max={999} defaultValue={v.sort ?? 100} className={input} /></label>
      </div>
      <fieldset className="text-sm"><legend className="mb-1">Kit needed</legend>
        <div className="flex flex-wrap gap-2">{EQUIPMENT.map((x) => <label key={x} className="flex items-center gap-1.5 border border-stone px-2 py-1"><input type="checkbox" name="equipment" value={x} defaultChecked={v.equipment?.includes(x)} />{x}</label>)}</div>
      </fieldset>
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1">Video</legend>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSource('file')} className={`border px-3 py-1.5 text-xs font-bold uppercase ${source === 'file' ? 'border-white bg-white text-black' : 'border-stone'}`}>Upload a file</button>
          <button type="button" onClick={() => setSource('link')} className={`border px-3 py-1.5 text-xs font-bold uppercase ${source === 'link' ? 'border-white bg-white text-black' : 'border-stone'}`}>Vimeo / YouTube link</button>
        </div>
        {source === 'file' ? (
          <label className="grid gap-1">{v.video_path ? <span className="text-xs text-muted">A video is uploaded. Choose a file only to replace it.</span> : null}
            <input name="video_file" type="file" accept="video/mp4,video/quicktime,video/webm" required={!v.video_path} className="text-sm" />
            <span className="text-xs text-muted">MP4 (H.264, 1080p) plays everywhere. Large files can take a while; keep this page open.</span>
          </label>
        ) : (
          <input name="video_url" type="url" defaultValue={v.video_url ?? ''} required placeholder="https://vimeo.com/123456789" className={input} />
        )}
      </fieldset>
      <label className="grid gap-1 text-sm">Cover image{v.cover_path && <img src={coverUrl(v.cover_path)!} alt="" className="h-24 w-40 border border-stone object-cover" />}
        <input name="cover_file" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" /></label>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="free" defaultChecked={v.free} />Free class (anyone signed in can watch)</label>
        {isAdmin && <label className="flex items-center gap-2">Status
          <select name="status" defaultValue={v.status ?? 'draft'} className={`${input} w-auto`}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>}
      </div>
      {progress !== null && <div className="h-2 w-full bg-stone"><div className="h-2 bg-white transition-all" style={{ width: `${progress}%` }} /></div>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <button disabled={busy} className="inline-flex min-h-[44px] items-center bg-white px-6 text-sm font-bold uppercase text-black disabled:opacity-50">{busy ? (progress !== null ? `Uploading ${progress}%…` : 'Saving…') : v.id ? 'Save changes' : 'Upload class'}</button>
    </form>
  );
}
