// What The BAYSE Club offers, in one place, so the website, pricing page and FAQs say the same thing.
// Update here when the offer changes.

// Launch timetable: 17 live classes a week, all 45 minutes, UK time.
// Review attendance after 4 to 6 weeks before adding more slots.
export const LIVE_CLASS_MINUTES = 45;

const WAKE = 'Wake-up Flow';
const MAT = 'Mat Pilates';
const LUNCH = 'Lunchtime Core & Glutes';
const SCULPT = 'Signature Sculpt';

export const LIVE_TIMETABLE: { day: string; short: string; classes: { time: string; name: string }[] }[] = [
  { day: 'Monday', short: 'Mon', classes: [{ time: '7am', name: WAKE }, { time: '9am', name: MAT }, { time: '7pm', name: SCULPT }] },
  { day: 'Tuesday', short: 'Tue', classes: [{ time: '7am', name: WAKE }, { time: '12pm', name: LUNCH }, { time: '7pm', name: SCULPT }] },
  { day: 'Wednesday', short: 'Wed', classes: [{ time: '7am', name: WAKE }, { time: '9am', name: MAT }, { time: '7pm', name: SCULPT }] },
  { day: 'Thursday', short: 'Thu', classes: [{ time: '7am', name: WAKE }, { time: '12pm', name: LUNCH }, { time: '7pm', name: SCULPT }] },
  { day: 'Friday', short: 'Fri', classes: [{ time: '7am', name: WAKE }, { time: '9am', name: MAT }, { time: '7pm', name: 'Stretch & Restore' }] },
  { day: 'Saturday', short: 'Sat', classes: [{ time: '9am', name: 'Full Body Sculpt' }] },
  { day: 'Sunday', short: 'Sun', classes: [{ time: '9am', name: 'Slow Flow & Mobility' }] },
];

export const LIVE_CLASSES_PER_WEEK = LIVE_TIMETABLE.reduce((n, d) => n + d.classes.length, 0);

export const ON_DEMAND = [
  { name: 'Mat Pilates', note: 'The BAYSE method, on the mat' },
  { name: 'Full Body Sculpt', note: 'Pilates with light weights' },
  { name: 'Strength', note: 'Build strong, capable muscles' },
  { name: 'Core and Abs', note: 'Deep core, every level' },
  { name: 'Glutes and Lower Body', note: 'Shape and stability' },
  { name: 'Mobility and Stretch', note: 'Move and feel better' },
  { name: 'Express', note: '10 to 15 minutes, any day' },
  { name: 'Beginner Pilates', note: 'Start from the very first breath' },
];

export const PROGRAMMES = [
  { name: 'Pilates Foundations', weeks: '4, 6 or 8 weeks', for: 'New to Pilates? Learn breath, alignment and control.', level: 'Beginner',
    sessions: [['Breath & Alignment', 15], ['Mat Fundamentals', 25], ['Core Ignition', 15], ['Gentle Full Body', 25], ['Sunrise Stretch', 10]] },
  { name: 'Strong & Sculpt', weeks: '4 to 12 weeks', for: 'Pilates and strength for tone and full-body strength.', level: 'Intermediate',
    sessions: [['Full Body Sculpt', 30], ['Glute Burn', 25], ['Long Lean Arms', 20], ['Signature Sculpt', 45], ['Core Burner', 15]] },
  { name: 'Core & Posture', weeks: '4, 6 or 8 weeks', for: 'A stronger centre and a taller, easier posture.', level: 'All levels',
    sessions: [['Deep Core', 20], ['Desk Release', 12], ['Spine Mobility', 15], ['Core & Glutes', 25]] },
  { name: 'Mobility & Restore', weeks: '4, 6 or 8 weeks', for: 'Ease stiffness and recover well.', level: 'All levels',
    sessions: [['Slow Flow', 30], ['Hip Opener', 15], ['Stretch & Restore', 20], ['Wind-down', 10]] },
  { name: 'Healthy Habits', weeks: '6 to 12 weeks', for: 'Movement, simple nutrition and habits that last.', level: 'All levels',
    sessions: [['Express Full Body', 15], ['Walk & Talk', 30], ['Core Burner', 15], ['Slow Flow', 30]] },
  { name: 'Move More', weeks: '4, 6 or 8 weeks', for: 'Gentle movement and walking, no equipment.', level: 'Beginner',
    sessions: [['Wake-up Flow', 10], ['Gentle Full Body', 25], ['Walk & Talk', 30], ['Wind-down', 10]] },
] as const;

// A taste of the on-demand library planned for launch (mat-based, no reformer needed).
// Shown as a preview on the website: classes are not playable until the library opens.
export type LibraryClass = { id: number; name: string; minutes: number; focus: 'Full body' | 'Core' | 'Glutes & legs' | 'Upper body' | 'Stretch'; level: 1 | 2 | 3; kit: 'Mat' | 'Mat + weights' | 'Mat + band' };
export const LIBRARY: LibraryClass[] = [
  { id: 1, name: 'Mat Fundamentals', minutes: 25, focus: 'Full body', level: 1, kit: 'Mat' },
  { id: 2, name: 'Signature Sculpt', minutes: 45, focus: 'Full body', level: 2, kit: 'Mat + weights' },
  { id: 3, name: 'Core Burner', minutes: 15, focus: 'Core', level: 2, kit: 'Mat' },
  { id: 4, name: 'Glute Burn', minutes: 25, focus: 'Glutes & legs', level: 2, kit: 'Mat + band' },
  { id: 5, name: 'Sunrise Stretch', minutes: 10, focus: 'Stretch', level: 1, kit: 'Mat' },
  { id: 6, name: 'Long Lean Arms', minutes: 20, focus: 'Upper body', level: 2, kit: 'Mat + weights' },
  { id: 7, name: 'Deep Core', minutes: 20, focus: 'Core', level: 1, kit: 'Mat' },
  { id: 8, name: 'Advanced Flow', minutes: 45, focus: 'Full body', level: 3, kit: 'Mat' },
  { id: 9, name: 'Desk Release', minutes: 12, focus: 'Stretch', level: 1, kit: 'Mat' },
  { id: 10, name: 'Standing Legs', minutes: 30, focus: 'Glutes & legs', level: 2, kit: 'Mat + weights' },
  { id: 11, name: 'Teaser Series', minutes: 15, focus: 'Core', level: 3, kit: 'Mat' },
  { id: 12, name: 'Slow Flow', minutes: 30, focus: 'Stretch', level: 1, kit: 'Mat' },
];

export const CLUBS = [
  { name: 'Padel Club', body: 'Members set up games, choose a level and fill the court. The app keeps track of places and the waiting list.' },
  { name: 'Walk Club', body: 'Weekly walks from public meeting points near you, with distance and pace shown up front.' },
  { name: 'Social Club', body: 'Coffee, brunch and evenings out, arranged by members for members.' },
  { name: 'BAYSE Circles', body: 'Small groups of 10 to 20 who train at similar times and want to keep each other going.' },
];

export const FAQS = [
  { q: 'What do I need at home?', a: 'A mat and a little floor space. Some sessions use light weights or a resistance band, and every one shows you what to use instead if you do not have them. No reformer needed.' },
  { q: 'I am a complete beginner. Is it for me?', a: 'Yes. Tell us that when you build your plan and we will start you on Pilates Foundations, with beginner options in every live class.' },
  { q: 'Do I have to turn my camera on in live classes?', a: 'No, it is up to you. With your camera on, our second instructor can watch your form and give you pointers.' },
  { q: 'I have a BAYSE code. How do I use it?', a: 'Choose a plan, then tap "Add promotion code" on the payment page and enter your code. A free-membership code means you are not charged.' },
  { q: 'Can I cancel?', a: 'Any time, from your account, in a couple of taps. If you cancel during your 7-day free trial you will not be charged.' },
  { q: 'I am pregnant, postnatal or have an injury.', a: 'Please check with your doctor or physio first. Tell your instructor before class and they will give you options. Remote classes cannot replace an in-person assessment.' },
  { q: 'Is my information private?', a: 'Yes. Anything about your health stays private to you, and other members only see your chosen display name.' },
];

// Membership tiers (owner decision 18 Nov 2026). Billed every 28 days: 13 payments a year.
export const BILLING = 'every 28 days';
export const PRIVATE_SESSION_PRICE = '£44.99';
export const TIERS = [
  {
    key: 'essential', name: 'BAYSE Foundation', price: '£19.99', tagline: 'Train on your terms',
    bestFor: 'For you if you like to train at home, in your own time.',
    items: ['Your personal plan, 4 to 12 weeks', 'The on-demand library and workout builder', 'Recipes and shopping lists', 'Progress, milestones and rewards', 'The member community and Clubs'],
  },
  {
    key: 'club', name: 'BAYSE Inner Circle', price: '£39.99', tagline: 'Train live, together', featured: true,
    bestFor: 'For you if you want real instructors, a timetable to show up for and people who notice when you do.',
    items: ['Everything in Foundation', `${LIVE_CLASSES_PER_WEEK} live Zoom classes a week, two instructors in each`, 'Monthly challenges'],
  },
  {
    key: 'coaching', name: 'BAYSE Black', price: '£79.99', tagline: 'One-to-one with your instructor',
    bestFor: 'For you if you want time with an instructor who knows you: form, progress and a plan that changes with you.',
    items: ['Everything in Inner Circle', 'One 45-minute private Zoom session every 28 days', 'Unused session carries over one extra period', `Extra 1-to-1s any time (${PRIVATE_SESSION_PRICE})`],
  },
] as const;

// Parts of BAYSE that open in stages after launch. The website labels them honestly.
export const OPENING_IN_STAGES = 'Opening in stages';
