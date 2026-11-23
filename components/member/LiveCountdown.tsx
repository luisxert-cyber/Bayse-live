'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { countdownText, currentSlot, phaseOf, whenLabel, type BarSlot } from '@/lib/daily/countdown';

/**
 * The bar at the very top of the member app: a countdown to the next live class.
 * - More than 15 minutes away: "Next live · Today 7pm · Class name" and the time left.
 * - Room open (15 minutes before): "Room open" with the time left and a Join prompt.
 * - Class running: "Live now" and a Join prompt.
 * Tapping it opens the Live tab, where booking and joining happen. When a class ends it moves on to the next one.
 */
export function LiveCountdown({ slots, serverNow }: { slots: BarSlot[]; serverNow: number }) {
  // Start from the server's clock so the first paint matches, then tick on the phone's clock every second.
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    // Phones pause timers in the background: catch up the moment the app is opened again.
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);

  const slot = currentSlot(slots, now);
  if (!slot) return null;
  const phase = phaseOf(slot, now);
  const left = countdownText(slot.startsMs - now);
  const when = whenLabel(slot, now);
  const label = phase === 'on' ? 'Live now' : phase === 'open' ? 'Room open' : 'Next live';
  const spoken = phase === 'on' ? `Live now: ${slot.name}. Open live classes` : `Next live class: ${slot.name}, ${when}. Open live classes`;

  return (
    <Link href="/live" aria-label={spoken} data-live-countdown={phase} className="block border-b border-stone hover:bg-stone/30">
      <span className="mx-auto flex min-h-[44px] w-full max-w-xl items-center gap-3 px-4 py-2 text-sm sm:px-6 md:max-w-3xl md:px-8 lg:max-w-5xl">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          {phase !== 'upcoming' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${phase === 'upcoming' ? 'border border-ink' : 'bg-ink'}`} />
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="text-xs font-bold uppercase tracking-[0.1em]">{label}</span>
          <span className="text-muted"> · {phase === 'upcoming' ? `${when} · ` : ''}{slot.name}{slot.mine ? ' · ✓ Booked' : ''}</span>
        </span>
        {phase === 'on'
          ? <span className="shrink-0 text-xs font-bold uppercase underline">Join</span>
          : (
            <span className="flex shrink-0 items-baseline gap-2">
              {phase === 'open' && <span className="text-xs font-bold uppercase underline">Join</span>}
              <span className="font-display text-base font-extrabold tabular-nums" aria-hidden>{left}</span>
            </span>
          )}
      </span>
    </Link>
  );
}
