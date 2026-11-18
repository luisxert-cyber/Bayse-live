// What BAYSE online offers, in one place, so the website, pricing page and FAQs say the same thing.
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
  { name: 'Pilates Foundations', weeks: '4, 6 or 8 weeks', for: 'New to Pilates? Learn breath, alignment and control.' },
  { name: 'Strong & Sculpt', weeks: '4 to 12 weeks', for: 'Pilates and strength for tone and full-body strength.' },
  { name: 'Core & Posture', weeks: '4, 6 or 8 weeks', for: 'A stronger centre and a taller, easier posture.' },
  { name: 'Mobility & Restore', weeks: '4, 6 or 8 weeks', for: 'Ease stiffness and recover well.' },
  { name: 'Healthy Habits', weeks: '6 to 12 weeks', for: 'Movement, simple nutrition and habits that last.' },
  { name: 'Move More', weeks: '4, 6 or 8 weeks', for: 'Gentle movement and walking, no equipment.' },
];

export const CLUBS = [
  { name: 'Padel Club', body: 'Members set up games, choose a level and fill the court. The app keeps track of places and the waiting list.' },
  { name: 'Walk Club', body: 'Weekly walks from public meeting points near your studio, with distance and pace shown up front.' },
  { name: 'Social Club', body: 'Coffee, brunch and evenings out, arranged by members for members.' },
  { name: 'BAYSE Circles', body: 'Small groups of 10 to 20 who train at similar times and want to keep each other going.' },
];

export const FAQS = [
  { q: 'What do I need at home?', a: 'A mat and a little floor space. Some sessions use light weights or a resistance band, and every one shows you what to use instead if you do not have them. No reformer needed.' },
  { q: 'I am a complete beginner. Is it for me?', a: 'Yes. Tell us that when you build your plan and we will start you on Pilates Foundations, with beginner options in every live class.' },
  { q: 'Do I have to turn my camera on in live classes?', a: 'No, it is up to you. With your camera on, our second instructor can watch your form and give you pointers.' },
  { q: 'I am a BAYSE studio member. Do I pay again?', a: 'No. £99 and £148 studio members get BAYSE online included. Choose your studio when you sign up and your studio confirms it.' },
  { q: 'Can I cancel?', a: 'Any time, from your account, in a couple of taps. If you cancel during your 7-day free trial you will not be charged.' },
  { q: 'I am pregnant, postnatal or have an injury.', a: 'Please check with your doctor or physio first. Tell your instructor before class and they will give you options. Remote classes cannot replace an in-person assessment.' },
  { q: 'Is my information private?', a: 'Yes. Anything about your health stays private to you, and other members only see your chosen display name.' },
];
