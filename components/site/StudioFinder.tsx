import { wrap } from '@/components/site/sections';
import { STUDIOS, MAP_WIDTH, MAP_HEIGHT, mapPoint, directionsUrl, type SiteStudio } from '@/lib/site/studios';

// "Find your local studio": a simple map of where the BAYSE studios are, with directions to each.
// Drawn by us (no map provider, no cookies, nothing to load), in the site's black and white.

const LABEL: Record<SiteStudio['label'], { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  n: { dx: 0, dy: -11, anchor: 'middle' },
  s: { dx: 0, dy: 21, anchor: 'middle' },
  e: { dx: 10, dy: 4.5, anchor: 'start' },
  w: { dx: -10, dy: 4.5, anchor: 'end' },
  ne: { dx: 9, dy: -6, anchor: 'start' },
};

export function StudioFinder() {
  const open = STUDIOS.filter((s) => s.status === 'open');
  const opening = STUDIOS.filter((s) => s.status === 'opening');
  return (
    <section id="studios" className={`${wrap} scroll-mt-28 py-12`}>
      <p className="eyebrow">In person</p>
      <h2 className="mt-2 text-[30px] sm:text-[40px]">Find your local studio</h2>
      <p className="mt-3 max-w-[60ch] text-muted">
        {open.length} BAYSE reformer studios across the North West and Staffordshire, with {opening.map((s) => s.town).join(' and ')} opening soon.
        Train in a studio on a £99 or £148 membership and BAYSE Foundation is included.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
        <div className="border border-stone p-3">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={`Map of BAYSE studios: ${STUDIOS.map((s) => s.town).join(', ')}`} className="mx-auto block h-auto w-full max-w-[420px]">
            {STUDIOS.map((s) => {
              const { x, y } = mapPoint(s.lat, s.lng);
              const l = LABEL[s.label];
              const soon = s.status === 'opening';
              return (
                <a key={s.slug} href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" aria-label={`${s.town}${soon ? ', opening soon' : ''}: directions`}>
                  <circle cx={x} cy={y} r={16} fill="transparent" />
                  <circle cx={x} cy={y} r={5} fill={soon ? 'none' : '#fff'} stroke="#fff" strokeWidth={1.5} strokeDasharray={soon ? '2.5 2' : undefined} />
                  <text x={x + l.dx} y={y + l.dy} textAnchor={l.anchor} fontSize={12.5} fontWeight={700} fill="#fff" opacity={soon ? 0.7 : 1}>{s.town}</text>
                </a>
              );
            })}
          </svg>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-2"><span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-white" />Open</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-white" />Opening soon</span>
          </p>
        </div>

        <ul className="divide-y divide-stone border-y border-stone" data-studio-list>
          {STUDIOS.map((s) => (
            <li key={s.slug}>
              <a href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" className="group flex min-h-[52px] items-center justify-between gap-4 py-2">
                <span>
                  <span className="font-bold uppercase">BAYSE {s.town}</span>
                  {s.status === 'opening' ? <span className="ml-2 text-xs uppercase text-muted">Opening soon</span> : null}
                </span>
                <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] group-hover:underline">Directions ›</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted">The map shows each studio’s town. “Directions” opens the studio in Google Maps.</p>
    </section>
  );
}
