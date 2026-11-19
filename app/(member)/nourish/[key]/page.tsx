import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { buttonClass } from '@/components/ui';
import { RECIPES, TAG_LABELS, ALLERGEN_LABELS } from '@/lib/nourish/recipes';
import { toggleSave, addIngredients, addDiary } from '../actions';
import { ukToday } from '@/lib/daily/day';
import { isTracking } from '@/lib/nourish/plan';

export const dynamic = 'force-dynamic';

export default async function RecipePage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ e?: string }> }) {
  const { key } = await params;
  const r = RECIPES.find((x) => x.key === key);
  if (!r) notFound();
  const user = await requireUser(`/nourish/${key}`);
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: allowed } = await supabase.rpc('has_entitlement', { k: 'nutrition' });
  if (allowed !== true) redirect('/nourish');
  const { data: saved } = await supabase.from('nourish_saved').select('recipe_key').eq('user_id', user.id).eq('recipe_key', key).maybeSingle();
  const { data: settings } = await supabase.from('nourish_settings').select('tracking').eq('user_id', user.id).maybeSingle();
  const tracking = settings && isTracking(String(settings.tracking)) ? String(settings.tracking) : 'none';
  const back = `/nourish/${key}`;
  return (
    <main className="page space-y-5">
      <Link href="/nourish" className="text-sm text-muted hover:text-ink">← Nourish</Link>
      <div>
        <p className="eyebrow">{r.meal} · {r.minutes} min · serves {r.serves}</p>
        <h1 className="mt-2 text-[30px] leading-none">{r.name}</h1>
        <p className="mt-3 flex flex-wrap gap-1.5">{r.tags.map((t) => <span key={t} className="border border-stone px-2 py-0.5 text-xs">{TAG_LABELS[t]}</span>)}</p>
      </div>
      {sp.e && <p className="text-sm">Sorry, that didn&rsquo;t save. Please try again.</p>}
      <div className="flex flex-wrap gap-2">
        <form action={toggleSave}><input type="hidden" name="key" value={r.key} /><input type="hidden" name="on" value={saved ? '1' : '0'} /><input type="hidden" name="back" value={back} />
          <button className={buttonClass(saved ? 'solid' : 'primary')}>{saved ? '♥ Saved' : '♡ Save'}</button></form>
        <form action={addIngredients}><input type="hidden" name="key" value={r.key} /><input type="hidden" name="back" value="/nourish?tab=list" />
          <button className={buttonClass('secondary')}>Add ingredients to my list</button></form>
      </div>
      {tracking !== 'none' && (
        <form action={addDiary} className="flex flex-wrap items-end gap-2 border border-stone p-3">
          <input type="hidden" name="recipe_key" value={r.key} /><input type="hidden" name="day" value={ukToday()} /><input type="hidden" name="back" value="/nourish?tab=diary" />
          <label className="grid gap-1 text-sm"><span className="text-muted">Add to today&rsquo;s food diary as</span>
            <select name="meal" defaultValue={r.meal} className="min-h-[44px] border border-stone bg-bg px-3 text-base">{['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((m) => <option key={m}>{m}</option>)}</select></label>
          <button className={buttonClass('secondary')}>Add to diary</button>
        </form>
      )}
      {r.video && (
        <section>
          <p className="eyebrow">Watch it being made</p>
          <div className="mt-2 aspect-video w-full border border-stone bg-surface">
            <iframe src={`https://www.youtube-nocookie.com/embed/${r.video.id}?rel=0`} title={`Video: a recipe like ${r.name}`} loading="lazy" allowFullScreen
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" />
          </div>
          <p className="mt-2 text-xs text-muted">A free YouTube video by {r.video.by}, showing a very similar recipe. Quantities and steps may differ a little from ours below: follow the BAYSE recipe for the shopping list and the numbers.</p>
        </section>
      )}
      <div className="grid gap-6 md:grid-cols-2">
      <section>
        <p className="eyebrow">Ingredients</p>
        <ul className="mt-2 divide-y divide-stone border-y border-stone">{r.ingredients.map((i) => <li key={i} className="py-2">{i}</li>)}</ul>
      </section>
      <section>
        <p className="eyebrow">Method</p>
        <ol className="mt-2 space-y-3">{r.steps.map((s, i) => <li key={i} className="flex gap-3"><span className="font-bold text-muted">{i + 1}</span><span>{s}</span></li>)}</ol>
      </section>
      </div>
      <section>
        <p className="eyebrow">Per serving (approximate)</p>
        <dl className="mt-2 grid grid-cols-4 gap-px border border-stone bg-stone text-center">
          {[[r.per.kcal, 'kcal'], [`${r.per.protein}g`, 'protein'], [`${r.per.carbs}g`, 'carbs'], [`${r.per.fat}g`, 'fat']].map(([n, l]) => (
            <div key={l as string} className="bg-bg px-2 py-3"><dd className="text-lg font-bold leading-none">{n}</dd><dt className="mt-1 text-xs text-muted">{l}</dt></div>
          ))}
        </dl>
      </section>
      <p className="text-xs text-muted">{r.allergens.length ? `Contains: ${r.allergens.map((a) => ALLERGEN_LABELS[a].toLowerCase()).join(', ')}. ` : 'No common allergens in the main ingredients. '}Always check your labels. General guidance, not medical advice.</p>
    </main>
  );
}
