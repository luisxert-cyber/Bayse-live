// BAYSE website graphics: pure HTML and SVG in black, white, grey and silver.
// No stock photography. These show the real product experience, styled like the app.

import type { ReactNode } from 'react';

/* ---------- Icons (1.6px line, currentColor) ---------- */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const Icon = {
  live: <svg viewBox="0 0 24 24" {...P}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></svg>,
  play: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></svg>,
  plan: <svg viewBox="0 0 24 24" {...P}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M7.5 14.5l2 2 4-4" /></svg>,
  coach: <svg viewBox="0 0 24 24" {...P}><path d="M4 5h16v10H9l-5 4z" /><path d="M8 9h8M8 12h5" /></svg>,
  food: <svg viewBox="0 0 24 24" {...P}><path d="M3 12h18a9 9 0 01-18 0z" /><path d="M8 8c0-2 1.5-2 1.5-4M12 8c0-2 1.5-2 1.5-4M16 8c0-2 1.5-2 1.5-4" /></svg>,
  wellness: <svg viewBox="0 0 24 24" {...P}><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /><path d="M8 12h2l1-2 2 4 1-2h2" /></svg>,
  people: <svg viewBox="0 0 24 24" {...P}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5" /></svg>,
  padel: <svg viewBox="0 0 24 24" {...P}><ellipse cx="10" cy="9" rx="6" ry="6.5" /><path d="M14 14l6 6M7.5 7h.01M10.5 7h.01M9 10h.01M12 10h.01M7.5 12h.01" /><circle cx="19" cy="5" r="1.6" /></svg>,
  walk: <svg viewBox="0 0 24 24" {...P}><circle cx="13" cy="4.5" r="1.8" /><path d="M10 21l2-6-2-3 1-4 4 3h3M12 15l3 6M10 9l-3 3" /></svg>,
  coffee: <svg viewBox="0 0 24 24" {...P}><path d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5z" /><path d="M16 11h1.5a2.5 2.5 0 010 5H16M8 3v3M12 3v3" /></svg>,
  circle: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8" strokeDasharray="2 3" /><circle cx="12" cy="4" r="1.6" /><circle cx="19" cy="15" r="1.6" /><circle cx="5" cy="15" r="1.6" /><circle cx="12" cy="12" r="2.2" /></svg>,
  shield: <svg viewBox="0 0 24 24" {...P}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  clock: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
};

export function IconBadge({ children, size = 'md' }: { children: ReactNode; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-9 w-9 p-2' : 'h-11 w-11 p-2.5';
  return <span className={`silver-border inline-grid ${s} shrink-0 place-items-center rounded-2xl text-silver`}>{children}</span>;
}

/* ---------- Phone frame ---------- */
export function Phone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-[248px] rounded-[40px] bg-[#1b1b1b] p-[7px] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.12)] ${className}`}>
      <div className="relative h-[500px] overflow-hidden rounded-[33px] bg-[#0a0a0a]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

const Bar = ({ v, className = '' }: { v: number; className?: string }) => (
  <div className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}><div className="silver-fill h-full rounded-full" style={{ width: `${v}%` }} /></div>
);

/** The member's Today screen, as a phone graphic. */
export function TodayPhone() {
  return (
    <Phone>
      <div className="px-4 pb-4 pt-10 text-[11px] text-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.3em]">BAYSE</span>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[10px]">B</span>
        </div>
        <p className="mt-4 text-[17px] font-extrabold uppercase leading-tight">Good morning,<br />BAYSE Legend</p>
        <p className="mt-1 text-white/60">Week 2 · Strong &amp; Sculpt</p>
        <div className="mt-3 flex gap-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="flex-1 text-center"><div className={`mx-auto mb-1 h-5 w-5 rounded-full ${i < 2 ? 'silver-fill' : i === 2 ? 'border border-white' : 'border border-white/20'}`} /><span className="text-[9px] text-white/50">{d}</span></div>
        ))}</div>
        <div className="mt-3 rounded-2xl bg-white/[0.06] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/50">Today&rsquo;s session</p>
          <p className="mt-1 text-[13px] font-bold">Full Body Pilates</p>
          <p className="text-white/60">30 min · mat and light weights</p>
          <div className="mt-2.5 rounded-full bg-white py-1.5 text-center text-[11px] font-semibold text-black">Start</div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white/[0.06] p-3">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-[8px] font-bold">LIVE</span>
          <div><p className="font-semibold">Mat Pilates · 7pm</p><p className="text-white/50">Booked · with Emma</p></div>
        </div>
        <div className="mt-2 rounded-2xl bg-white/[0.06] p-3">
          <div className="flex justify-between"><span className="text-white/60">This week</span><span className="font-semibold">2 of 3</span></div>
          <Bar v={66} className="mt-2" />
        </div>
        <div className="mt-2 rounded-2xl bg-white/[0.06] p-3">
          <p className="text-white/60">Your coach</p>
          <p className="mt-0.5">&ldquo;Brilliant start. Keep the ribs soft in the hundreds.&rdquo;</p>
        </div>
      </div>
    </Phone>
  );
}

/** A live class: instructor video, spotter feedback, participants. */
export function LiveClassGraphic({ photo }: { photo: string }) {
  return (
    <div className="silver-border overflow-hidden p-0 shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden ">
        <img src={photo} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE · 38 joined</span>
        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">Mat Pilates · 22:41</span>
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12px] text-black shadow">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">Spotter · Hannah</p>
            Lovely work. Lengthen through the back of the neck.
          </div>
          <div className="flex gap-1.5 text-[15px]">{['👏', '💪', '🔥'].map((e) => <span key={e} className="grid h-8 w-8 place-items-center rounded-full bg-black/60 backdrop-blur">{e}</span>)}</div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5 bg-[#111] p-2">
        {['SB', 'AK', 'LM', 'RJ', 'CT', '+33'].map((n, i) => (
          <div key={n} className={`grid aspect-[4/3] place-items-center rounded-lg text-[10px] font-semibold ${i === 0 ? 'silver-fill' : 'bg-white/[0.07] text-white/60'}`}>{n}</div>
        ))}
      </div>
    </div>
  );
}

/** Coaching: a short conversation. */
export function CoachGraphic() {
  return (
    <div className="space-y-2 border border-stone bg-[#111] p-4 text-[12.5px]">
      <div className="flex items-center gap-2 pb-1"><span className="silver-fill grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold">E</span><div><p className="font-semibold leading-none">Emma</p><p className="text-[11px] text-muted">Your BAYSE coach · replies within a day</p></div></div>
      <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.08] px-3 py-2">How did week 1 feel? Anything sore?</p>
      <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-white px-3 py-2 text-black">Good! Lower back a bit tight after bridges.</p>
      <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-white/[0.08] px-3 py-2">Thanks for telling me. I&rsquo;ve swapped Thursday for Mobility &amp; Restore. 💛</p>
    </div>
  );
}

/** Nutrition: a recipe and its shopping list. */
export function NutritionGraphic() {
  return (
    <div className="border border-stone bg-[#111] p-4 text-[12.5px]">
      <div className="flex items-center justify-between"><p className="font-semibold">Lemon chicken traybake</p><span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-muted">25 min</span></div>
      <p className="text-[11px] text-muted">High protein · serves 2 · added to Tuesday</p>
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">Shopping list</p>
        {[['Chicken thighs', true], ['Lemons ×2', true], ['Cherry tomatoes', false], ['Greek yoghurt', false]].map(([item, done]) => (
          <p key={String(item)} className="flex items-center gap-2 py-0.5">
            <span className={`grid h-4 w-4 place-items-center rounded-[5px] text-[9px] ${done ? 'silver-fill' : 'border border-white/30'}`}>{done ? '✓' : ''}</span>
            <span className={done ? 'text-muted line-through' : ''}>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/** Wellness: a private daily check-in. */
export function WellnessGraphic() {
  return (
    <div className="border border-stone bg-[#111] p-4 text-[12.5px]">
      <div className="flex items-center justify-between"><p className="font-semibold">Today&rsquo;s check-in</p><span className="flex items-center gap-1 text-[10px] text-muted"><span className="h-3 w-3">{Icon.shield}</span>Private</span></div>
      {[['Energy', 4], ['Sleep', 3], ['Mood', 4]].map(([label, v]) => (
        <div key={String(label)} className="mt-3">
          <p className="mb-1.5 text-muted">{label}</p>
          <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2 flex-1 rounded-full ${n <= Number(v) ? 'silver-fill' : 'bg-white/10'}`} />)}</div>
        </div>
      ))}
      <p className="mt-3 rounded-xl bg-white/[0.06] px-3 py-2 text-[11.5px] text-white/80">Low on sleep? Today&rsquo;s suggestion: a 20-minute Mobility &amp; Restore.</p>
    </div>
  );
}

/** Clubs: a member-made padel game. */
export function ActivityGraphic() {
  return (
    <div className="silver-border p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.16em] text-muted">Padel Club · set up by Amy</p><p className="mt-1 text-lg font-bold">Saturday padel</p><p className="text-sm text-muted">10:00 · Altrincham · Doubles · Beginner friendly</p></div>
        <IconBadge size="sm">{Icon.padel}</IconBadge>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="flex -space-x-2">{['A', 'B', 'C'].map((x) => <span key={x} className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#151515] bg-white/15 text-[10px]">{x}</span>)}<span className="grid h-7 w-7 place-items-center rounded-full border-2 border-dashed border-white/30" /></span>3 of 4 players</span><span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">1 space</span></div>
      <Bar v={75} className="mt-3" />
      <div className="mt-4 rounded-full bg-white py-2.5 text-center text-sm font-semibold text-black">Join game</div>
    </div>
  );
}

/** Programme: weeks with progress. */
export function ProgrammeGraphic() {
  return (
    <div className="border border-stone bg-[#111] p-5">
      <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.16em] text-muted">Your programme</p><p className="mt-1 text-lg font-bold">Strong &amp; Sculpt</p></div><p className="silver-text text-3xl font-extrabold">8 wks</p></div>
      <div className="mt-4 space-y-2.5">
        {[['Week 1', 'Foundations of strength', 100], ['Week 2', 'Add light weights', 66], ['Week 3', 'Build the burn', 0], ['Week 4', 'Recovery week', 0]].map(([w, t, v]) => (
          <div key={String(w)} className="flex items-center gap-3">
            <span className="w-12 text-xs text-muted">{w}</span>
            <div className="flex-1"><p className="text-[13px]">{t}</p><Bar v={Number(v)} className="mt-1" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
