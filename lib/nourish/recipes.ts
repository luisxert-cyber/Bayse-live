// BAYSE Nourish recipe collection. Simple, realistic home cooking: no crash diets, and BAYSE never sets a calorie target.
// Tags drive personalisation; allergens let a member hide recipes that contain what they avoid.
// General guidance only: always check labels, and see a professional for medical dietary needs.

export type Tag = 'high-protein' | 'vegetarian' | 'vegan' | 'pescatarian' | 'quick' | 'family' | 'budget' | 'batch';
export type Allergen = 'gluten' | 'dairy' | 'egg' | 'nuts' | 'peanuts' | 'fish' | 'shellfish' | 'soy' | 'sesame';
export type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
/** Approximate nutrition for one serving, worked out from the ingredients. A guide, not a lab figure. */
export type Nutrition = { kcal: number; protein: number; carbs: number; fat: number };
/** A free YouTube video of a similar recipe being made, played through YouTube's own player. `by` is the channel, shown as the credit. */
export type RecipeVideo = { id: string; by: string };
export type Recipe = { key: string; name: string; meal: Meal; minutes: number; serves: number; tags: Tag[]; allergens: Allergen[]; per: Nutrition; video?: RecipeVideo; ingredients: string[]; steps: string[] };

export const RECIPES: Recipe[] = [
  { key: 'berry-protein-oats', name: 'Berry protein oats', meal: 'Breakfast', minutes: 5, serves: 1, tags: ['high-protein', 'vegetarian', 'quick', 'budget'], allergens: ['gluten', 'dairy'], per: { kcal: 430, protein: 26, carbs: 55, fat: 11 }, video: { id: 'uLHkm1B__O0', by: 'The Vegan Gym' },
    ingredients: ['50g porridge oats', '200ml milk', '100g Greek yoghurt', 'Handful of frozen berries', '1 tsp honey'],
    steps: ['Simmer the oats in the milk for 3 to 4 minutes, stirring.', 'Stir in half the yoghurt.', 'Top with berries, the rest of the yoghurt and honey.'] },
  { key: 'overnight-oats', name: 'Overnight oats, three ways', meal: 'Breakfast', minutes: 5, serves: 1, tags: ['vegetarian', 'quick', 'budget', 'batch'], allergens: ['gluten', 'dairy'], per: { kcal: 380, protein: 17, carbs: 52, fat: 11 }, video: { id: 'bzTeMLwH-cw', by: 'Leah Itsines' },
    ingredients: ['40g porridge oats', '120ml milk', '80g yoghurt', '1 tbsp chia seeds', 'Topping: banana and cinnamon, or apple and nut butter, or berries'],
    steps: ['Mix oats, milk, yoghurt and chia in a jar.', 'Leave in the fridge overnight.', 'Add your topping in the morning.'] },
  { key: 'veggie-egg-muffins', name: 'Veggie egg muffins', meal: 'Breakfast', minutes: 25, serves: 4, tags: ['high-protein', 'vegetarian', 'batch', 'family'], allergens: ['egg', 'dairy'], per: { kcal: 190, protein: 15, carbs: 4, fat: 13 }, video: { id: 'au19Sxcmp6Q', by: 'Gourmet\'s Haven' },
    ingredients: ['8 eggs', 'Handful of spinach, chopped', '1 pepper, diced', '4 spring onions, sliced', '40g feta'],
    steps: ['Heat the oven to 190°C and grease a 12-hole muffin tin.', 'Whisk the eggs and season.', 'Divide the veg and feta between the holes, pour over the egg.', 'Bake for 18 to 20 minutes. Keeps 3 days in the fridge.'] },
  { key: 'smoked-salmon-bagel', name: 'Smoked salmon and avocado bagel', meal: 'Breakfast', minutes: 5, serves: 1, tags: ['high-protein', 'pescatarian', 'quick'], allergens: ['gluten', 'fish', 'dairy', 'sesame'], per: { kcal: 480, protein: 26, carbs: 48, fat: 20 }, video: { id: 'OfAQUxdP4dM', by: 'Dont Go Bacon My Heart' },
    ingredients: ['1 seeded bagel', '1 tbsp light cream cheese', '50g smoked salmon', '½ avocado', 'Lemon and black pepper'],
    steps: ['Toast the bagel.', 'Spread with cream cheese, add salmon and sliced avocado.', 'Finish with lemon and pepper.'] },
  { key: 'chicken-quinoa-bowl', name: 'Chicken and quinoa bowl', meal: 'Lunch', minutes: 20, serves: 2, tags: ['high-protein', 'quick'], allergens: [], per: { kcal: 560, protein: 48, carbs: 45, fat: 20 }, video: { id: 'EG8tpKRRVfk', by: 'Crimp & Bake' },
    ingredients: ['2 chicken breasts', '120g quinoa', '1 cucumber', '200g cherry tomatoes', 'Handful of rocket', '2 tbsp olive oil and lemon'],
    steps: ['Cook the quinoa as the pack says.', 'Season and pan-fry the chicken for 6 to 7 minutes each side until cooked through.', 'Chop the veg, toss with quinoa, oil and lemon.', 'Slice the chicken on top.'] },
  { key: 'chickpea-salad', name: 'Crunchy chickpea salad', meal: 'Lunch', minutes: 10, serves: 2, tags: ['vegan', 'vegetarian', 'quick', 'budget'], allergens: [], per: { kcal: 330, protein: 12, carbs: 34, fat: 16 }, video: { id: 'jWCrEAvSZ8g', by: 'Clean & Delicious' },
    ingredients: ['1 tin chickpeas, drained', '1 red pepper', '½ cucumber', '½ red onion', 'Parsley', '2 tbsp olive oil, lemon, salt'],
    steps: ['Dice the veg.', 'Mix with the chickpeas and parsley.', 'Dress with oil, lemon and salt. Better after 10 minutes.'] },
  { key: 'tuna-bean-wrap', name: 'Tuna, bean and sweetcorn wraps', meal: 'Lunch', minutes: 10, serves: 2, tags: ['high-protein', 'pescatarian', 'quick', 'budget'], allergens: ['gluten', 'fish', 'dairy'], per: { kcal: 390, protein: 34, carbs: 44, fat: 8 }, video: { id: 'CWDJ5QlBPbY', by: 'Chydee Crystal Kitchen' },
    ingredients: ['1 tin tuna', '½ tin cannellini beans', '3 tbsp sweetcorn', '2 tbsp Greek yoghurt', '2 wholemeal wraps', 'Lettuce'],
    steps: ['Mash the beans lightly with the yoghurt.', 'Fold in tuna and sweetcorn, season.', 'Fill the wraps with lettuce and the tuna mix.'] },
  { key: 'lentil-soup', name: 'Red lentil and tomato soup', meal: 'Lunch', minutes: 30, serves: 4, tags: ['vegan', 'vegetarian', 'budget', 'batch', 'family'], allergens: [], per: { kcal: 250, protein: 15, carbs: 42, fat: 2 }, video: { id: '2Rk3OMP8ZK8', by: 'The Pub Grub Vegetarian' },
    ingredients: ['200g red lentils', '1 onion', '2 carrots', '1 tin chopped tomatoes', '1 litre veg stock', '1 tsp cumin'],
    steps: ['Soften the chopped onion and carrot in a little oil.', 'Add cumin, lentils, tomatoes and stock.', 'Simmer for 20 minutes, then blend. Freezes well.'] },
  { key: 'lemon-chicken-traybake', name: 'Lemon chicken traybake', meal: 'Dinner', minutes: 40, serves: 4, tags: ['high-protein', 'family', 'batch'], allergens: [], per: { kcal: 560, protein: 40, carbs: 30, fat: 30 }, video: { id: 'xE5yF9LAKAw', by: 'Tiny Kitchen Club' },
    ingredients: ['8 chicken thighs', '600g baby potatoes, halved', '2 courgettes', '1 red onion', '2 lemons', 'Garlic, olive oil, oregano'],
    steps: ['Heat the oven to 200°C.', 'Toss everything with oil, garlic, oregano and lemon juice in a big tray.', 'Roast for 35 to 40 minutes until the chicken is cooked through.'] },
  { key: 'salmon-greens', name: 'Salmon, greens and new potatoes', meal: 'Dinner', minutes: 25, serves: 2, tags: ['high-protein', 'pescatarian'], allergens: ['fish'], per: { kcal: 520, protein: 38, carbs: 30, fat: 27 }, video: { id: 'N5NLqTJTTRM', by: 'Eat With Steve' },
    ingredients: ['2 salmon fillets', '300g new potatoes', '200g tenderstem broccoli', 'Handful of green beans', 'Lemon, olive oil'],
    steps: ['Boil the potatoes for 15 minutes.', 'Roast the salmon at 200°C for 12 to 14 minutes.', 'Steam the greens for the last 4 minutes. Serve with lemon and oil.'] },
  { key: 'turkey-chilli', name: 'Turkey and bean chilli', meal: 'Dinner', minutes: 35, serves: 4, tags: ['high-protein', 'family', 'batch', 'budget'], allergens: [], per: { kcal: 320, protein: 38, carbs: 22, fat: 8 }, video: { id: 'vIEa8JCdcM8', by: 'The Dinner Bite' },
    ingredients: ['500g turkey mince', '1 onion', '1 pepper', '1 tin kidney beans', '1 tin chopped tomatoes', '2 tsp chilli powder, 1 tsp cumin'],
    steps: ['Brown the mince with the chopped onion and pepper.', 'Add spices, tomatoes and beans.', 'Simmer for 20 minutes. Serve with rice or a jacket potato.'] },
  { key: 'tofu-stir-fry', name: 'Sticky tofu stir-fry', meal: 'Dinner', minutes: 20, serves: 2, tags: ['vegan', 'vegetarian', 'quick', 'high-protein'], allergens: ['soy', 'sesame'], per: { kcal: 480, protein: 26, carbs: 60, fat: 14 }, video: { id: 'GhubROqxqIk', by: 'This Savory Vegan' },
    ingredients: ['280g firm tofu', '2 nests noodles or 1 pouch rice', '1 pack stir-fry veg', '2 tbsp soy sauce', '1 tbsp maple syrup', '1 tsp sesame seeds'],
    steps: ['Cube and pan-fry the tofu until golden.', 'Add the veg for 3 minutes.', 'Stir in soy and maple, toss with noodles or rice, finish with sesame.'] },
  { key: 'veggie-pasta', name: 'Roasted veg and ricotta pasta', meal: 'Dinner', minutes: 30, serves: 4, tags: ['vegetarian', 'family', 'budget'], allergens: ['gluten', 'dairy'], per: { kcal: 450, protein: 17, carbs: 72, fat: 10 }, video: { id: 'MSO3Oso-Mz8', by: 'Maxine Sharf' },
    ingredients: ['320g pasta', '1 aubergine', '2 peppers', '250g cherry tomatoes', '150g ricotta', 'Basil, olive oil'],
    steps: ['Roast the chopped veg at 200°C for 25 minutes.', 'Cook the pasta.', 'Toss together with spoonfuls of ricotta and basil.'] },
  { key: 'prawn-curry', name: 'Quick prawn and spinach curry', meal: 'Dinner', minutes: 20, serves: 2, tags: ['high-protein', 'pescatarian', 'quick'], allergens: ['shellfish'], per: { kcal: 300, protein: 22, carbs: 12, fat: 18 }, video: { id: '24d-k-res2c', by: 'Kitchen Time with Neha' },
    ingredients: ['200g raw king prawns', '1 onion', '2 tbsp curry paste', '200ml light coconut milk', '2 handfuls spinach', 'Rice to serve'],
    steps: ['Soften the onion, stir in curry paste for a minute.', 'Add coconut milk and simmer for 5 minutes.', 'Add prawns until pink, then wilt in the spinach.'] },
  { key: 'yoghurt-bark', name: 'Frozen yoghurt berry bark', meal: 'Snack', minutes: 10, serves: 6, tags: ['vegetarian', 'high-protein', 'family'], allergens: ['dairy'], per: { kcal: 90, protein: 6, carbs: 7, fat: 4 }, video: { id: 'gxTLn0Qx4vs', by: 'Tasting Table' },
    ingredients: ['400g Greek yoghurt', '1 tbsp honey', 'Handful of berries', '1 tbsp dark chocolate chips'],
    steps: ['Spread the yoghurt and honey on a lined tray.', 'Scatter berries and chocolate.', 'Freeze for 3 hours, then snap into pieces.'] },
  { key: 'apple-nut-butter', name: 'Apple slices and nut butter', meal: 'Snack', minutes: 2, serves: 1, tags: ['vegan', 'vegetarian', 'quick', 'budget'], allergens: ['peanuts'], per: { kcal: 190, protein: 5, carbs: 22, fat: 9 }, video: { id: 'Auazwqi__fU', by: 'Weltha Cooking' },
    ingredients: ['1 apple', '1 tbsp peanut butter', 'Pinch of cinnamon'],
    steps: ['Slice the apple.', 'Dip into peanut butter dusted with cinnamon.'] },
];

export const TAG_LABELS: Record<Tag, string> = {
  'high-protein': 'High protein', vegetarian: 'Vegetarian', vegan: 'Vegan', pescatarian: 'Pescatarian', quick: 'Quick (15 min or less)', family: 'Family friendly', budget: 'Budget', batch: 'Batch cook',
};
export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'Gluten', dairy: 'Dairy', egg: 'Egg', nuts: 'Tree nuts', peanuts: 'Peanuts', fish: 'Fish', shellfish: 'Shellfish', soy: 'Soy', sesame: 'Sesame',
};

/** Does a recipe fit a way of eating chosen in BAYSE (Vegetarian, Vegan, Pescatarian…)? */
export function fitsPattern(r: Recipe, pattern: string | null | undefined) {
  if (!pattern) return true;
  const p = pattern.toLowerCase();
  if (p === 'vegan') return r.tags.includes('vegan');
  if (p === 'vegetarian') return r.tags.includes('vegetarian') || r.tags.includes('vegan');
  if (p === 'pescatarian') return r.tags.includes('vegetarian') || r.tags.includes('vegan') || r.tags.includes('pescatarian');
  return true;
}

/** Recipes for a member: their way of eating, minus anything containing what they avoid. */
export function forMember(opts: { pattern?: string | null; avoid?: Allergen[]; avoidWords?: string[]; maxMinutes?: number | null }) {
  const words = (opts.avoidWords ?? []).map((w) => w.trim().toLowerCase()).filter((w) => w.length > 2);
  return RECIPES.filter((r) =>
    fitsPattern(r, opts.pattern) &&
    !(opts.avoid ?? []).some((a) => r.allergens.includes(a)) &&
    !words.some((w) => r.ingredients.some((i) => i.toLowerCase().includes(w))) &&
    (!opts.maxMinutes || r.minutes <= opts.maxMinutes));
}
