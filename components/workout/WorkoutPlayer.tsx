'use client';
// Interactive timer workout: illustrated instructor, countdown ring, rest breaks, next up,
// optional voice cues (speech synthesis) and beeps for the last three seconds.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MoveMedia } from './MoveMedia';
import { loadVoice } from '@/lib/workouts/voice';
import { EXERCISES, workoutMinutes, type Workout } from '@/lib/workouts/catalog';
import { buttonClass } from '@/components/ui';

// `cue` and `easier` are set when the class has its own wording for a move (for example in pregnancy).
type Step = { kind: 'work' | 'rest'; ex: string; seconds: number; cue?: string; easier?: string };

function beep(ctx: AudioContext | null, high = false) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = high ? 880 : 520; g.gain.value = 0.08;
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + (high ? 0.35 : 0.12));
}
// Prefer the most natural-sounding voice the device has: neural/"Natural" (Edge, Windows), Premium/Enhanced
// (iPhone, Mac, when downloaded), Google's online voices (Chrome), then any British woman's voice.
const FEMALE = /(female|woman|serena|kate|stephanie|martha|sonia|libby|maisie|hazel|susan|fiona|moira|tessa|karen|samantha|victoria|allison|ava|zira|amy|emma|olivia|jenny|aria|ava)/i;
const MALE = /(\bmale\b|daniel|arthur|oliver|george|ryan|thomas|alex|fred|rishi|aaron|guy|david|mark|james|liam)/i;
const QUALITY = (n: string) => (/natural|neural/i.test(n) ? 6 : /premium/i.test(n) ? 5 : /enhanced/i.test(n) ? 4 : /google/i.test(n) ? 3 : /siri/i.test(n) ? 3 : 0);
let chosen: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (chosen !== undefined && chosen !== null) return chosen;
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null;
  const score = (v: SpeechSynthesisVoice) =>
    (/^en/i.test(v.lang) ? 100 : -1000) + (/en[-_]GB/i.test(v.lang) ? 20 : /en[-_](IE|AU)/i.test(v.lang) ? 8 : 0)
    + QUALITY(v.name) * 10 + (FEMALE.test(v.name) ? 15 : 0) - (MALE.test(v.name.replace(/female/i, '')) ? 60 : 0) + (v.localService ? 0 : 2);
  chosen = [...vs].sort((x, y) => score(y) - score(x))[0] ?? null;
  return chosen;
}
let rec: HTMLAudioElement | null = null;
/** Play a recorded cue if there is one; returns false so the caller can fall back to the built-in voice. */
function playRecorded(urls: Map<string, string>, keys: string[], on: boolean): boolean {
  if (!on) return false;
  const list = keys.map((k) => urls.get(k)).filter(Boolean) as string[];
  if (!list.length) return false;
  try {
    window.speechSynthesis?.cancel();
    rec?.pause();
    let n = 0;
    const next = () => { if (n >= list.length) return; rec = new Audio(list[n++]); rec.onended = next; void rec.play().catch(() => {}); };
    next();
    return true;
  } catch { return false; }
}
function stopRecorded() { try { rec?.pause(); } catch { /* ignore */ } }

function say(text: string, on: boolean) {
  if (!on || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch { /* voice is optional */ }
}

export function WorkoutPlayer({ workout, onComplete, exitHref, onExit }: { workout: Workout; onComplete?: () => Promise<void> | void; exitHref: string; onExit?: () => void }) {
  const steps = useMemo<Step[]>(() => workout.blocks.flatMap((b, i) => {
    const s: Step[] = [{ kind: 'work', ex: b.ex, seconds: b.seconds, cue: b.cue, easier: b.easier }];
    if (i < workout.blocks.length - 1 && workout.rest > 0) s.push({ kind: 'rest', ex: workout.blocks[i + 1].ex, seconds: workout.rest });
    return s;
  }), [workout]);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(steps[0].seconds);
  const [done, setDone] = useState(false);
  const [voice, setVoice] = useState(true);
  const [recorded, setRecorded] = useState<Map<string, string>>(new Map());
  useEffect(() => { void loadVoice().then(setRecorded); }, []);
  const [sound, setSound] = useState(true);
  const audio = useRef<AudioContext | null>(null);
  const saved = useRef(false);

  const step = steps[i];
  const ex = EXERCISES[step.ex];
  const nextWork = steps.slice(i + 1).find((s) => s.kind === 'work');
  const totalLeft = steps.slice(i + 1).reduce((n, s) => n + s.seconds, 0) + left;

  const go = useCallback((to: number) => {
    if (to >= steps.length) { setDone(true); if (!playRecorded(recorded, ['_done'], voice)) say('Workout complete. Well done.', voice); return; }
    const s = steps[Math.max(0, to)];
    setI(Math.max(0, to)); setLeft(s.seconds);
    const e = EXERCISES[s.ex];
    // A recorded cue is the general wording for the move, so a class with its own wording is always read out instead.
    const played = s.kind === 'rest' ? playRecorded(recorded, ['_rest'], voice) : s.cue ? false : playRecorded(recorded, [e.move], voice);
    if (!played) say(s.kind === 'rest' ? `Rest. Next, ${e.name}.` : `${e.name}. ${s.cue ?? e.cue}`, voice);
  }, [steps, voice, recorded]);

  useEffect(() => {
    if (!started || paused || done) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 4 && l > 1 && sound) beep(audio.current);
        if (l <= 1) { if (sound) beep(audio.current, true); setTimeout(() => go(i + 1), 0); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, paused, done, i, go, sound]);

  useEffect(() => {
    if (done && !saved.current && onComplete) { saved.current = true; void onComplete(); }
  }, [done, onComplete]);

  // Keep the screen awake during a workout where the browser allows it.
  useEffect(() => {
    if (!started || done) return;
    let lock: { release: () => Promise<void> } | null = null;
    (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [started, done]);

  // Stop talking if the player is closed mid-class.
  useEffect(() => () => { stopRecorded(); try { window.speechSynthesis?.cancel(); } catch { /* optional */ } }, []);

  // Voices load asynchronously in some browsers.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => { chosen = undefined; pickVoice(); };
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    load();
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, []);

  const begin = () => {
    try { audio.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { audio.current = null; }
    setStarted(true);
    const first = EXERCISES[steps[0].ex];
    const own = steps[0].cue;
    if (own || !playRecorded(recorded, ['_start', first.move].filter((k) => recorded.has(k)), voice)) say(`${workout.name}. First up, ${first.name}. ${own ?? first.cue}`, voice);
  };

  const pct = step.seconds ? 1 - left / step.seconds : 0;
  const R = 52, C = 2 * Math.PI * R;
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (done) {
    return (
      <div className="rounded-3xl border border-stone bg-surface p-6 text-center">
        <p className="eyebrow">Workout complete</p>
        <h2 className="mt-2 text-[32px]">Well done!</h2>
        <p className="mt-2 text-muted">{workout.name} · {workoutMinutes(workout)} minutes{onComplete ? ' · added to your weekly progress' : ''}</p>
        <div className="mx-auto mt-4 max-w-[320px] overflow-hidden rounded-2xl"><MoveMedia move="childs" /></div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {onExit ? <button type="button" onClick={onExit} className={buttonClass('primary')}>Done</button> : <Link href={exitHref} className={buttonClass('primary')}>Done</Link>}
          <button type="button" onClick={() => { saved.current = false; setDone(false); setStarted(false); setI(0); setLeft(steps[0].seconds); }} className={buttonClass('secondary')}>Do it again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-stone bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{step.kind === 'rest' ? 'Rest' : `Move ${steps.slice(0, i + 1).filter((s) => s.kind === 'work').length} of ${workout.blocks.length}`}</span>
        <span className="text-muted">{mmss(totalLeft)} left</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone"><div className="h-full rounded-full bg-ink transition-[width]" style={{ width: `${((i + pct) / steps.length) * 100}%` }} /></div>

      <div className="relative mt-3 overflow-hidden rounded-2xl bg-bg">
        <MoveMedia move={step.kind === 'rest' ? 'childs' : ex.move} playing={started && !paused} className="block w-full" />
        {step.kind === 'rest' && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-bg">Rest · next {ex.name}</span>}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0" aria-hidden>
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(var(--stone))" strokeWidth="9" />
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(var(--ink))" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x="60" y="68" textAnchor="middle" fontSize="28" fontWeight="800" fill="rgb(var(--ink))">{left}</text>
        </svg>
        <div className="min-w-0" aria-live="polite">
          <h2 className="text-[24px] leading-tight">{step.kind === 'rest' ? 'Breathe' : ex.name}</h2>
          <p className="mt-1 text-sm">{step.kind === 'rest' ? `Get ready for ${ex.name}.` : step.cue ?? ex.cue}</p>
          {step.kind === 'work' && <p className="mt-1 text-xs text-muted">Easier: {step.easier ?? ex.easier}</p>}
        </div>
      </div>

      {nextWork && step.kind === 'work' && <p className="mt-3 text-sm text-muted">Next up: <span className="font-semibold text-ink">{EXERCISES[nextWork.ex].name}</span></p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!started
          ? <button type="button" onClick={begin} className={`${buttonClass("primary")} flex-1 whitespace-nowrap`}>Start workout</button>
          : <button type="button" onClick={() => { setPaused((p) => !p); if (!paused) { window.speechSynthesis?.cancel(); stopRecorded(); } }} className={`${buttonClass('primary')} flex-1`}>{paused ? 'Resume' : 'Pause'}</button>}
        <button type="button" onClick={() => go(i - 1)} disabled={!started || i === 0} className={buttonClass('secondary')} aria-label="Previous">‹ Back</button>
        <button type="button" onClick={() => go(i + 1)} disabled={!started} className={buttonClass('secondary')} aria-label="Skip">Skip ›</button>
      </div>
      <div className="mt-3 flex gap-4 text-sm text-muted">
        <label className="flex items-center gap-2"><input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="h-4 w-4 accent-ink" />Voice cues</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="h-4 w-4 accent-ink" />Beeps</label>
      </div>
      <p className="mt-4 text-xs text-muted">Stop if anything hurts. If you are pregnant, postnatal or injured, check with your doctor or physio first.</p>
    </div>
  );
}
