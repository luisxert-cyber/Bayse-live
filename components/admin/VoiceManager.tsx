'use client';
// Admin: recorded voice cues. One short audio file per move, plus three shared phrases.
// Recorded cues play instead of the device's built-in voice.
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AVAILABLE } from '@/lib/workouts/catalog';
import { VOICE_BUCKET, loadVoice, resetVoice } from '@/lib/workouts/voice';

const SHARED: [string, string, string][] = [
  ['_start', 'Start of class', 'e.g. “Welcome. Let’s get started. Find your mat.”'],
  ['_rest', 'Rest', 'e.g. “Rest. Take a breath and get ready for the next move.”'],
  ['_done', 'End of class', 'e.g. “That’s it, well done. See you next time.”'],
];

export function VoiceManager() {
  const [have, setHave] = useState<Map<string, string>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const refresh = () => { resetVoice(); void loadVoice().then(setHave); };
  useEffect(() => { resetVoice(); void loadVoice().then(setHave); }, []);
  const moves = [...new Map(Object.values(AVAILABLE).map((e) => [e.move, e])).values()];
  const rows: [string, string, string][] = [...SHARED, ...moves.map((e) => [e.move, e.name, `${e.name}. ${e.cue}`] as [string, string, string])];

  async function upload(key: string, f: File) {
    if (f.size > 2 * 1024 * 1024) { setMsg('Please keep each recording under 2 MB.'); return; }
    const ext = (f.name.split('.').pop() || 'mp3').toLowerCase();
    if (!['mp3', 'm4a', 'wav', 'aac'].includes(ext)) { setMsg('Use MP3, M4A, AAC or WAV.'); return; }
    setBusy(key);
    const store = createClient().storage.from(VOICE_BUCKET);
    await store.remove(['mp3', 'm4a', 'wav', 'aac'].filter((x) => x !== ext).map((x) => `${key}.${x}`));
    const { error } = await store.upload(`${key}.${ext}`, f, { upsert: true, contentType: f.type || 'audio/mpeg' });
    setBusy(null); setMsg(error ? `Upload failed: ${error.message}` : `Saved the recording for ${key}.`); refresh();
  }
  async function remove(key: string) {
    setBusy(key);
    await createClient().storage.from(VOICE_BUCKET).remove(['mp3', 'm4a', 'wav', 'aac'].map((x) => `${key}.${x}`));
    setBusy(null); refresh();
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Voice cues</h2>
      <p className="max-w-[70ch] text-sm text-muted">Record each line on a phone (Voice Memos is fine), somewhere quiet, and upload it here. Recorded cues replace the phone&rsquo;s built-in voice in every class. {have.size} of {rows.length} recorded.</p>
      {msg && <p role="status" className="border border-stone px-3 py-2 text-sm">{msg}</p>}
      <ul className="divide-y divide-stone border-y border-stone">
        {rows.map(([key, label, script]) => (
          <li key={key} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{label} <span className="font-mono text-xs text-muted">{key}</span></p>
              <p className="text-muted">Say: {script}</p>
              {have.get(key) && <audio controls src={have.get(key)} className="mt-2 h-8 w-full max-w-xs" />}
            </div>
            <label className="cursor-pointer bg-ink px-3 py-1.5 text-xs font-bold uppercase text-bg">
              {busy === key ? 'Saving…' : have.has(key) ? 'Replace' : 'Upload'}
              <input type="file" accept="audio/*" className="sr-only" disabled={busy !== null} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(key, f); }} />
            </label>
            {have.has(key) && <button type="button" onClick={() => remove(key)} className="text-xs text-muted underline">Remove</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}
