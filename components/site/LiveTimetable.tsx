'use client';
// Weekly live timetable: pick a day, see that day's classes as cards. Opens on today (UK time).
import { useEffect, useState } from 'react';

type Day = { day: string; short: string; classes: { time: string; name: string }[] };
const part = (t: string) => (t.endsWith('am') ? 'Morning' : t.startsWith('12') ? 'Lunchtime' : 'Evening');

export function LiveTimetable({ days, minutes }: { days: Day[]; minutes: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const wd = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short' }).format(new Date());
    const idx = days.findIndex((d) => d.short === wd);
    if (idx >= 0) setI(idx);
  }, [days]);
  const d = days[i];
  return (
    <div>
      <div className="grid grid-cols-7 border border-stone" role="tablist" aria-label="Day">
        {days.map((x, j) => (
          <button key={x.day} type="button" role="tab" aria-selected={j === i} onClick={() => setI(j)}
            className="border-l border-stone py-3 text-center first:border-l-0 aria-selected:bg-white aria-selected:text-black">
            <span className="block text-[13px] font-bold uppercase">{x.short}</span>
            <span className="hidden text-[11px] opacity-70 sm:block">{x.classes.length} {x.classes.length === 1 ? 'class' : 'classes'}</span>
          </button>
        ))}
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3" role="tabpanel" aria-label={d.day}>
        {d.classes.map((c) => (
          <li key={c.time} className="flex items-center gap-4 border border-stone p-4 sm:flex-col sm:items-start">
            <span className="w-[78px] shrink-0 text-[30px] font-bold leading-none sm:w-auto sm:text-[40px]">{c.time}</span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{part(c.time)} · {minutes} min</span>
              <span className="mt-0.5 block font-bold">{c.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
