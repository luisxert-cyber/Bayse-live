'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { RECIPES, ALLERGEN_LABELS } from '@/lib/nourish/recipes';

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
