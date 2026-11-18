export const CLUB: Record<string, { label: string; icon: string }> = {
  padel: { label: 'Padel Club', icon: '🎾' }, walk: { label: 'Walk Club', icon: '🚶‍♀️' }, social: { label: 'Social Club', icon: '☕' },
};
export const LEVEL: Record<string, string> = { beginner: 'Beginner friendly', intermediate: 'Intermediate', advanced: 'Advanced', all: 'All levels' };

/** One-tap starting points for members. They fill the form; the member picks the date and place. */
export type Template = { key: string; kind: 'padel' | 'walk' | 'social'; title: string; time: string; capacity?: number; level?: string; padel_format?: string; distance_km?: number; pace?: string; description: string; weekday?: number };
export const TEMPLATES: Template[] = [
  { key: 'padel-saturday', kind: 'padel', title: 'Saturday morning padel', time: '10:00', capacity: 4, level: 'beginner', padel_format: 'doubles', weekday: 6, description: 'Friendly doubles, beginners welcome. We book a court together and split the cost.' },
  { key: 'padel-americano', kind: 'padel', title: 'Friday night Americano', time: '19:00', capacity: 8, level: 'all', padel_format: 'americano', weekday: 5, description: 'Rotating partners, short games, lots of laughs. Court cost shared.' },
  { key: 'walk-sunday', kind: 'walk', title: 'Sunday morning walk', time: '09:30', distance_km: 5, pace: 'easy', level: 'all', weekday: 7, description: 'An easy 5 km and a chat. Coffee afterwards for anyone who fancies it.' },
  { key: 'walk-evening', kind: 'walk', title: 'After-work walk', time: '18:30', distance_km: 4, pace: 'steady', level: 'all', weekday: 3, description: 'A steady loop to shake off the working day.' },
  { key: 'social-coffee', kind: 'social', title: 'Coffee after the live class', time: '10:00', level: 'all', weekday: 6, description: 'Do the 9am live class at home, then meet for coffee and a catch-up.' },
  { key: 'social-brunch', kind: 'social', title: 'Sunday brunch', time: '11:00', capacity: 10, level: 'all', weekday: 7, description: 'Brunch with BAYSE friends. Everyone pays for their own.' },
];
