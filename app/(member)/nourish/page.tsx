import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice, buttonClass } from '@/components/ui';
import { RECIPES, TAG_LABELS, ALLERGEN_LABELS, forMember, type Allergen, type Tag } from '@/lib/nourish/recipes';
import { toggleItem, addItem, clearDone, saveFilters } from './actions';
import { buildPlan, isGoal, isTracking, TRACKING } from '@/lib/nourish/plan';
import { weekIndex } from '@/lib/daily/progress';
import { ukToday, isDay, shiftDay } from '@/lib/daily/day';
import { GoalsForm, type NourishSettings } from '@/components/nourish/GoalsForm';
import { PlanView } from '@/components/nourish/PlanView';
import { DiaryView, type DiaryRow } from '@/components/nourish/DiaryView';

export const metadata = { title: 'Nourish' };
export const dynamic = 'force-dynamic';

const TABS = [['', 'Recipes'], ['plan', 'My plan'], ['diary', 'Food diary'], ['saved', 'Saved'], ['list', 'Shopping list']] as const;

export default async function Nourish({ searchParams }: { searchParams: Promise<{ tab?: string; tag?: string; e?: string; d?: string; edit?: string }> }) {
  const user = await requireUser('/nourish');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: allowed } = await supabase.rpc('has_entitlement', { k: 'nutrition' });
  if (allowed !== true) {
    return (
      <main className="page space-y-4">
        <h1 className="text-[30px] leading-none">Nourish</h1>
        <p className="text-muted">Simple recipes for the way you eat, saved favourites and a shopping list that fills itself. Included with every BAYSE membership and the free trial.</p>
        <Link href="/you/membership" className={buttonClass('primary')}>See memberships</Link>
      </main>
    );
  }
  const today = ukToday();
  const day = isDay(sp.d) && sp.d <= today ? sp.d : today;
  const [{ data: prefs }, { data: filters }, { data: saved }, { data: items }, { data: rawSettings }, { data: diary }] = await Promise.all([
    supabase.from('nutrition_preferences').select('dietary_pattern, foods_to_avoid, cooking_time').eq('user_id', user.id).maybeSingle(),
    supabase.from('nourish_filters').select('hide_allergens').eq('user_id', user.id).maybeSingle(),
    supabase.from('nourish_saved').select('recipe_key').eq('user_id', user.id),
    supabase.from('shopping_items').select('id, item, done').eq('user_id', user.id).order('done').order('created_at'),
    supabase.from('nourish_settings').select('goals, tracking, protein_target, calorie_target').eq('user_id', user.id).maybeSingle(),
    // The chosen day, plus the last week for the streak strip.
    supabase.from('food_diary').select('id, day, meal, label, recipe_key, calories, protein_g, carbs_g, fat_g').eq('user_id', user.id).gte('day', shiftDay(today, -30)).order('created_at'),
  ]);
  const settings: NourishSettings | null = rawSettings ? {
    goals: ((rawSettings.goals ?? []) as string[]).filter(isGoal),
    tracking: isTracking(String(rawSettings.tracking)) ? (rawSettings.tracking as NourishSettings['tracking']) : 'none',
    protein_target: (rawSettings.protein_target as number | null) ?? null,
    calorie_target: (rawSettings.calorie_target as number | null) ?? null,
  } : null;
  const diaryRows = (diary ?? []) as DiaryRow[];
  const hide = (filters?.hide_allergens ?? []) as Allergen[];
  const maxMinutes = prefs?.cooking_time && prefs.cooking_time !== '60+' ? Number(prefs.cooking_time) : null;
  const mine = forMember({ pattern: prefs?.dietary_pattern, avoid: hide, avoidWords: (prefs?.foods_to_avoid as string[] | null) ?? [], maxMinutes });
  const tag = sp.tag && sp.tag in TAG_LABELS ? (sp.tag as Tag) : null;
  const savedKeys = new Set((saved ?? []).map((s) => s.recipe_key as string));
  const tab = sp.tab === 'saved' || sp.tab === 'list' || sp.tab === 'plan' || sp.tab === 'diary' ? sp.tab : '';
  const todayIndex = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
  const shown = tab === 'saved' ? RECIPES.filter((r) => savedKeys.has(r.key)) : mine.filter((r) => !tag || r.tags.includes(tag));
  const back = `/nourish${tab ? `?tab=${tab}` : tag ? `?tag=${tag}` : ''}`;

  return (
    <main className="page space-y-5">
      <div>
        <h1 className="text-[30px] leading-none">Nourish</h1>
        <p className="mt-2 text-muted">Real food that fits real life. Never a crash diet.</p>
      </div>
      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" aria-label="Nourish">
        {TABS.map(([t, l]) => <Link key={t} href={t ? `/nourish?tab=${t}` : '/nourish'} aria-current={tab === t ? 'page' : undefined} className="shrink-0 whitespace-nowrap border border-stone px-4 py-2 text-sm aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-bg">{l}{t === 'list' && (items ?? []).filter((i) => !i.done).length ? ` (${(items ?? []).filter((i) => !i.done).length})` : ''}</Link>)}
      </nav>
      {sp.e && <Notice tone="error">Sorry, that didn&rsquo;t save. Please try again.</Notice>}

      {tab === 'list' ? (
        <section className="space-y-3">
          <form action={addItem} className="flex gap-2">
            <input type="hidden" name="back" value="/nourish?tab=list" />
            <label htmlFor="item" className="sr-only">Add an item</label>
            <input id="item" name="item" maxLength={120} placeholder="Add an item" className="min-h-[44px] w-full border border-stone bg-bg px-3 text-base" />
            <button className={buttonClass('primary')}>Add</button>
          </form>
          {(items ?? []).length ? (
            <ul className="divide-y divide-stone border-y border-stone">
              {(items ?? []).map((i) => (
                <li key={i.id}>
                  <form action={toggleItem} className="flex">
                    <input type="hidden" name="id" value={i.id} /><input type="hidden" name="done" value={i.done ? '1' : '0'} /><input type="hidden" name="back" value="/nourish?tab=list" />
                    <button className={`flex w-full items-center gap-3 py-3 text-left ${i.done ? 'text-muted line-through' : ''}`}>
                      <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center border ${i.done ? 'border-muted bg-muted text-black' : 'border-ink'}`}>{i.done ? '✓' : ''}</span>{i.item}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">Your list is empty. Open a recipe and tap &ldquo;Add ingredients&rdquo;.</p>}
          {(items ?? []).some((i) => i.done) && <form action={clearDone}><input type="hidden" name="back" value="/nourish?tab=list" /><button className="text-sm text-muted underline">Clear ticked items</button></form>}
        </section>
      ) : tab === 'plan' ? (
        !settings || sp.edit ? (
          <section className="space-y-3">
            <p className="text-muted">{settings ? 'Change your goals or how you track at any time.' : 'Two quick questions and BAYSE builds your week of meals from recipes that fit how you eat.'}</p>
            <GoalsForm settings={settings} back="/nourish?tab=plan" />
          </section>
        ) : <PlanView plan={buildPlan(mine, settings.goals, weekIndex(new Date()))} goals={settings.goals} today={todayIndex} />
      ) : tab === 'diary' ? (
        !settings || settings.tracking === 'none' ? (
          <section className="space-y-3">
            <p className="text-muted">{settings ? 'You chose not to track your food, which is absolutely fine. If you would like a diary, pick how you want to track below.' : 'A food diary is optional. Choose a simple log with no numbers, protein only, or full calories and macros.'}</p>
            <GoalsForm settings={settings} back="/nourish?tab=diary" />
          </section>
        ) : (
          <>
            <p className="text-sm text-muted">{TRACKING[settings.tracking].label}. {TRACKING[settings.tracking].about}</p>
            <DiaryView day={day} today={today} rows={diaryRows.filter((r) => r.day === day)} loggedDays={new Set(diaryRows.map((r) => r.day))}
              tracking={settings.tracking} proteinTarget={settings.protein_target} calorieTarget={settings.calorie_target} recipes={mine} />
          </>
        )
      ) : (
        <>
          {tab === '' && !settings && (
            <Link href="/nourish?tab=plan" className="block border border-ink p-4 hover:bg-surface">
              <span className="block font-bold">Tell us your goals and get a plan for the week →</span>
              <span className="mt-1 block text-sm text-muted">Two quick questions. You can also choose to keep a food diary, or not.</span>
            </Link>
          )}
          {tab === '' && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                {prefs?.dietary_pattern ? `${prefs.dietary_pattern}. ` : ''}{maxMinutes ? `Up to ${maxMinutes} minutes. ` : ''}{hide.length ? `Hiding: ${hide.map((h) => ALLERGEN_LABELS[h].toLowerCase()).join(', ')}. ` : ''}
                <Link href="/start/dietary" className="underline">Change how you eat</Link>
              </p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                <Link href="/nourish" aria-current={!tag ? 'true' : undefined} className="shrink-0 border border-stone px-3 py-1.5 text-sm aria-[current=true]:border-ink aria-[current=true]:font-bold">All</Link>
                {(Object.keys(TAG_LABELS) as Tag[]).map((t) => <Link key={t} href={`/nourish?tag=${t}`} aria-current={tag === t ? 'true' : undefined} className="shrink-0 border border-stone px-3 py-1.5 text-sm aria-[current=true]:border-ink aria-[current=true]:font-bold">{TAG_LABELS[t]}</Link>)}
              </div>
            </div>
          )}
          {shown.length ? (
            <ul className="grid gap-x-8 border-t border-stone md:grid-cols-2">
              {shown.map((r) => (
                <li key={r.key} className="border-b border-stone">
                  <Link href={`/nourish/${r.key}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0"><span className="block text-xs uppercase tracking-[0.12em] text-muted">{r.meal}</span><span className="block font-bold">{r.name}</span><span className="block text-sm text-muted">{r.minutes} min · serves {r.serves}{r.tags.includes('high-protein') ? ' · high protein' : ''}{r.video ? ' · ▶ video' : ''}</span></span>
                    <span aria-hidden className="text-muted">{savedKeys.has(r.key) ? '♥' : '›'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="border border-dashed border-stone p-4 text-sm text-muted">{tab === 'saved' ? 'Nothing saved yet. Tap the heart on any recipe.' : 'No recipes match. Try another filter, or change what you are hiding below.'}</p>}

          {tab === '' && (
            <details className="border border-stone p-4">
              <summary className="cursor-pointer font-bold">Hide recipes containing…</summary>
              <form action={saveFilters} className="mt-3 space-y-3">
                <input type="hidden" name="back" value={back} />
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
                    <label key={a} className="cursor-pointer border border-stone px-3 py-1.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
                      <input type="checkbox" name="hide" value={a} defaultChecked={hide.includes(a)} className="sr-only" />{ALLERGEN_LABELS[a]}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted">Private to you. A helpful filter, not a guarantee: always check labels, and follow your doctor or dietitian for allergies and medical diets.</p>
                <button className={buttonClass('primary')}>Save</button>
              </form>
            </details>
          )}
        </>
      )}
    </main>
  );
}
