'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { RECIPES, ALLERGEN_LABELS, forMember, type Allergen } from '@/lib/nourish/recipes';
import { buildPlan, planIngredients, isGoal, isTracking } from '@/lib/nourish/plan';
import { weekIndex } from '@/lib/daily/progress';

const back = (f: FormData) => { const b = String(f.get('back') ?? '/nourish'); return b.startsWith('/nourish') ? b : '/nourish'; };
async function db() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=/nourish');
  return { supabase, me: user.id };
}
function done(f: FormData, error?: { message: string } | null): never {
  revalidatePath('/nourish', 'layout');
  redirect(error ? `${back(f).split('?')[0]}?e=1` : back(f));
}

export async function toggleSave(f: FormData) {
  const { supabase, me } = await db();
  const key = String(f.get('key'));
  if (!RECIPES.some((r) => r.key === key)) done(f, { message: 'unknown' });
  const { error } = f.get('on') === '1'
    ? await supabase.from('nourish_saved').delete().eq('user_id', me).eq('recipe_key', key)
    : await supabase.from('nourish_saved').upsert({ user_id: me, recipe_key: key }, { onConflict: 'user_id,recipe_key', ignoreDuplicates: true });
  done(f, error);
}
export async function addIngredients(f: FormData) {
  const { supabase, me } = await db();
  const r = RECIPES.find((x) => x.key === String(f.get('key')));
  if (!r) done(f, { message: 'unknown' });
  const { error } = await supabase.from('shopping_items').insert(r.ingredients.map((item) => ({ user_id: me, item, recipe_key: r.key })));
  done(f, error);
}
export async function addItem(f: FormData) {
  const { supabase, me } = await db();
  const item = String(f.get('item') ?? '').trim().slice(0, 120);
  if (!item) done(f);
  const { error } = await supabase.from('shopping_items').insert({ user_id: me, item });
  done(f, error);
}
export async function toggleItem(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('shopping_items').update({ done: f.get('done') !== '1' }).eq('id', String(f.get('id'))).eq('user_id', me);
  done(f, error);
}
export async function clearDone(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('shopping_items').delete().eq('user_id', me).eq('done', true);
  done(f, error);
}
export async function saveFilters(f: FormData) {
  const { supabase, me } = await db();
  const hide = f.getAll('hide').map(String).filter((a) => a in ALLERGEN_LABELS);
  const { error } = await supabase.from('nourish_filters').upsert({ user_id: me, hide_allergens: hide, updated_at: new Date().toISOString() });
  done(f, error);
}

// ---------- Goals, plan and food diary ----------
const num = (f: FormData, k: string, min: number, max: number) => {
  const raw = String(f.get(k) ?? '').trim();
  if (!raw) return null;
  const n = Math.round(Number(raw));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime());

/** Saves the member's food goals and how (or whether) they want to track. */
export async function saveGoals(f: FormData) {
  const { supabase, me } = await db();
  const goals = f.getAll('goals').map(String).filter(isGoal);
  const t = String(f.get('tracking') ?? 'none');
  const tracking = isTracking(t) ? t : 'none';
  const { error } = await supabase.from('nourish_settings').upsert({
    user_id: me, goals, tracking,
    // Targets are optional and always the member's own number. Only kept for the tracking style that uses them.
    protein_target: tracking === 'protein' || tracking === 'full' ? num(f, 'protein_target', 20, 300) : null,
    calorie_target: tracking === 'full' ? num(f, 'calorie_target', 1200, 6000) : null,
    updated_at: new Date().toISOString(),
  });
  done(f, error);
}

/** Adds every ingredient for this week's plan to the shopping list. */
export async function addPlanToList(f: FormData) {
  const { supabase, me } = await db();
  const [{ data: prefs }, { data: filters }, { data: settings }] = await Promise.all([
    supabase.from('nutrition_preferences').select('dietary_pattern, foods_to_avoid, cooking_time').eq('user_id', me).maybeSingle(),
    supabase.from('nourish_filters').select('hide_allergens').eq('user_id', me).maybeSingle(),
    supabase.from('nourish_settings').select('goals').eq('user_id', me).maybeSingle(),
  ]);
  const maxMinutes = prefs?.cooking_time && prefs.cooking_time !== '60+' ? Number(prefs.cooking_time) : null;
  const mine = forMember({ pattern: prefs?.dietary_pattern, avoid: (filters?.hide_allergens ?? []) as Allergen[], avoidWords: (prefs?.foods_to_avoid as string[] | null) ?? [], maxMinutes });
  const plan = buildPlan(mine, ((settings?.goals ?? []) as string[]).filter(isGoal), weekIndex(new Date()));
  // One line per different ingredient, so the list stays short enough to shop from.
  const seen = new Set<string>();
  const rows = planIngredients(plan).filter((r) => (seen.has(r.item) ? false : (seen.add(r.item), true))).slice(0, 120).map((r) => ({ user_id: me, item: r.item, recipe_key: r.recipe_key }));
  if (!rows.length) done(f);
  const { error } = await supabase.from('shopping_items').insert(rows);
  done(f, error);
}

/** Adds something to the food diary: a BAYSE recipe (numbers filled in for one serving) or anything typed in. */
export async function addDiary(f: FormData) {
  const { supabase, me } = await db();
  const day = String(f.get('day') ?? '');
  const meal = String(f.get('meal') ?? '');
  if (!isDay(day) || !['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(meal)) done(f, { message: 'invalid' });
  const r = RECIPES.find((x) => x.key === String(f.get('recipe_key') ?? ''));
  const label = (String(f.get('label') ?? '').trim() || r?.name || '').slice(0, 120);
  if (!label) done(f, { message: 'empty' });
  const { error } = await supabase.from('food_diary').insert({
    user_id: me, day, meal, label, recipe_key: r?.key ?? null,
    calories: num(f, 'calories', 0, 5000) ?? r?.per.kcal ?? null,
    protein_g: num(f, 'protein_g', 0, 500) ?? r?.per.protein ?? null,
    carbs_g: num(f, 'carbs_g', 0, 1000) ?? r?.per.carbs ?? null,
    fat_g: num(f, 'fat_g', 0, 500) ?? r?.per.fat ?? null,
  });
  done(f, error);
}
export async function removeDiary(f: FormData) {
  const { supabase, me } = await db();
  const { error } = await supabase.from('food_diary').delete().eq('id', String(f.get('id'))).eq('user_id', me);
  done(f, error);
}
