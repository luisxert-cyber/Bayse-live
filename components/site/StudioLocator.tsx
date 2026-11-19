'use client';

import { useState, type FormEvent } from 'react';
import { STUDIOS, MAP_WIDTH, MAP_HEIGHT, UK_PATH, mapPoint, nearestStudios, milesLabel, directionsUrl, type NearStudio } from '@/lib/site/studios';

// Find my closest studio: type a postcode or town, or use the phone's location, and see the nearest
// BAYSE studio on a black and white map of the UK. Postcodes are looked up with postcodes.io
// (free, UK only). Nothing the visitor types or their location is saved.

type Place = { lat: number; lng: number; label: string };

const FULL_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;

async function getJson(url: string): Promise<unknown> {
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}

const asPlace = (v: unknown, label: string): Place | null => {
  const o = v as { latitude?: unknown; longitude?: unknown } | null;
  return o && typeof o.latitude === 'number' && typeof o.longitude === 'number' ? { lat: o.latitude, lng: o.longitude, label } : null;
};

/** Turn what the visitor typed into a place: a full postcode, the first half of one, or a town. */
async function findPlace(typed: string): Promise<Place | null> {
  const compact = typed.replace(/\s+/g, '').toUpperCase();
  if (FULL_POSTCODE.test(compact)) {
    const d = (await getJson(`https://api.postcodes.io/postcodes/${compact}`)) as { result?: unknown } | null;
    const p = asPlace(d?.result, typed.trim().toUpperCase());
    if (p) return p;
  }
  if (OUTCODE.test(compact)) {
    const d = (await getJson(`https://api.postcodes.io/outcodes/${compact}`)) as { result?: unknown } | null;
    const p = asPlace(d?.result, compact);
    if (p) return p;
  }
  const d = (await getJson(`https://api.postcodes.io/places?q=${encodeURIComponent(typed.trim())}&limit=1`)) as { result?: { name_1?: string }[] } | null;
  const first = d?.result?.[0];
  return first ? asPlace(first, first.name_1 ?? typed.trim()) : null;
}

const button = 'inline-flex min-h-[52px] items-center justify-center px-5 text-sm font-bold uppercase disabled:opacity-60';

export function StudioLocator() {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [from, setFrom] = useState<Place | null>(null);

  const ranked: NearStudio[] = from ? nearestStudios(from) : [];
  const open = ranked.filter((s) => s.status === 'open');
  const closest = open[0] ?? null;
  const others = open.slice(1, 3);
  const soonNearer = closest ? ranked.find((s) => s.status === 'opening' && s.miles < closest.miles) ?? null : null;

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!typed.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const place = await findPlace(typed);
      if (place) setFrom(place);
      else setError('We couldn’t find that. Try a full postcode, like WA4 2UE.');
    } catch {
      setError('We couldn’t look that up just now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function locateMe() {
    if (!('geolocation' in navigator)) { setError('Your browser can’t share a location. Type a postcode instead.'); return; }
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setFrom({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'you' }); setBusy(false); },
      () => { setError('We couldn’t get your location. Type a postcode instead.'); setBusy(false); },
      { timeout: 10000, maximumAge: 600000 },
    );
  }

  const you = from ? mapPoint(from.lat, from.lng) : null;
  const youOnMap = you && you.x > 0 && you.x < MAP_WIDTH && you.y > 0 && you.y < MAP_HEIGHT;
  // Draw "opening soon" first so open studios sit on top where dots are close together.
  const dots = [...STUDIOS].sort((a, b) => (a.status === b.status ? 0 : a.status === 'opening' ? -1 : 1));

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] md:items-start" data-studio-finder>
      <div className="border border-stone p-3 md:order-2">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={`Map of the UK showing ${STUDIOS.length} BAYSE studios`} className="mx-auto block h-auto w-full max-w-[380px]">
          <path d={UK_PATH} fill="#161616" stroke="#8a8a8a" strokeWidth={1} strokeLinejoin="round" />
          {dots.map((s) => {
            const { x, y } = mapPoint(s.lat, s.lng);
            const soon = s.status === 'opening';
            return <circle key={s.slug} cx={x} cy={y} r={3.6} fill={soon ? '#000' : '#fff'} stroke={soon ? '#fff' : '#000'} strokeWidth={1} />;
          })}
          {closest ? (() => { const { x, y } = mapPoint(closest.lat, closest.lng); return <circle cx={x} cy={y} r={9} fill="none" stroke="#fff" strokeWidth={1.5} />; })() : null}
          {you && youOnMap ? <path d={`M${you.x - 5} ${you.y}H${you.x + 5}M${you.x} ${you.y - 5}V${you.y + 5}`} stroke="#fff" strokeWidth={1.5} /> : null}
        </svg>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-white" />Open</span>
          <span className="inline-flex items-center gap-2"><span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border border-white" />Opening soon</span>
          {from ? <span className="inline-flex items-center gap-2"><span aria-hidden className="font-bold text-white">+</span>You</span> : null}
        </p>
      </div>

      <div className="md:order-1">
        <form onSubmit={search} className="grid gap-3">
          <label htmlFor="studio-search" className="text-sm font-bold uppercase">Find your closest studio</label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input id="studio-search" name="postcode" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Postcode or town" autoComplete="postal-code" enterKeyHint="search"
              className="min-h-[52px] min-w-0 border border-white bg-black px-4 text-base text-white placeholder:text-muted" />
            <button type="submit" disabled={busy} className={`${button} bg-white text-black`}>{busy ? 'Finding…' : 'Find'}</button>
          </div>
          <button type="button" onClick={locateMe} disabled={busy} className={`${button} border border-white hover:bg-white hover:text-black`}>Use my location</button>
        </form>

        <div aria-live="polite" className="mt-4">
          {error ? <p className="text-sm">{error}</p> : null}
          {closest ? (
            <div data-closest-studio>
              <div className="border-2 border-white p-5">
                <p className="eyebrow">Closest to {from?.label}</p>
                <p className="mt-2 text-2xl font-bold uppercase leading-tight">{closest.name}</p>
                <p className="mt-1 text-muted">{milesLabel(closest.miles)} away</p>
                <a href={directionsUrl(closest)} target="_blank" rel="noopener noreferrer" className={`${button} mt-4 w-full bg-white text-black`}>Directions</a>
              </div>
              {others.length ? (
                <ul className="divide-y divide-stone border-b border-stone">
                  {others.map((s) => (
                    <li key={s.slug}>
                      <a href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" className="group flex min-h-[52px] items-center justify-between gap-4 py-2">
                        <span><span className="font-bold uppercase">{s.name}</span><span className="ml-2 text-sm text-muted">{milesLabel(s.miles)}</span></span>
                        <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] group-hover:underline">Directions ›</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {soonNearer ? <p className="mt-3 text-sm text-muted">Opening soon, even closer: <span className="font-bold text-white">{soonNearer.name}</span>, {milesLabel(soonNearer.miles)} away.</p> : null}
            </div>
          ) : null}
        </div>

        <details className="group mt-5 border-y border-stone">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold uppercase">All {STUDIOS.length} locations<span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span></summary>
          <ul className="divide-y divide-stone border-t border-stone" data-studio-list>
            {STUDIOS.map((s) => (
              <li key={s.slug} className="flex min-h-[48px] items-center justify-between gap-4 py-2 text-sm">
                <span className="font-bold uppercase">{s.name}</span>
                {s.status === 'open'
                  ? <a href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] hover:underline">Directions ›</a>
                  : <span className="shrink-0 text-xs uppercase text-muted">Opening soon</span>}
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-3 text-xs text-muted">Distances are in a straight line. We don’t save your postcode or location.</p>
      </div>
    </div>
  );
}
