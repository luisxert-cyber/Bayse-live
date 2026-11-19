import Link from 'next/link';
import { buttonClass } from '@/components/ui';
import { GOALS, type Goal, type PlanDay } from '@/lib/nourish/plan';
import { addPlanToList } from '@/app/(member)/nourish/actions';

/** The member's week of meals, a day per card. `today` (0 = Monday) is marked so they can see where they are. */
export function PlanView({ plan, goals, today }: { plan: PlanDay[]; goals: Goal[]; today: number }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {goals.length ? `Built around: ${goals.map((g) => GOALS[g].label.toLowerCase()).join(', ')}. ` : 'A balanced week. '}
          <Link href="/nourish?tab=plan&edit=1" className="underline">Change my goals</Link>
        </p>
        <form action={addPlanToList}><input type="hidden" name="back" value="/nourish?tab=list" /><button className={buttonClass('primary')}>Add the week to my shopping list</button></form>
      </div>
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {plan.map((d, i) => (
          <li key={d.day} className={`border p-4 ${i === today ? 'border-ink' : 'border-stone'}`}>
            <p className="flex items-center justify-between"><span className="font-bold uppercase tracking-[0.06em]">{d.day}</span>{i === today && <span className="bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bg">Today</span>}</p>
            <ul className="mt-2 divide-y divide-stone">
              {d.meals.map((m) => (
                <li key={m.meal}>
                  <Link href={`/nourish/${m.recipe.key}`} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0"><span className="block text-[11px] uppercase tracking-[0.12em] text-muted">{m.meal}</span><span className="block font-semibold leading-tight">{m.recipe.name}</span></span>
                    <span className="shrink-0 text-xs text-muted">{m.recipe.minutes} min</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">A guide, not a rulebook: swap any meal for another recipe, or for whatever is in the fridge. The plan changes every Monday.</p>
    </section>
  );
}
