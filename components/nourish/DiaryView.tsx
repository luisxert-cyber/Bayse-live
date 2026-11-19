import Link from 'next/link';
import { buttonClass } from '@/components/ui';
import { dayLabel, shiftDay } from '@/lib/daily/day';
import { diaryTotals, type Tracking } from '@/lib/nourish/plan';
import type { Meal, Recipe } from '@/lib/nourish/recipes';
import { addDiary, removeDiary } from '@/app/(member)/nourish/actions';

export type DiaryRow = { id: string; day: string; meal: Meal; label: string; recipe_key: string | null; calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null };
const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const field = 'min-h-[44px] w-full border border-stone bg-bg px-3 text-base';

function Bar({ label, value, target, unit }: { label: string; value: number; target: number | null; unit: string }) {
  return (
    <div>
      <p className="flex items-baseline justify-between text-sm"><span className="font-bold">{label}</span><span className="text-muted">{value}{unit}{target ? ` of ${target}${unit}` : ''}</span></p>
      {target ? <div className="mt-1 h-1.5 bg-stone"><div className="h-full bg-white" style={{ width: `${Math.min(100, (value / target) * 100)}%` }} /></div> : null}
    </div>
  );
}

/** One day of the food diary: what was eaten, totals for the member's chosen tracking style, and a form to add more. */
export function DiaryView({ day, today, rows, loggedDays, tracking, proteinTarget, calorieTarget, recipes }: {
  day: string; today: string; rows: DiaryRow[]; loggedDays: Set<string>; tracking: Exclude<Tracking, 'none'>; proteinTarget: number | null; calorieTarget: number | null; recipes: Recipe[];
}) {
  const back = `/nourish?tab=diary${day === today ? '' : `&d=${day}`}`;
  const totals = diaryTotals(rows);
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(today, i - 6));
  const streak = (() => { let n = 0; for (let d = loggedDays.has(today) ? today : shiftDay(today, -1); loggedDays.has(d); d = shiftDay(d, -1)) n++; return n; })();
  const numbers = (r: DiaryRow) => tracking === 'full'
    ? [r.calories != null ? `${r.calories} kcal` : null, r.protein_g != null ? `${r.protein_g}g protein` : null, r.carbs_g != null ? `${r.carbs_g}g carbs` : null, r.fat_g != null ? `${r.fat_g}g fat` : null].filter(Boolean).join(' · ')
    : tracking === 'protein' && r.protein_g != null ? `${r.protein_g}g protein` : '';
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/nourish?tab=diary&d=${shiftDay(day, -1)}`} className="border border-stone px-3 py-2 text-sm" aria-label="Previous day">←</Link>
        <p className="text-center"><span className="block font-bold uppercase tracking-[0.06em]">{day === today ? 'Today' : dayLabel(day)}</span>{day === today && <span className="block text-xs text-muted">{dayLabel(day)}</span>}</p>
        {day < today ? <Link href={`/nourish?tab=diary&d=${shiftDay(day, 1)}`} className="border border-stone px-3 py-2 text-sm" aria-label="Next day">→</Link> : <span className="w-10" />}
      </div>

      <div className="border border-stone p-4">
        <div className="flex items-center justify-between"><p className="eyebrow">Last 7 days</p><p className="text-xs text-muted">{streak ? `${streak}-day streak` : 'Log today to start a streak'}</p></div>
        <ul className="mt-3 grid grid-cols-7 gap-1 text-center">
          {week.map((d) => (
            <li key={d}><Link href={`/nourish?tab=diary&d=${d}`} className={`block border py-2 text-xs ${d === day ? 'border-ink' : 'border-stone'} ${loggedDays.has(d) ? 'bg-ink font-bold text-bg' : 'text-muted'}`}>{dayLabel(d).slice(0, 3)}<span className="block">{loggedDays.has(d) ? '✓' : '·'}</span></Link></li>
          ))}
        </ul>
      </div>

      {tracking !== 'simple' && (
        <div className="grid gap-3 border border-stone p-4 sm:grid-cols-2">
          {tracking === 'full' && <Bar label="Calories" value={totals.calories} target={calorieTarget} unit="" />}
          <Bar label="Protein" value={totals.protein} target={proteinTarget} unit="g" />
          {tracking === 'full' && <Bar label="Carbs" value={totals.carbs} target={null} unit="g" />}
          {tracking === 'full' && <Bar label="Fat" value={totals.fat} target={null} unit="g" />}
        </div>
      )}

      {MEALS.map((meal) => {
        const list = rows.filter((r) => r.meal === meal);
        return (
          <div key={meal}>
            <p className="eyebrow">{meal}</p>
            {list.length ? (
              <ul className="mt-1 divide-y divide-stone border-y border-stone">
                {list.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0"><span className="block font-semibold">{r.label}</span>{numbers(r) && <span className="block text-sm text-muted">{numbers(r)}</span>}</span>
                    <form action={removeDiary}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="back" value={back} /><button className="text-xs text-muted underline">Remove</button></form>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-1 text-sm text-muted">Nothing logged.</p>}
          </div>
        );
      })}

      <form action={addDiary} className="space-y-3 border border-ink p-4">
        <input type="hidden" name="day" value={day} /><input type="hidden" name="back" value={back} />
        <p className="font-bold">Add to {day === today ? 'today' : dayLabel(day)}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Meal</span>
            <select name="meal" defaultValue="Breakfast" className={field}>{MEALS.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="grid gap-1 text-sm"><span>A BAYSE recipe</span>
            <select name="recipe_key" defaultValue="" className={field}><option value="">Not a BAYSE recipe</option>{recipes.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</select></label>
        </div>
        <label className="grid gap-1 text-sm"><span>Or type what you had</span>
          <input name="label" maxLength={120} placeholder="e.g. Chicken salad sandwich" className={field} /></label>
        {tracking !== 'simple' && (
          <div className={`grid gap-3 ${tracking === 'full' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {tracking === 'full' && <label className="grid gap-1 text-sm"><span>Calories</span><input name="calories" type="number" inputMode="numeric" min={0} max={5000} className={field} /></label>}
            <label className="grid gap-1 text-sm"><span>Protein (g)</span><input name="protein_g" type="number" inputMode="numeric" min={0} max={500} className={field} /></label>
            {tracking === 'full' && <label className="grid gap-1 text-sm"><span>Carbs (g)</span><input name="carbs_g" type="number" inputMode="numeric" min={0} max={1000} className={field} /></label>}
            {tracking === 'full' && <label className="grid gap-1 text-sm"><span>Fat (g)</span><input name="fat_g" type="number" inputMode="numeric" min={0} max={500} className={field} /></label>}
          </div>
        )}
        {tracking !== 'simple' && <p className="text-xs text-muted">Pick a BAYSE recipe and the numbers for one serving are filled in for you (approximate). For anything else, add the numbers from the pack if you want them counted.</p>}
        <button className={buttonClass('solid')}>Add</button>
      </form>
      <p className="text-xs text-muted">Private to you: nobody at BAYSE and no other member can see your diary. <Link href="/nourish?tab=plan&edit=1" className="underline">Change how I track, or stop tracking</Link>. General guidance, not medical advice.</p>
    </section>
  );
}
