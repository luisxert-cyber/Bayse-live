'use client';
// Swipe-left tour of the member app inside a phone: a day in the life of a BAYSE member.
// Black, like the real app: the same colours, tabs and icons members see after they sign in.
import { useEffect, useRef, type ReactNode } from 'react';
import { initPhoneTour } from './phone-tour-behaviour';

const INK = 'text-white';
const Bar = ({ v, className = '' }: { v: number; className?: string }) => (
  <div className={`h-1.5 overflow-hidden rounded-full bg-white/[0.14] ${className}`}><div className="h-full rounded-full bg-white" style={{ width: `${v}%` }} /></div>
);
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#141414] p-3 ${className}`}>{children}</div>
);
const Label = ({ children }: { children: ReactNode }) => <p className="text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white/55">{children}</p>;
const Title = ({ children, script }: { children: ReactNode; script?: string }) => (
  <p className="text-[18px] font-extrabold uppercase leading-[1.05]">{children}{script && <span className="script block text-[19px] normal-case">{script}</span>}</p>
);
const Btn = ({ children, ghost }: { children: ReactNode; ghost?: boolean }) => (
  <span className={`block rounded-full py-1.5 text-center text-[10.5px] font-semibold ${ghost ? 'border border-white/30' : 'bg-white text-black'}`}>{children}</span>
);
const Avatar = ({ i, n }: { i: number; n: string }) => (
  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-black text-[8px] font-bold text-black ${['bg-[#E6DCCF]', 'bg-[#D4C7B7]', 'bg-[#BFB1A0]', 'bg-white'][i % 4]}`}>{n}</span>
);
// The same seven tabs, in the same order and with the same icons, as the real app's menu (components/member/BottomNav.tsx).
const TABS: [label: string, icon: string][] = [
  ['Today', 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z'],
  ['Train', 'M8 5v14l11-7z'],
  ['Live', 'M15 10l5-3v10l-5-3M4 6h11v12H4z'],
  ['Nutrition', 'M7 3v8a3 3 0 006 0V3M10 3v18M17 3c-1.5 2-2 4-2 7h4V3zm2 7v11'],
  ['Progress', 'M12 3a9 9 0 109 9M12 7a5 5 0 105 5M12 12l7-7'],
  ['Community', 'M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5m2-5c3 0 6 2 6 5'],
  ['You', 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9c0-4 4-6 8-6s8 2 8 6'],
];
const Tab = ({ active }: { active: number }) => (
  <div data-tour-tabs className="absolute inset-x-0 bottom-0 grid grid-cols-7 border-t border-white/10 bg-[#0A0A0A]/95 px-1 pb-3 pt-1.5 text-[5.5px] text-white/50">
    {TABS.map(([t, icon], i) => (
      <span key={t} className={`flex flex-col items-center gap-0.5 ${i === active ? `font-bold ${INK}` : ''}`}>
        <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth={i === active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={icon} /></svg>
        {t}
      </span>
    ))}
  </div>
);
function Screen({ children, tab }: { children: ReactNode; tab: number }) {
  return (
    <div className={`relative h-full w-full shrink-0 snap-center overflow-hidden px-4 pb-14 pt-10 text-[11px] ${INK}`}>
      {children}
      <Tab active={tab} />
    </div>
  );
}

export const TOUR_LABELS = [
  'Today: made around you',
  'What’s on near you',
  'Your BAYSE Circle',
  'Live classes: book in a tap',
  'In class, someone watches your form',
  'Your programme, week by week',
  'On demand, whenever suits you',
  'Your coach, in your pocket',
  'Food and wellness, privately yours',
  'Your weekly progress',
];

export type TourPhotos = { hero: string; a: string; b: string; c: string; group?: string };

export function PhoneTour({ photos }: { photos: TourPhotos }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initPhoneTour(ref.current) : undefined), []);

  return (
    <div ref={ref} data-phone-tour data-labels={JSON.stringify(TOUR_LABELS)} className="flex w-full max-w-[300px] flex-col items-center">
      <div className="relative">
        <button type="button" data-prev aria-label="Previous screen" className="absolute -left-12 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-current opacity-60 hover:opacity-100 md:grid">‹</button>
        <button type="button" data-next aria-label="Next screen" className="absolute -right-12 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-current opacity-60 hover:opacity-100 md:grid">›</button>
        <div className="relative w-[256px] rounded-[42px] bg-[#1b1b1b] p-[7px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
          <div className="relative h-[520px] overflow-hidden rounded-[35px] bg-black">
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div data-track tabIndex={0} aria-label="BAYSE app screens, swipe to explore" className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* 1 Today */}
              <Screen tab={0}>
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold tracking-[0.3em]">BAYSE</span><Avatar i={3} n="B" /></div>
                <div className="mt-3"><Title script="BAYSE Legend">Good morning,</Title></div>
                <div className="relative mt-3 h-[118px] overflow-hidden rounded-2xl">
                  <img src={photos.a} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-3 bottom-2.5 text-white">
                    <p className="text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white/75">Your next session</p>
                    <div className="flex items-end justify-between"><p className="text-[13px] font-bold leading-tight">Core &amp; Glutes<br /><span className="font-normal text-white/80">25 min · Week 2</span></p><span className="rounded-full bg-[#141414] px-3 py-1 text-[10px] font-semibold text-white">Start</span></div>
                  </div>
                </div>
                <Card className="mt-2">
                  <div className="flex items-center justify-between"><Label>Your weekly progress</Label><span className="text-[10px] font-semibold">2 of 3</span></div>
                  <div className="mt-2 flex gap-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="flex-1 text-center"><div className={`mx-auto mb-0.5 grid h-5 w-5 place-items-center rounded-full text-[8px] ${i === 0 || i === 2 ? 'bg-white text-black' : i === 4 ? 'border border-dashed border-white/50' : 'bg-white/[0.08]'}`}>{i === 0 || i === 2 ? '✓' : ''}</div><span className="text-[8.5px] text-white/50">{d}</span></div>
                  ))}</div>
                  <p className="mt-1.5 text-white/65">One more by Friday and that&rsquo;s 3 weeks in a row.</p>
                </Card>
                <Card className="mt-2 flex items-center gap-2.5">
                  <div className="flex -space-x-2">{['A', 'L', 'J'].map((n, i) => <Avatar key={n} i={i} n={n} />)}</div>
                  <div className="min-w-0"><p className="font-semibold">Your Circle · 7am Crew</p><p className="truncate text-white/60">Amy: who&rsquo;s in tomorrow? 🙋‍♀️</p></div>
                </Card>
              </Screen>

              {/* 2 Near you */}
              <Screen tab={5}>
                <Label>Near you · Altrincham</Label>
                <div className="mt-1"><Title script="this week">What&rsquo;s on</Title></div>
                <div className="relative mt-3 h-[92px] overflow-hidden rounded-2xl">
                  <img src={photos.group ?? photos.b} alt="" className="h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white"><p className="text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white/75">Social Club</p><p className="text-[13px] font-bold">Coffee after the 9am</p><p className="text-white/80">Wednesday · 5 going</p></div>
                </div>
                <Card className="mt-2"><Label>Padel Club · Saturday 10:00</Label><div className="mt-1.5 flex items-center justify-between"><div className="flex -space-x-2">{['A', 'K', 'M'].map((n, i) => <Avatar key={n} i={i} n={n} />)}</div><span className="text-white/65">3 of 4 · 1 space</span></div><Bar v={75} className="my-2" /><Btn>Join game</Btn></Card>
                <Card className="mt-2 flex items-center justify-between"><div><Label>Walk Club</Label><p className="mt-0.5 font-semibold">Sunday walk · Dunham · 5 km</p><p className="text-white/60">8 going · easy pace</p></div><span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-semibold">Going</span></Card>
              </Screen>

              {/* 3 Your Circle */}
              <Screen tab={5}>
                <div className="flex items-center gap-2"><div className="flex -space-x-2">{['A', 'L', 'J', '+'].map((n, i) => <Avatar key={n} i={i} n={n} />)}</div><div><p className="text-[13px] font-bold">7am Crew</p><p className="text-white/60">Your Circle · 14 members</p></div></div>
                <Card className="mt-3 text-center"><Label>This month&rsquo;s challenge</Label><p className="mt-0.5 text-[13px] font-bold">12 sessions in November</p><Bar v={62} className="mt-2" /><p className="mt-1 text-white/60">Circle total: 104 of 168</p></Card>
                <div className="mt-3 space-y-2 text-[11px]">
                  <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#141414] px-3 py-2"><span className="block text-[9px] font-semibold text-white/55">Amy</span>Who&rsquo;s in for the 7am tomorrow? 🙋‍♀️</p>
                  <p className="max-w-[80%] rounded-2xl rounded-tl-md bg-[#141414] px-3 py-2"><span className="block text-[9px] font-semibold text-white/55">Laura</span>Me! Then coffee after? ☕</p>
                  <p className="ml-auto max-w-[70%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Count me in, see you both there 💛</p>
                </div>
              </Screen>

              {/* 4 Live timetable */}
              <Screen tab={2}>
                <Title script="classes">Live</Title>
                <div className="mt-3 flex gap-1">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => <span key={d} className={`flex-1 rounded-full py-1.5 text-center text-[9px] ${i === 2 ? 'bg-white font-semibold text-black' : 'bg-[#141414] text-white/65'}`}>{d}</span>)}</div>
                <div className="mt-3 space-y-2">
                  {[['7am', 'Wake-up Flow', 'Hannah & Emma', 'Booked'], ['9am', 'Mat Pilates', 'Emma & Jess', 'Book'], ['7pm', 'Signature Sculpt', 'Jess & Hannah', 'Book']].map(([t, n, who, s]) => (
                    <Card key={t} className="flex items-center gap-3">
                      <span className="w-9 text-[13px] font-bold">{t}</span>
                      <div className="flex-1"><p className="font-semibold">{n}</p><p className="text-white/60">45 min · {who}</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s === 'Booked' ? 'border border-white/30' : 'bg-white text-black'}`}>{s}</span>
                    </Card>
                  ))}
                </div>
                <p className="mt-3 text-white/60">Book your place, see who else is coming, and join from 15 minutes before.</p>
              </Screen>

              {/* 5 In class */}
              <Screen tab={2}>
                <div className="relative -mx-4 -mt-10 h-[290px] overflow-hidden">
                  <img src={photos.hero} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                  <span className="absolute left-3 top-9 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9.5px] font-semibold text-white"><span className="h-1.5 w-1.5 rounded-full bg-[#141414]" />LIVE · 38</span>
                </div>
                <div className="relative -mt-14 space-y-2">
                  <Card><Label>Spotter · Hannah</Label><p className="mt-0.5">Lovely work. Long through the back of the neck.</p></Card>
                  <div className="flex gap-1.5 text-[14px]">{['👏', '💪', '🔥'].map((e) => <span key={e} className="grid h-8 w-8 place-items-center rounded-full bg-[#141414]">{e}</span>)}</div>
                </div>
              </Screen>

              {/* 6 Programme */}
              <Screen tab={1}>
                <Label>Your programme</Label>
                <div className="mt-1"><Title>Strong &amp; Sculpt</Title></div>
                <p className="mt-1 text-white/65">Week 2 of 8 · 3 sessions a week</p>
                <Bar v={22} className="mt-3" />
                <div className="mt-3 space-y-2">
                  {[['Mon', 'Full Body Pilates', '30 min', true], ['Wed', 'Core & Glutes', '25 min', true], ['Fri', 'Sculpt with weights', '35 min', false], ['Sun', 'Mobility & Restore', '20 min', false]].map(([d, n, m, done]) => (
                    <Card key={String(d)} className="flex items-center gap-3">
                      <span className="w-7 text-white/55">{d}</span>
                      <div className="flex-1"><p className="font-semibold">{n}</p><p className="text-white/60">{m}</p></div>
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${done ? 'bg-white text-black' : 'border border-white/30'}`}>{done ? '✓' : ''}</span>
                    </Card>
                  ))}
                </div>
                <p className="mt-3 text-white/60">Busy week? Swap any session in a tap.</p>
              </Screen>

              {/* 7 On demand */}
              <Screen tab={1}>
                <Title script="any time">Train</Title>
                <div className="mt-2 flex gap-1.5 overflow-hidden">{['All', '10 min', 'Core', 'Glutes', 'Mobility'].map((c, i) => <span key={c} className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${i === 0 ? 'bg-white text-black' : 'bg-[#141414]'}`}>{c}</span>)}</div>
                <div className="relative mt-3 h-[120px] overflow-hidden rounded-2xl">
                  <img src={photos.c} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-3 bottom-2.5 text-white"><p className="text-[13px] font-bold">Mat Pilates Flow</p><p className="text-white/80">30 min · All levels · with Emma</p></div>
                  <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#141414]/90 text-[11px] text-white">▶</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[[photos.a, 'Core Burner', '15 min'], [photos.b, 'Glutes & Legs', '25 min']].map(([src, t, m]) => (
                    <div key={t}><div className="h-[74px] overflow-hidden rounded-xl"><img src={src} alt="" className="h-full w-full object-cover" /></div><p className="mt-1 font-semibold">{t}</p><p className="text-white/60">{m}</p></div>
                  ))}
                </div>
              </Screen>

              {/* 8 Coach */}
              <Screen tab={6}>
                <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[12px] font-bold text-black">E</span><div><p className="text-[13px] font-bold">Emma</p><p className="text-white/60">Your coach · replies within a day</p></div></div>
                <div className="mt-4 space-y-2 text-[11px]">
                  <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#141414] px-3 py-2">How did week 1 feel? Anything sore?</p>
                  <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Good! Lower back a bit tight after bridges.</p>
                  <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-[#141414] px-3 py-2">Thanks for telling me. I&rsquo;ve swapped Thursday for Mobility &amp; Restore 💛</p>
                  <p className="ml-auto max-w-[60%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Perfect, thank you!</p>
                </div>
                <div className="absolute inset-x-4 bottom-14 rounded-full bg-[#141414] px-3 py-2 text-white/50">Message Emma…</div>
              </Screen>

              {/* 9 Food and wellness */}
              <Screen tab={3}>
                <Title script="for you">This week,</Title>
                <Card className="mt-3"><Label>Tonight&rsquo;s dinner</Label><p className="mt-0.5 text-[12.5px] font-bold">Lemon chicken traybake</p><p className="text-white/60">30 min · serves 2 · on your shopping list</p></Card>
                <Card className="mt-2">
                  <div className="flex items-center justify-between"><Label>Check-in</Label><span className="text-[9px] text-white/55">🔒 Private to you</span></div>
                  {[['Energy', 4], ['Sleep', 2], ['Mood', 4]].map(([l, v]) => (
                    <div key={String(l)} className="mt-2"><p className="mb-1 text-white/65">{l}</p><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2 flex-1 rounded-full ${n <= Number(v) ? 'bg-white' : 'bg-white/[0.14]'}`} />)}</div></div>
                  ))}
                </Card>
                <Card className="mt-2"><Label>Suggested for today</Label><p className="mt-0.5 font-semibold">Low on sleep? Try a gentle 20-minute Mobility &amp; Restore.</p></Card>
              </Screen>

              {/* 10 Progress */}
              <Screen tab={4}>
                <Title script="progress">Your</Title>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                  {[['24', 'classes'], ['11h', 'moving'], ['6', 'week streak']].map(([n, l]) => <Card key={l} className="px-1"><p className="text-[18px] font-extrabold">{n}</p><p className="text-[9px] text-white/60">{l}</p></Card>)}
                </div>
                <Card className="mt-2">
                  <Label>Sessions per week</Label>
                  <div className="mt-2 flex h-20 items-end gap-1.5">{[1, 2, 2, 3, 2, 3, 3, 4].map((v, i) => <div key={i} className={`flex-1 rounded-t-md ${i === 7 ? 'bg-white' : 'bg-white/[0.18]'}`} style={{ height: `${v * 25}%` }} />)}</div>
                </Card>
                <Card className="mt-2 flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[12px] font-extrabold text-black">25</span><div><p className="font-semibold">25 classes, legend!</p><p className="text-white/60">Share it with your Circle?</p></div></Card>
              </Screen>

            </div>
          </div>
        </div>
      </div>
      <p data-caption aria-live="polite" className="mt-5 h-5 text-center text-sm font-semibold">{TOUR_LABELS[0]}</p>
      <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Choose a screen">
        {TOUR_LABELS.map((l, i) => (
          <button key={l} type="button" data-dot aria-label={l} aria-current={i === 0 ? 'true' : 'false'} className="h-1.5 w-1.5 rounded-full bg-current opacity-30 transition-all aria-[current=true]:w-5 aria-[current=true]:opacity-100" />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted md:hidden">Swipe to explore →</p>
    </div>
  );
}
