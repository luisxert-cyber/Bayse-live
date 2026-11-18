// "Six things that make BAYSE different": each feature leads with its title, then a small, faithful preview of the real screen.
// Example data only; screens mirror what members actually see in the app.
// Previews are always dark (studio look), so they set their own white type and do not follow the page theme.
import type { ReactNode } from 'react';

const SHOT = 'relative h-[300px] w-full overflow-hidden text-white';

const Frame = ({ children }: { children: ReactNode }) => (
  <div className={`${SHOT} flex items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,#23232d_0%,#0a0a0a_72%)] px-5`}>
    <div className="w-full max-w-[320px]">{children}</div>
  </div>
);
const Label = ({ children }: { children: ReactNode }) => <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">{children}</p>;
const Glass = 'border border-white/25 bg-black/60 backdrop-blur';

function Daily() {
  return (
    <div className={SHOT}>
      <img src="/images/studio-bird-dog.webp" alt="A BAYSE instructor in a bird dog on the mat" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.25)_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">Today</span>
        <span className={`flex items-center gap-2 px-2.5 py-1 ${Glass}`}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">1 of 3 this week</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-4 bg-white" />
            <span className="h-1.5 w-4 bg-white/25" />
            <span className="h-1.5 w-4 bg-white/25" />
          </span>
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Your next best move</p>
        <p className="mt-1 text-[28px] font-bold uppercase leading-none">Core Control</p>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/25 pt-3">
          <p className="min-w-0 text-[12px] text-white/75">15 min · Mat · Picked for your goals</p>
          <span className="flex shrink-0 items-center gap-2 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-black">
            <svg viewBox="0 0 10 12" className="h-3 w-2.5" aria-hidden="true"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
            Start
          </span>
        </div>
      </div>
    </div>
  );
}

function Together() {
  return (
    <div className={SHOT}>
      <img src="/images/community-friends.webp" alt="BAYSE members together in the studio" className="absolute inset-0 h-full w-full object-cover object-top" />
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.15)_55%,rgba(0,0,0,0.05)_100%)]" />
      <div className="absolute inset-x-4 bottom-4 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2.5 ${Glass}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center border border-white/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19.5c.6-3.4 3-5.3 6.2-5.3s5.6 1.9 6.2 5.3" /><circle cx="17.2" cy="9" r="2.4" /><path d="M17.4 14.3c2.2.2 3.6 1.7 4 4.2" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Circle</span>
            <span className="block text-[14px] font-bold leading-tight">Early Birds</span>
            <span className="block text-[11px] text-white/70">Trains before work · 7am live</span>
          </span>
          <span className="shrink-0 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black">Join</span>
        </div>
        <div className={`flex items-center gap-3 px-3 py-2.5 ${Glass}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center border border-white/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-10.6a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10.2" r="2.4" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Walk Club</span>
            <span className="block text-[14px] font-bold leading-tight">Sunday morning walk</span>
            <span className="block text-[11px] text-white/70">5 km · easy pace · coffee after</span>
          </span>
          <span className="shrink-0 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black">Join</span>
        </div>
      </div>
    </div>
  );
}

function ProgressShot() {
  return (
    <Frame>
      <div className="grid grid-cols-3 border border-white/20 text-center">
        <div className="py-3"><p className="text-[26px] font-bold leading-none">24</p><p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55">Classes</p></div>
        <div className="border-x border-white/20 py-3"><p className="text-[26px] font-bold leading-none">11h</p><p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55">Trained</p></div>
        <div className="py-3"><p className="text-[26px] font-bold leading-none">6</p><p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55">Week streak</p></div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <Label>Sessions per week</Label>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">Best week yet</p>
      </div>
      <div className="relative mt-2 h-[68px]">
        <span className="absolute inset-x-0 top-0 border-t border-dashed border-white/15" />
        <span className="absolute inset-x-0 top-[50%] border-t border-dashed border-white/15" />
        <div className="absolute inset-0 flex items-end gap-2 border-b border-white/30">
          <span className="h-[25%] flex-1 bg-white/25" />
          <span className="h-[50%] flex-1 bg-white/25" />
          <span className="h-[25%] flex-1 bg-white/25" />
          <span className="h-[75%] flex-1 bg-white/25" />
          <span className="h-[50%] flex-1 bg-white/25" />
          <span className="h-[75%] flex-1 bg-white/25" />
          <span className="h-[100%] flex-1 bg-white" />
        </div>
      </div>
      <div className="mt-1 flex gap-2 text-center text-[9px] text-white/45">
        <span className="flex-1">W1</span><span className="flex-1">W2</span><span className="flex-1">W3</span><span className="flex-1">W4</span><span className="flex-1">W5</span><span className="flex-1">W6</span><span className="flex-1 font-bold text-white">Now</span>
      </div>
      <div className="mt-3 flex items-center gap-3 border border-white/20 bg-white/5 px-3 py-2">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center">
          <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle cx="20" cy="20" r="17" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="102.5 106.8" transform="rotate(-90 20 20)" />
          </svg>
          <span className="relative text-[12px] font-bold">25</span>
        </span>
        <span className="min-w-0 flex-1 text-[12px]"><span className="block font-bold">25 classes</span><span className="block text-white/60">Next milestone</span></span>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]">1 to go</span>
      </div>
    </Frame>
  );
}

const Heart = ({ on }: { on?: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5S3.5 15.3 3.5 9.3A4.6 4.6 0 0112 6.9a4.6 4.6 0 018.5 2.4c0 6-8.5 11.2-8.5 11.2z" /></svg>
);

function Nourish() {
  return (
    <Frame>
      <div className="flex gap-1.5">
        <span className="bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black">High protein</span>
        <span className="border border-white/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white/65">Quick</span>
        <span className="border border-white/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white/65">Vegetarian</span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3 border border-white/20 bg-white/5 px-3 py-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-white text-black">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 11.5h17a8.5 8.5 0 01-17 0z" /><path d="M8 20h8" /><circle cx="9" cy="7.5" r="1.3" /><circle cx="13.5" cy="6" r="1.3" /><circle cx="16.5" cy="8.3" r="1.1" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">Breakfast · 5 min</span>
            <span className="block text-[14px] font-bold leading-tight">Berry protein oats</span>
          </span>
          <Heart on />
        </div>
        <div className="flex items-center gap-3 border border-white/20 bg-white/5 px-3 py-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-white/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="10" width="18" height="8" /><path d="M1.5 10h21" /><path d="M8 6.5c0-1 1-1 1-2M12 6.5c0-1 1-1 1-2M16 6.5c0-1 1-1 1-2" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">Dinner · 40 min</span>
            <span className="block text-[14px] font-bold leading-tight">Lemon chicken traybake</span>
          </span>
          <Heart />
        </div>
      </div>
      <div className="mt-3 border-t border-white/20 pt-3">
        <div className="flex items-baseline justify-between">
          <Label>Shopping list</Label>
          <p className="text-[10px] text-white/55">Added from your recipes</p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
          <span className="flex items-center gap-2 text-white/50 line-through">
            <span className="grid h-4 w-4 shrink-0 place-items-center bg-white text-black"><svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 6.3l2.6 2.6L10 3.3" /></svg></span>
            Chicken thighs
          </span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 border border-white/70" />Greek yoghurt</span>
          <span className="flex items-center gap-2 text-white/50 line-through">
            <span className="grid h-4 w-4 shrink-0 place-items-center bg-white text-black"><svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 6.3l2.6 2.6L10 3.3" /></svg></span>
            Lemons
          </span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 border border-white/70" />Frozen berries</span>
        </div>
      </div>
    </Frame>
  );
}

function LiveCoach() {
  return (
    <div className={SHOT}>
      <img src="/images/studio-mat-core.webp" alt="A BAYSE instructor teaching core work" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.35)_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />Live</span>
        <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 ${Glass}`}>Mat · 45 min</span>
      </div>
      <span className="absolute left-4 top-14 max-w-[70%] bg-white px-3 py-2 text-black">
        <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-black/55">Instructor 2 · to you</span>
        <span className="block text-[12px] font-semibold leading-snug">Lovely form. Relax your shoulders.</span>
      </span>
      <div className="absolute inset-x-4 bottom-4">
        <div className="grid grid-cols-2 gap-2">
          <div className={`px-3 py-2 ${Glass}`}><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Instructor 1</p><p className="text-[12px] font-bold">Teaches the class</p></div>
          <div className={`px-3 py-2 ${Glass}`}><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">Instructor 2</p><p className="text-[12px] font-bold">Watches your form</p></div>
        </div>
      </div>
    </div>
  );
}

const Tick = () => (
  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M2 6.3l2.6 2.6L10 3.3" /></svg>
);

function Rewards() {
  return (
    <Frame>
      <div className="flex items-baseline justify-between">
        <Label>Milestones</Label>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">3 of 5 earned</p>
      </div>
      <div className="relative mt-4">
        <span className="absolute inset-x-6 top-[22px] border-t border-white/20" />
        <span className="absolute left-6 top-[22px] w-[62%] border-t border-white" />
        <div className="relative flex justify-between">
          <span className="flex flex-col items-center gap-1.5"><span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[13px] font-bold text-black">1</span><span className="text-white"><Tick /></span></span>
          <span className="flex flex-col items-center gap-1.5"><span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[13px] font-bold text-black">5</span><span className="text-white"><Tick /></span></span>
          <span className="flex flex-col items-center gap-1.5"><span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[13px] font-bold text-black">10</span><span className="text-white"><Tick /></span></span>
          <span className="flex flex-col items-center gap-1.5">
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#101014]">
              <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                <circle cx="22" cy="22" r="20" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="120.6 125.7" transform="rotate(-90 22 22)" />
              </svg>
              <span className="relative text-[13px] font-bold">25</span>
            </span>
            <span className="text-[9px] font-bold uppercase leading-none tracking-[0.1em]">Next</span>
          </span>
          <span className="flex flex-col items-center gap-1.5"><span className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-white/35 bg-[#101014] text-[13px] font-bold text-white/45">50</span></span>
        </div>
      </div>
      <div className="mt-4 border border-white/20 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-white text-black">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="9" width="17" height="11" /><path d="M2.5 9h19M12 9v11" /><path d="M12 9C10.5 5 6.5 5 7.5 7.5 8 8.7 10 9 12 9zM12 9c1.5-4 5.5-4 4.5-1.5C16 8.7 14 9 12 9z" /></svg>
          </span>
          <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold leading-tight">Member reward</span><span className="block text-[11px] text-white/60">Unlocks at 25 classes</span></span>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]">1 to go</span>
        </div>
        <div className="mt-3 h-1.5 bg-white/15"><div className="h-full w-[96%] bg-white" /></div>
        <div className="mt-1.5 flex justify-between text-[10px] text-white/55"><span>24 of 25 classes</span><span>Keep going</span></div>
      </div>
    </Frame>
  );
}

const FEATURES: { name: string; tag: string; body: string; visual: ReactNode }[] = [
  { name: 'BAYSE Daily', tag: 'Know exactly what to do today', body: 'Open the app and see your next best move, picked for you.', visual: <Daily /> },
  { name: 'BAYSE Together', tag: 'Real friendships, not just classes', body: 'Circles, padel, walks and coffee with members like you.', visual: <Together /> },
  { name: 'BAYSE Progress', tag: 'See how far you have come', body: 'Streaks and milestones. Never the scales.', visual: <ProgressShot /> },
  { name: 'BAYSE Nourish', tag: 'Food that fits real life', body: 'Simple recipes and a shopping list that fills itself.', visual: <Nourish /> },
  { name: 'BAYSE Live Coach', tag: 'Live classes you book like a studio class', body: 'Book your place, see who else is coming and be coached live on Zoom.', visual: <LiveCoach /> },
  { name: 'BAYSE Rewards', tag: 'Showing up adds up', body: 'Unlock member rewards as your classes add up.', visual: <Rewards /> },
];

export function SixFeatures() {
  return (
    <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <article key={f.name} className="flex w-[82%] shrink-0 snap-center flex-col border border-stone sm:w-auto">
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">0{i + 1} · {f.tag}</p>
            <h3 className="mt-2 text-[22px] uppercase leading-tight">{f.name}</h3>
            <p className="mt-1.5 text-[15px] text-muted">{f.body}</p>
          </div>
          <div className="mt-auto border-t border-stone">{f.visual}</div>
        </article>
      ))}
    </div>
  );
}
