// BAYSE studios shown on the website's "Find your local studio" map and nearest-studio search.
// Owner's list, 19 Nov 2026: eleven open, three opening soon. Keep in step with public.studios
// (the list members pick from when they link their studio).
// Open studios use the position of their Google listing and its place id, so "Directions" opens the
// studio itself. Studios opening soon sit on the town centre and have no directions yet.
// The two Mega Reformer studios are the same membership as their reformer studio (Liverpool: same building;
// Stockton Heath: round the corner at 19a London Road). They are locations on the website, but not
// separate studios in public.studios.

import { GREAT_BRITAIN, NORTHERN_IRELAND } from './uk-outline';

export type SiteStudio = {
  slug: string;
  name: string;
  town: string;
  status: 'open' | 'opening';
  lat: number;
  lng: number;
  /** Google Maps place id, where we have one. */
  placeId?: string;
};

export const STUDIOS: SiteStudio[] = [
  { slug: 'altrincham', name: 'BAYSE Altrincham', town: 'Altrincham', status: 'open', lat: 53.38573, lng: -2.35158, placeId: 'ChIJbxa7MJOte0gRpVOhbKepHps' },
  { slug: 'bolton', name: 'BAYSE Bolton', town: 'Bolton', status: 'open', lat: 53.60033, lng: -2.54707, placeId: 'ChIJKbnNTZwJe0gRkZPRQwbuIA0' },
  { slug: 'chester', name: 'BAYSE Chester', town: 'Chester', status: 'open', lat: 53.19201, lng: -2.88818, placeId: 'ChIJH17LJbXdekgRBG2XlhKZS6o' },
  { slug: 'harrogate', name: 'BAYSE Harrogate', town: 'Harrogate', status: 'open', lat: 53.99239, lng: -1.54132, placeId: 'ChIJEegee_RTeUgR1rKchU78IWI' },
  { slug: 'liverpool', name: 'BAYSE Liverpool', town: 'Liverpool', status: 'open', lat: 53.40561, lng: -2.99181, placeId: 'ChIJ7cf2L4Ihe0gRE_LtHzeVa2Y' },
  { slug: 'mega-reformer-liverpool', name: 'BAYSE Mega Reformer Liverpool', town: 'Liverpool', status: 'open', lat: 53.40561, lng: -2.99181 },
  { slug: 'stafford', name: 'BAYSE Stafford', town: 'Stafford', status: 'open', lat: 52.81739, lng: -2.08267, placeId: 'ChIJbeAckOdzekgRcvtG47MCgzU' },
  { slug: 'stockton-heath', name: 'BAYSE Stockton Heath', town: 'Stockton Heath', status: 'open', lat: 53.37228, lng: -2.58146, placeId: 'ChIJ-YAdceoDe0gR3fZmohb9BQw' },
  { slug: 'mega-reformer-stockton-heath', name: 'BAYSE Mega Reformer Stockton Heath', town: 'Stockton Heath', status: 'open', lat: 53.37243, lng: -2.58145, placeId: 'ChIJU8a6PAUCe0gRJBBmtUQuJew' },
  { slug: 'stoke', name: 'BAYSE Stoke', town: 'Stoke-on-Trent', status: 'open', lat: 53.00799, lng: -2.16537, placeId: 'ChIJpz8nUfFpekgRKAISJZcT1Ro' },
  { slug: 'wilmslow', name: 'BAYSE Wilmslow', town: 'Wilmslow', status: 'open', lat: 53.33689, lng: -2.21525, placeId: 'ChIJe146MQVNekgR-aT-4wH3eAw' },
  { slug: 'manchester-northern-quarter', name: 'BAYSE Manchester Northern Quarter', town: 'Manchester', status: 'opening', lat: 53.484, lng: -2.235 },
  { slug: 'leeds', name: 'BAYSE Leeds', town: 'Leeds', status: 'opening', lat: 53.7997, lng: -1.5492 },
  { slug: 'cheltenham', name: 'BAYSE Cheltenham', town: 'Cheltenham', status: 'opening', lat: 51.8994, lng: -2.0783 },
];

// ---- The map: the whole UK, drawn to scale -------------------------------------------------

export const MAP = { west: -8.5, east: 2.1, north: 58.9, south: 49.75, scale: 60 } as const;
// One degree of longitude is narrower than one of latitude this far north.
const LNG_RATIO = Math.cos((54.5 * Math.PI) / 180);

export const MAP_WIDTH = Math.round((MAP.east - MAP.west) * LNG_RATIO * MAP.scale);
export const MAP_HEIGHT = Math.round((MAP.north - MAP.south) * MAP.scale);

/** Where a place sits on the map, in the map's own units (0,0 is top left). */
export function mapPoint(lat: number, lng: number): { x: number; y: number } {
  return {
    x: Math.round((lng - MAP.west) * LNG_RATIO * MAP.scale * 10) / 10,
    y: Math.round((MAP.north - lat) * MAP.scale * 10) / 10,
  };
}

const outline = (points: [number, number][]) =>
  points.map(([lat, lng], i) => { const { x, y } = mapPoint(lat, lng); return `${i ? 'L' : 'M'}${x} ${y}`; }).join('') + 'Z';

/** The UK as one SVG path, in the map's units. */
export const UK_PATH = outline(GREAT_BRITAIN) + outline(NORTHERN_IRELAND);

// ---- Nearest studio ---------------------------------------------------------------------------

/** Distance between two places in miles, as the crow flies. */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

export type NearStudio = SiteStudio & { miles: number };

/** Every studio with its distance from a place, nearest first. */
export function nearestStudios(from: { lat: number; lng: number }, studios: SiteStudio[] = STUDIOS): NearStudio[] {
  return studios.map((s) => ({ ...s, miles: milesBetween(from, s) })).sort((a, b) => a.miles - b.miles);
}

export const milesLabel = (miles: number) => (miles < 10 ? `${miles.toFixed(1)} miles` : `${Math.round(miles)} miles`);

export const directionsUrl = (s: SiteStudio) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`BAYSE Reformer Pilates ${s.town}`)}${s.placeId ? `&query_place_id=${s.placeId}` : ''}`;
