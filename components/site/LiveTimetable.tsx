'use client';
// The weekly live timetable: LIVE NOW classes members can book, and COMING SOON classes with "Notify me".
// Filters for status, day, level, equipment and class type. Opens on today (UK time).
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DAYS, DAY_SHORT, EQUIPMENT_LABEL, equipmentText, clock, partOfDay, type TimetableClass } from '@/lib/site/timetable';

type Status = 'all' | 'live' | 'coming_soon';
const sel = 'min-h-[40px] border border-stone bg-bg px-2 text-sm';

export function LiveTimetable({ classes, liveHref = '/start/welcome', notifyHref = '/sign-in?next=/live%23coming-soon' }: { classes: TimetableClass[]; liveHref?: string; notifyHref?: string }) {
  const [day, setDay] = useState(0); // 0 = whole week
  const [status, setStatus] = useState<Status>('all');
  const [level, setLevel] = useState('');
  const [equip, setEquip] = useState('');
  const [type, setType] = useState('');
  useEffect(() => {
    const wd = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short' }).format(new Date());
    const i = DAY_SHORT.indexOf(wd);
    if (i >= 0) setDay(i + 1);
  }, []);
  const levels = useMemo(() => [...new Set(classes.map((c) => c.level).filter(Boolean))] as string[], [classes]);
  const types = useMemo(() => [...new Set(classes.map((c) => c.class_type).filter(Boolean))] as string[], [classes]);
  const shown = classes.filter((c) => (!day || c.weekday === day) && (status === 'all' || c.status === status) && (!level || c.level === level) && (!equip || c.equipment === equip) && (!type || c.class_type === type));
  const live = classes.filter((c) => c.status === 'live').length;
  const soon = classes.length - live;

  return (
    <div data-timetable>
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em]">{live} available now{soon ? ` · ${soon} more coming soon` : ''}</p>
      <div className="grid grid-cols-4 border border-stone sm:grid-cols-8" role="tablist" aria-label="Day">
        {['Week', ...DAY_SHORT].map((label, j) => (
          <button key={label} type="button" role="tab" aria-selected={j === day} onClick={() => setDay(j)}
            className="border-l border-t border-stone py-2.5 text-center text-[13px] font-bold uppercase first:border-l-0 aria-selected:bg-white aria-selected:text-black sm:border-t-0 [&:nth-child(5)]:border-l-0 sm:[&:nth-child(5)]:border-l">
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Filters">
        {([['all', 'All classes'], ['live', 'Available now'], ['coming_soon', 'Coming soon']] as const).map(([v, l]) => (
          <button key={v} type="button" onClick={() => setStatus(v)} aria-pressed={status === v} className={`min-h-[40px] border px-3 text-xs font-bold uppercase ${status === v ? 'border-white bg-white text-black' : 'border-stone'}`}>{l}</button>
        ))}
        <select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value)} className={sel}><option value="">Any level</option>{levels.map((l) => <option key={l}>{l}</option>)}</select>
        <select aria-label="Equipment" value={equip} onChange={(e) => setEquip(e.target.value)} className={sel}><option value="">Any equipment</option>{Object.entries(EQUIPMENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select aria-label="Class type" value={type} onChange={(e) => setType(e.target.value)} className={sel}><option value="">Any type</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const isLive = c.status === 'live';
          return (
            <li key={c.id} className={`flex flex-col gap-2 p-4 ${isLive ? 'border-2 border-white' : 'border border-dashed border-stone'}`} data-class-status={c.status}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{DAYS[c.weekday - 1]} · {clock(c.starts_at)} UK</p>
                <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${isLive ? 'bg-white text-black' : 'border border-white'}`}>{isLive ? '● Live now' : 'Coming soon'}</span>
              </div>
              <p className="text-xl font-bold uppercase leading-tight">{c.name}</p>
              <p className="text-sm">{c.minutes} minutes · {c.level ?? 'All levels'} · {partOfDay(c.starts_at)}</p>
              <p className="text-sm"><span className="text-muted">Equipment:</span> {equipmentText(c)}</p>
              {c.description && <p className="text-sm text-muted">{c.description}</p>}
              <p className="text-xs text-muted" data-class-instructor>{c.instructors.length > 0 ? `With ${c.instructors.join(' and ')}` : 'Instructor announced soon'}</p>
              <div className="mt-auto pt-2">
                {isLive
                  ? <Link href={liveHref} className="inline-flex min-h-[44px] w-full items-center justify-center bg-white px-4 text-xs font-bold uppercase text-black">Book class</Link>
                  : <Link href={notifyHref} className="inline-flex min-h-[44px] w-full items-center justify-center border border-white px-4 text-xs font-bold uppercase hover:bg-white hover:text-black">Notify me when it launches</Link>}
              </div>
            </li>
          );
        })}
        {!shown.length && <li className="border border-dashed border-stone p-6 text-center text-sm text-muted sm:col-span-2 lg:col-span-3">No classes match those filters.</li>}
      </ul>
    </div>
  );
}
