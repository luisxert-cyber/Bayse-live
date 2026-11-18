// "Six things that make BAYSE different": each feature with a small, faithful preview of the real screen.
// Example data is labelled as an example; screens mirror what members actually see in the app.
import type { ReactNode } from 'react';

const Frame = ({ children, label = 'Example' }: { children: ReactNode; label?: string }) => (
  <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden border border-stone bg-[radial-gradient(120%_80%_at_50%_0%,#1c1c22_0%,#000_70%)] px-5 pb-8 pt-10 md:min-h-[400px] md:px-8">
    <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
    {children}
  </div>
);
const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`w-full max-w-[340px] border border-stone bg-[#0b0b0b] p-4 shadow-[0_30px_60px_-30px_rgba(80,90,255,0.35)] ${className}`}>{children}</div>
);
const Label = ({ children }: { children: ReactNode }) => <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{children}</p>;

function Daily() {
  return (
    <Frame label="In the app · Today">
      <Panel className="!p-0">
        <div className="relative">
          <img src="/clips/preview/birddog.jpg" alt="" className="aspect-[16/9] w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-x-3 bottom-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">BAYSE Daily · your next best move</p>
            <p className="text-lg font-bold uppercase leading-tight">Core Control</p>
            <p className="text-xs text-white/75">15 min</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-3">
          <p className="text-[11px] leading-snug text-muted">1 of 3 this week. Picked for your goals and the time you usually have.</p>
          <span className="shrink-0 border border-white px-3 py-1.5 text-[10px] font-bold uppercase">Start</span>
        </div>
      </Panel>
    </Frame>
  );
}

function Together() {
  return (
    <div className="relative h-[300px] w-full overflow-hidden border border-stone md:h-[400px]">
      <img src="/images/community-friends.webp" alt="BAYSE members together in the studio" className="h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 space-y-2">
        {[['Circle', 'Early Birds', 'Trains before work · 7am live'], ['Walk Club', 'Sunday morning walk', '5 km · easy pace · coffee after']].map(([k, t, d]) => (
          <div key={t} className="flex items-center justify-between gap-3 border border-white/25 bg-black/60 px-3 py-2 backdrop-blur">
            <span className="min-w-0"><span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">{k}</span><span className="block text-sm font-bold">{t}</span><span className="block text-[11px] text-white/70">{d}</span></span>
            <span className="shrink-0 bg-white px-3 py-1 text-[10px] font-bold uppercase text-black">Join</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressShot() {
  const bars = [1, 2, 1, 3, 2, 3, 4];
  return (
    <Frame>
      <Panel>
        <div className="grid grid-cols-3 gap-px border border-stone bg-stone text-center">
          {[['24', 'classes'], ['11h', 'trained'], ['6', 'week streak']].map(([n, l]) => <div key={l} className="bg-[#0b0b0b] py-2.5"><p className="text-xl font-bold leading-none">{n}</p><p className="mt-1 text-[10px] text-muted">{l}</p></div>)}
        </div>
        <Label><span className="mt-4 block">Sessions per week</span></Label>
        <div className="mt-2 flex h-16 items-end gap-1.5">
          {bars.map((n, i) => <span key={i} className={`flex-1 ${i === bars.length - 1 ? 'bg-white' : 'bg-[#3a3a3a]'}`} style={{ height: `${n * 25}%` }} />)}
        </div>
        <div className="mt-3 flex items-center gap-3 border border-white px-3 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white text-xs font-bold">25</span>
          <span className="text-xs"><span className="block font-bold">25 classes</span><span className="text-muted">Next milestone · 1 to go</span></span>
        </div>
      </Panel>
    </Frame>
  );
}

function Nourish() {
  return (
    <Frame>
      <Panel>
        <div className="flex gap-1.5">{['High protein', 'Quick', 'Vegetarian'].map((t, i) => <span key={t} className={`border px-2 py-0.5 text-[10px] ${i === 0 ? 'border-white bg-white font-bold text-black' : 'border-stone text-muted'}`}>{t}</span>)}</div>
        <ul className="mt-3 divide-y divide-stone border-y border-stone">
          {[['Breakfast', 'Berry protein oats', '5 min', true], ['Lunch', 'Chicken & quinoa bowl', '20 min', false], ['Dinner', 'Lemon chicken traybake', '40 min', true]].map(([m, n, t, s]) => (
            <li key={n as string} className="flex items-center justify-between py-2"><span><span className="block text-[9px] uppercase tracking-[0.14em] text-muted">{m}</span><span className="block text-[13px] font-bold">{n}</span><span className="block text-[11px] text-muted">{t}</span></span><span className="text-sm">{s ? '♥' : '♡'}</span></li>
          ))}
        </ul>
        <Label><span className="mt-3 block">Shopping list</span></Label>
        <ul className="mt-1.5 space-y-1 text-[12px]">
          {[['Chicken thighs', true], ['Cherry tomatoes', false], ['Greek yoghurt', false]].map(([i, d]) => (
            <li key={i as string} className={`flex items-center gap-2 ${d ? 'text-muted line-through' : ''}`}><span className={`grid h-3.5 w-3.5 place-items-center border text-[9px] ${d ? 'border-muted bg-muted text-black' : 'border-white'}`}>{d ? '✓' : ''}</span>{i}</li>
          ))}
        </ul>
      </Panel>
    </Frame>
  );
}

function LiveCoach() {
  return (
    <div className="relative h-[300px] w-full overflow-hidden border border-stone md:h-[400px]">
      <img src="/images/studio-side-plank.webp" alt="A BAYSE instructor teaching a side plank" className="h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <span className="absolute left-4 top-4 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Live</span>
      <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="border border-white/25 bg-black/60 px-3 py-2 backdrop-blur"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Instructor 1</p><p className="font-bold">Teaches the class</p></div>
        <div className="border border-white/25 bg-black/60 px-3 py-2 backdrop-blur"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Instructor 2</p><p className="font-bold">Watches your form</p></div>
      </div>
    </div>
  );
}

function Rewards() {
  return (
    <Frame>
      <Panel>
        <Label>Milestones</Label>
        <div className="mt-3 flex justify-between">
          {[1, 5, 10, 25, 50].map((n) => <span key={n} className={`grid h-11 w-11 place-items-center rounded-full border-2 text-xs font-bold ${n <= 10 ? 'border-white' : 'border-dashed border-[#3a3a3a] text-muted'}`}>{n}</span>)}
        </div>
        <div className="mt-4 border border-stone p-3">
          <p className="text-[13px] font-bold">Member reward</p>
          <p className="text-[11px] text-muted">Unlocks at 25 classes</p>
          <div className="mt-2 h-1 bg-[#3a3a3a]"><div className="h-full w-[72%] bg-white" /></div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted"><span>18 of 25 classes</span><span>Keep going</span></div>
        </div>
      </Panel>
    </Frame>
  );
}

const FEATURES: { name: string; tag: string; body: string; visual: ReactNode }[] = [
  { name: 'BAYSE Daily', tag: 'Know exactly what to do today', body: 'Open the app and see your next best move, picked from your goals, the time you have, the live timetable and what you did this week. Back after a break? It starts you gently.', visual: <Daily /> },
  { name: 'BAYSE Together', tag: 'Real friendships, not just classes', body: 'Meet members who share your interests. Join a Circle that trains at your times, or set up padel, walks and coffee yourselves, with group chat and waiting lists handled for you.', visual: <Together /> },
  { name: 'BAYSE Progress', tag: 'See how far you have come', body: 'Classes, hours, weekly streaks and milestones like your first 25 classes or coming back after a break. Never the scales.', visual: <ProgressShot /> },
  { name: 'BAYSE Nourish', tag: 'Food that fits real life', body: 'Simple recipes for the way you eat, with filters for high protein, vegetarian, quick or family meals, saved favourites and a shopping list that fills itself.', visual: <Nourish /> },
  { name: 'BAYSE Live Coach', tag: 'Two instructors in every live class', body: 'One teaches and motivates. The other watches your form and gives you pointers by name. Camera on for feedback, or off if you prefer.', visual: <LiveCoach /> },
  { name: 'BAYSE Rewards', tag: 'Showing up adds up', body: 'Milestones from your first class to your hundredth, and member rewards that unlock as your classes add up, as partner offers launch.', visual: <Rewards /> },
];

export function SixFeatures() {
  return (
    <div className="mt-10 space-y-14 sm:space-y-20">
      {FEATURES.map((f, i) => (
        <article key={f.name} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
          <div className={i % 2 ? 'md:order-2' : ''}>{f.visual}</div>
          <div>
            <p className="font-display text-[44px] font-bold leading-none text-[#2a2a2a]">0{i + 1}</p>
            <h3 className="mt-3 text-[26px] uppercase sm:text-[30px]">{f.name}</h3>
            <p className="mt-1 text-[15px] font-semibold italic">{f.tag}</p>
            <p className="mt-3 max-w-[46ch] text-muted">{f.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
