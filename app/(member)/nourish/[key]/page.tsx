import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { buttonClass } from '@/components/ui';
import { RECIPES, TAG_LABELS, ALLERGEN_LABELS } from '@/lib/nourish/recipes';
import { toggleSave, addIngredients } from '../actions';

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
      <section>
        <p className="eyebrow">Ingredients</p>
        <ul className="mt-2 divide-y divide-stone border-y border-stone">{r.ingredients.map((i) => <li key={i} className="py-2">{i}</li>)}</ul>
      </section>
      <section>
        <p className="eyebrow">Method</p>
        <ol className="mt-2 space-y-3">{r.steps.map((s, i) => <li key={i} className="flex gap-3"><span className="font-bold text-muted">{i + 1}</span><span>{s}</span></li>)}</ol>
      </section>
      <p className="text-xs text-muted">{r.allergens.length ? `Contains: ${r.allergens.map((a) => ALLERGEN_LABELS[a].toLowerCase()).join(', ')}. ` : 'No common allergens in the main ingredients. '}Always check your labels. General guidance, not medical advice.</p>
    </main>
  );
}
