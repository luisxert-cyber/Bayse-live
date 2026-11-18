'use client';
// Swipe-left tour of the member app inside a phone: what a BAYSE member sees and does.
import { useEffect, useRef, type ReactNode } from 'react';
import { initPhoneTour } from './phone-tour-behaviour';

const Bar = ({ v, className = '' }: { v: number; className?: string }) => (
  <div className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}><div className="silver-fill h-full rounded-full" style={{ width: `${v}%` }} /></div>
);
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`rounded-xl bg-white/[0.07] p-3 ${className}`}>{children}</div>;
const Label = ({ children }: { children: ReactNode }) => <p className="text-[9px] uppercase tracking-[0.18em] text-white/50">{children}</p>;
const Title = ({ children }: { children: ReactNode }) => <p className="text-[17px] font-extrabold uppercase leading-tight">{children}</p>;
const Btn = ({ children, ghost }: { children: ReactNode; ghost?: boolean }) => (
  <span className={`block rounded-full py-1.5 text-center text-[11px] font-semibold ${ghost ? 'border border-white/40 text-white' : 'bg-white text-black'}`}>{children}</span>
);
const Tab = ({ active }: { active: number }) => (
  <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-[#0a0a0a]/95 pb-3 pt-2 text-[8.5px] text-white/45">
    {['Today', 'Train', 'Live', 'Community', 'You'].map((t, i) => <span key={t} className={i === active ? 'font-semibold text-white' : ''}>{t}</span>)}
  </div>
);

function Screen({ children, tab }: { children: ReactNode; tab: number }) {
  return (
    <div className="relative h-full w-full shrink-0 snap-center overflow-hidden px-4 pb-14 pt-10 text-[11px] text-white">
      {children}
      <Tab active={tab} />
    </div>
  );
}

export const TOUR_LABELS = [
  'Today: your plan for the day',
  'Your programme, week by week',
  'On demand: classes any time',
  'Live timetable: book in a tap',
  'In class: your spotter watches your form',
  'Message your coach',
  'Meal plans and shopping lists',
  'Private wellness check-ins',
  'Clubs: padel, walks and socials',
  'Progress and milestones',
];

export function PhoneTour({ photos }: { photos: { live: string; a: string; b: string; c: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initPhoneTour(ref.current) : undefined), []);

  return (
    <div ref={ref} data-phone-tour data-labels={JSON.stringify(TOUR_LABELS)} className="flex w-full max-w-[300px] flex-col items-center">
      <div className="relative">
        <button type="button" data-prev aria-label="Previous screen" className="absolute -left-12 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 text-white hover:bg-white hover:text-black md:grid">‹</button>
        <button type="button" data-next aria-label="Next screen" className="absolute -right-12 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 text-white hover:bg-white hover:text-black md:grid">›</button>
        <div className="relative w-[256px] rounded-[42px] bg-[#1b1b1b] p-[7px] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
          <div className="relative h-[520px] overflow-hidden rounded-[35px] bg-[#0a0a0a]">
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div data-track tabIndex={0} aria-label="BAYSE app screens, swipe to explore" className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* 1 Today */}
              <Screen tab={0}>
                <div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.3em]">BAYSE</span><span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[10px]">S</span></div>
                <div className="mt-4"><Title>Good morning,<br />Sophie</Title></div>
                <p className="mt-1 text-white/60">Week 2 · Strong &amp; Sculpt</p>
                <div className="mt-3 flex gap-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="flex-1 text-center"><div className={`mx-auto mb-1 h-5 w-5 rounded-full ${i < 2 ? 'silver-fill' : i === 2 ? 'border border-white' : 'border border-white/20'}`} /><span className="text-[9px] text-white/50">{d}</span></div>
                ))}</div>
                <Card className="mt-3"><Label>Today&rsquo;s session</Label><p className="mt-1 text-[13px] font-bold">Full Body Pilates</p><p className="mb-2.5 text-white/60">30 min · mat and light weights</p><Btn>Start</Btn></Card>
                <Card className="mt-2 flex items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/30 text-[7.5px] font-bold">LIVE</span><div><p className="font-semibold">Signature Sculpt · 7pm</p><p className="text-white/50">Booked · 45 min</p></div></Card>
                <Card className="mt-2"><div className="flex justify-between"><span className="text-white/60">This week</span><span className="font-semibold">2 of 3</span></div><Bar v={66} className="mt-2" /></Card>
              </Screen>

              {/* 2 Programme */}
              <Screen tab={1}>
                <Label>Your programme</Label>
                <div className="mt-1"><Title>Strong &amp; Sculpt</Title></div>
                <p className="mt-1 text-white/60">Week 2 of 8 · 3 sessions a week</p>
                <Bar v={22} className="mt-3" />
                <div className="mt-4 space-y-2">
                  {[['Mon', 'Full Body Pilates', '30 min', true], ['Wed', 'Core & Glutes', '25 min', true], ['Fri', 'Sculpt with weights', '35 min', false], ['Sun', 'Mobility & Restore', '20 min', false]].map(([d, n, m, done]) => (
                    <Card key={String(d)} className="flex items-center gap-3">
                      <span className="w-7 text-white/50">{d}</span>
                      <div className="flex-1"><p className="font-semibold">{n}</p><p className="text-white/50">{m}</p></div>
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${done ? 'silver-fill' : 'border border-white/30'}`}>{done ? '✓' : ''}</span>
                    </Card>
                  ))}
                </div>
                <p className="mt-3 text-white/50">Busy week? Swap any session in a tap.</p>
              </Screen>

              {/* 3 On demand */}
              <Screen tab={1}>
                <Title>Train</Title>
                <div className="mt-3 rounded-full bg-white/[0.08] px-3 py-1.5 text-white/40">Search classes</div>
                <div className="mt-2 flex gap-1.5 overflow-hidden">{['All', '10 min', 'Core', 'Glutes', 'Mobility'].map((c, i) => <span key={c} className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${i === 0 ? 'bg-white text-black' : 'border border-white/25'}`}>{c}</span>)}</div>
                <div className="mt-3 space-y-2">
                  {[[photos.a, 'Mat Pilates Flow', '30 min · All levels'], [photos.b, 'Core Burner', '15 min · Express'], [photos.c, 'Glutes & Lower Body', '25 min · Light weights']].map(([src, t, m]) => (
                    <div key={t} className="flex gap-2.5 rounded-xl bg-white/[0.07] p-2">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg"><img src={src} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center text-white/90">▶</span></div>
                      <div className="py-1"><p className="font-semibold">{t}</p><p className="text-white/50">{m}</p></div>
                    </div>
                  ))}
                </div>
              </Screen>

              {/* 4 Live timetable */}
              <Screen tab={2}>
                <Title>Live</Title>
                <div className="mt-3 flex gap-1">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => <span key={d} className={`flex-1 rounded-lg py-1.5 text-center text-[9.5px] ${i === 2 ? 'bg-white font-semibold text-black' : 'bg-white/[0.07] text-white/60'}`}>{d}</span>)}</div>
                <div className="mt-3 space-y-2">
                  {[['7am', 'Wake-up Flow', 'Hannah & Emma', 'Booked'], ['9am', 'Mat Pilates', 'Emma & Jess', 'Book'], ['7pm', 'Signature Sculpt', 'Jess & Hannah', 'Book']].map(([t, n, who, s]) => (
                    <Card key={t} className="flex items-center gap-3">
                      <span className="w-9 text-[13px] font-bold">{t}</span>
                      <div className="flex-1"><p className="font-semibold">{n}</p><p className="text-white/50">45 min · {who}</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s === 'Booked' ? 'border border-white/40' : 'bg-white text-black'}`}>{s}</span>
                    </Card>
                  ))}
                </div>
                <p className="mt-3 text-white/50">Two instructors in every class: one teaches, one spots.</p>
              </Screen>

              {/* 5 In class */}
              <Screen tab={2}>
                <div className="-mx-4 -mt-10 relative h-[260px] overflow-hidden">
                  <img src={photos.live} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/40" />
                  <span className="absolute left-3 top-9 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9.5px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-white" />LIVE · 38</span>
                </div>
                <div className="-mt-12 relative space-y-2">
                  <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-black"><p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-black/50">Spotter · Hannah</p>Lovely, Sophie. Long through the back of the neck.</div>
                  <div className="flex gap-1.5 text-[14px]">{['👏', '💪', '🔥'].map((e) => <span key={e} className="grid h-8 w-8 place-items-center rounded-full bg-white/10">{e}</span>)}</div>
                  <div className="grid grid-cols-4 gap-1.5">{['You', 'AK', 'LM', '+35'].map((n, i) => <span key={n} className={`grid h-9 place-items-center rounded-lg text-[9.5px] font-semibold ${i === 0 ? 'silver-fill' : 'bg-white/[0.07] text-white/60'}`}>{n}</span>)}</div>
                </div>
              </Screen>

              {/* 6 Coach */}
              <Screen tab={4}>
                <div className="flex items-center gap-2"><span className="silver-fill grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold">E</span><div><p className="text-[13px] font-bold">Emma</p><p className="text-white/50">Your coach · replies within a day</p></div></div>
                <div className="mt-4 space-y-2 text-[11.5px]">
                  <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.08] px-3 py-2">How did week 1 feel? Anything sore?</p>
                  <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Good! Lower back a bit tight after bridges.</p>
                  <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-white/[0.08] px-3 py-2">Thanks for telling me. I&rsquo;ve swapped Thursday for Mobility &amp; Restore 💛</p>
                  <p className="ml-auto max-w-[60%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Perfect, thank you!</p>
                </div>
                <div className="absolute inset-x-4 bottom-14 rounded-full bg-white/[0.08] px-3 py-2 text-white/40">Message Emma…</div>
              </Screen>

              {/* 7 Nutrition */}
              <Screen tab={4}>
                <Title>Nutrition</Title>
                <p className="mt-1 text-white/60">This week · 2 people · 30 min meals</p>
                <div className="mt-3 space-y-1.5">
                  {[['Breakfast', 'Berry protein oats'], ['Lunch', 'Chicken & quinoa bowl'], ['Dinner', 'Lemon chicken traybake']].map(([m, r]) => (
                    <Card key={m} className="flex justify-between py-2.5"><span className="text-white/50">{m}</span><span className="font-semibold">{r}</span></Card>
                  ))}
                </div>
                <Label><span className="mt-4 block">Shopping list</span></Label>
                <div className="mt-2 space-y-1">
                  {[['Chicken thighs', true], ['Lemons ×2', true], ['Quinoa', false], ['Greek yoghurt', false]].map(([i, d]) => (
                    <p key={String(i)} className="flex items-center gap-2"><span className={`grid h-4 w-4 place-items-center rounded-[4px] text-[8px] ${d ? 'silver-fill' : 'border border-white/30'}`}>{d ? '✓' : ''}</span><span className={d ? 'text-white/40 line-through' : ''}>{i}</span></p>
                  ))}
                </div>
              </Screen>

              {/* 8 Wellness */}
              <Screen tab={4}>
                <div className="flex items-center justify-between"><Title>Check-in</Title><span className="text-[9.5px] text-white/50">🔒 Private to you</span></div>
                <p className="mt-1 text-white/60">How are you today?</p>
                {[['Energy', 4], ['Sleep', 2], ['Mood', 4]].map(([l, v]) => (
                  <div key={String(l)} className="mt-4"><p className="mb-1.5 text-white/60">{l}</p><div className="flex gap-1.5">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2.5 flex-1 rounded-full ${n <= Number(v) ? 'silver-fill' : 'bg-white/10'}`} />)}</div></div>
                ))}
                <Card className="mt-5"><Label>Suggested for today</Label><p className="mt-1 font-semibold">Low on sleep? Try a 20-minute Mobility &amp; Restore.</p></Card>
                <Card className="mt-2"><Label>Learn</Label><p className="mt-1 font-semibold">Training through perimenopause</p><p className="text-white/50">5 min read · reviewed by a physio</p></Card>
              </Screen>

              {/* 9 Community */}
              <Screen tab={3}>
                <Title>Community</Title>
                <div className="mt-2 flex gap-1.5">{['Feed', 'Clubs', 'Circles'].map((c, i) => <span key={c} className={`rounded-full px-2.5 py-1 text-[10px] ${i === 1 ? 'bg-white text-black' : 'border border-white/25'}`}>{c}</span>)}</div>
                <Card className="mt-3">
                  <Label>Padel Club · set up by Amy</Label>
                  <p className="mt-1 text-[13px] font-bold">Saturday padel</p>
                  <p className="text-white/50">10:00 · Altrincham · Beginner friendly</p>
                  <div className="mt-2 flex justify-between"><span>3 of 4 players</span><span className="text-white/60">1 space</span></div>
                  <Bar v={75} className="mt-1.5 mb-2.5" /><Btn>Join game</Btn>
                </Card>
                <Card className="mt-2"><Label>Walk Club</Label><p className="mt-1 font-semibold">Sunday walk · Hale · 5 km</p><p className="text-white/50">8 going</p></Card>
                <Card className="mt-2"><Label>Your Circle</Label><p className="mt-1">&ldquo;Who&rsquo;s in for the 7am tomorrow? 🙋‍♀️&rdquo;</p></Card>
              </Screen>

              {/* 10 Progress */}
              <Screen tab={4}>
                <Title>Progress</Title>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                  {[['24', 'classes'], ['11h', 'trained'], ['6', 'week streak']].map(([n, l]) => <Card key={l} className="px-1"><p className="silver-text text-[18px] font-extrabold">{n}</p><p className="text-[9px] text-white/50">{l}</p></Card>)}
                </div>
                <Card className="mt-2">
                  <Label>Sessions per week</Label>
                  <div className="mt-2 flex h-20 items-end gap-1.5">{[1, 2, 2, 3, 2, 3, 3, 4].map((v, i) => <div key={i} className={`flex-1 rounded-t-sm ${i === 7 ? 'silver-fill' : 'bg-white/20'}`} style={{ height: `${v * 25}%` }} />)}</div>
                </Card>
                <Card className="mt-2 flex items-center gap-3"><span className="silver-fill grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-extrabold">25</span><div><p className="font-semibold">25 classes!</p><p className="text-white/50">Share it with your Circle?</p></div></Card>
              </Screen>

            </div>
          </div>
        </div>
      </div>
      <p data-caption aria-live="polite" className="mt-5 h-5 text-center text-sm font-semibold">{TOUR_LABELS[0]}</p>
      <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Choose a screen">
        {TOUR_LABELS.map((l, i) => (
          <button key={l} type="button" data-dot aria-label={l} aria-current={i === 0 ? 'true' : 'false'} className="h-1.5 w-1.5 rounded-full bg-white/30 transition-all aria-[current=true]:w-5 aria-[current=true]:bg-white" />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted md:hidden">Swipe to explore →</p>
    </div>
  );
}
