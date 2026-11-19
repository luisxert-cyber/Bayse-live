'use client';

import { useEffect, useState } from 'react';

// "Add BAYSE to your phone": on Android and desktop Chrome one tap installs it; on iPhone we show the two
// taps Safari needs. Hidden once installed, and stays away for 30 days if dismissed.
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
const KEY = 'bayse_install_dismissed';

export function InstallApp() {
  const [mode, setMode] = useState<'none' | 'prompt' | 'ios'>('none');
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    try { const at = Number(localStorage.getItem(KEY) ?? 0); if (at && Date.now() - at < 30 * 86_400_000) return; } catch { /* private window */ }
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) setMode('ios');
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); setMode('prompt'); };
    const onInstalled = () => setMode('none');
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (mode === 'none') return null;
  const dismiss = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ } setMode('none'); };
  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === 'accepted') setMode('none'); else dismiss();
  };

  return (
    <section className="border border-stone p-4" data-install-app>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Get the app</p>
          <p className="mt-1 font-bold">Add BAYSE to your home screen</p>
          <p className="mt-1 text-sm text-muted">One tap to open, full screen, no browser bar.</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Not now" className="grid h-9 w-9 shrink-0 place-items-center text-lg text-muted hover:text-ink">×</button>
      </div>
      {mode === 'prompt' ? (
        <button type="button" onClick={install} className="mt-3 inline-flex min-h-[44px] items-center bg-ink px-5 text-sm font-bold uppercase text-bg">Add to home screen</button>
      ) : steps ? (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          <li>Tap the <strong>Share</strong> button in your browser (the square with an arrow pointing up).</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>. BAYSE appears with your other apps.</li>
        </ol>
      ) : (
        <button type="button" onClick={() => setSteps(true)} className="mt-3 inline-flex min-h-[44px] items-center bg-ink px-5 text-sm font-bold uppercase text-bg">Show me how</button>
      )}
    </section>
  );
}
