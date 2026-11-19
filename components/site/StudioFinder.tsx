import { wrap } from '@/components/site/sections';
import { StudioLocator } from '@/components/site/StudioLocator';
import { STUDIOS } from '@/lib/site/studios';

// "Find your local studio": a black and white map of the UK with every BAYSE studio on it, and a
// search that shows the closest one. Drawn by us: no map provider, nothing to load.

const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '');

export function StudioFinder() {
  const open = STUDIOS.filter((s) => s.status === 'open');
  const opening = STUDIOS.filter((s) => s.status === 'opening');
  return (
    <section id="studios" className={`${wrap} scroll-mt-28 py-12`}>
      <p className="eyebrow">In person</p>
      <h2 className="mt-2 text-[30px] sm:text-[40px]">Find your local studio</h2>
      <p className="mt-3 max-w-[60ch] text-muted">
        {open.length} BAYSE studios open{opening.length ? `, with ${list(opening.map((s) => s.name.replace('BAYSE ', '')))} opening soon` : ''}.
        Train in a studio on a £99 or £148 membership and on-demand classes and the BAYSE Club community are included.
      </p>
      <StudioLocator />
    </section>
  );
}
