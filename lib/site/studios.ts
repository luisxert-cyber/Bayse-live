// BAYSE studios shown on the website's "Find your local studio" map.
// Keep in step with public.studios (the list members pick from when they link their studio).
// lat/lng are the centre of each town, not the studio's front door: the map shows roughly where
// each studio is, and "Directions" opens the exact place in Google Maps.

export type SiteStudio = {
  slug: string;
  town: string;
  status: 'open' | 'opening';
  lat: number;
  lng: number;
  /** Which side of the dot the name sits on, so close-together towns don't overlap. */
  label: 'n' | 'e' | 's' | 'w' | 'ne';
};

export const STUDIOS: SiteStudio[] = [
  { slug: 'altrincham', town: 'Altrincham', status: 'open', lat: 53.387, lng: -2.349, label: 'ne' },
  { slug: 'bolton', town: 'Bolton', status: 'open', lat: 53.578, lng: -2.429, label: 'n' },
  { slug: 'liverpool', town: 'Liverpool', status: 'open', lat: 53.408, lng: -2.991, label: 'n' },
  { slug: 'stafford', town: 'Stafford', status: 'open', lat: 52.807, lng: -2.117, label: 'e' },
  { slug: 'stockton-heath', town: 'Stockton Heath', status: 'open', lat: 53.371, lng: -2.582, label: 's' },
  { slug: 'stoke', town: 'Stoke-on-Trent', status: 'open', lat: 53.003, lng: -2.179, label: 'e' },
  { slug: 'wilmslow', town: 'Wilmslow', status: 'open', lat: 53.328, lng: -2.231, label: 'e' },
  { slug: 'chester', town: 'Chester', status: 'opening', lat: 53.193, lng: -2.893, label: 'e' },
  { slug: 'harrogate', town: 'Harrogate', status: 'opening', lat: 53.992, lng: -1.541, label: 'w' },
];

// The area the map covers: Liverpool to Harrogate, Stafford to North Yorkshire.
export const MAP = { west: -3.25, east: -1.25, north: 54.15, south: 52.65, scale: 300 } as const;
// One degree of longitude is narrower than one of latitude this far north.
const LNG_RATIO = Math.cos((53.4 * Math.PI) / 180);

export const MAP_WIDTH = Math.round((MAP.east - MAP.west) * LNG_RATIO * MAP.scale);
export const MAP_HEIGHT = Math.round((MAP.north - MAP.south) * MAP.scale);

/** Where a place sits on the map, in the map's own units (0,0 is top left). */
export function mapPoint(lat: number, lng: number): { x: number; y: number } {
  return {
    x: Math.round((lng - MAP.west) * LNG_RATIO * MAP.scale * 10) / 10,
    y: Math.round((MAP.north - lat) * MAP.scale * 10) / 10,
  };
}

export const directionsUrl = (s: SiteStudio) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`BAYSE Reformer Pilates ${s.town}`)}`;
