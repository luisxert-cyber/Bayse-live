// BAYSE Nourish: a week of meals built from the member's goals and the recipes that fit how they eat.
// Pure functions, so the app and the tests agree. No calorie targets: the plan is about good, realistic food.
import type { Meal, Recipe, Tag } from './recipes';

export const GOALS = {
  protein: { label: 'Eat more protein', tags: ['high-protein'] },
  energy: { label: 'More energy through the day', tags: ['high-protein', 'batch'] },
  quick: { label: 'Quick meals for busy days', tags: ['quick'] },
  family: { label: 'Meals the whole family eats', tags: ['family'] },
  budget: { label: 'Eat well on a budget', tags: ['budget'] },
  plants: { label: 'Eat more plants', tags: ['vegetarian', 'vegan'] },
  batch: { label: 'Cook once, eat twice', tags: ['batch'] },
  balanced: { label: 'Just a balanced week', tags: [] },
} as const satisfies Record<string, { label: string; tags: readonly Tag[] }>;
export type Goal = keyof typeof GOALS;
export const isGoal = (g: string): g is Goal => g in GOALS;

export const TRACKING = {
  none: { label: 'No tracking', about: 'Just the plan and recipes. Nothing to log.' },
  simple: { label: 'Simple food diary', about: 'Note what you eat. No numbers at all.' },
  protein: { label: 'Track protein', about: 'A diary with a daily protein total.' },
  full: { label: 'Track calories and macros', about: 'Calories, protein, carbs and fat for each day.' },
} as const;
export type Tracking = keyof typeof TRACKING;
export const isTracking = (t: string): t is Tracking => t in TRACKING;

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const PLAN_MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export type PlanDay = { day: (typeof DAYS)[number]; meals: { meal: Meal; recipe: Recipe }[] };

/** How well a recipe matches the member's goals: one point for every goal it helps with. */
export function goalScore(r: Recipe, goals: Goal[]) {
  return goals.reduce((n, g) => n + ((GOALS[g].tags as readonly Tag[]).some((t) => r.tags.includes(t)) ? 1 : 0), 0);
}

/**
 * A seven-day plan. Recipes that match the member's goals come round more often, nothing repeats two days
 * running where there is a choice, and `week` moves the starting point so each week feels different.
 */
export function buildPlan(recipes: Recipe[], goals: Goal[], week = 0): PlanDay[] {
  const pools = new Map<Meal, Recipe[]>();
  for (const meal of PLAN_MEALS) {
    const ranked = recipes.filter((r) => r.meal === meal)
      .map((r, i) => ({ r, i, score: goalScore(r, goals) }))
      .sort((a, b) => b.score - a.score || a.i - b.i);
    // Best matches appear twice in the rotation, so they come round more often without crowding everything else out.
    const best = ranked.filter((x) => x.score > 0).map((x) => x.r);
    pools.set(meal, [...ranked.map((x) => x.r), ...best]);
  }
  return DAYS.map((day, d) => ({
    day,
    meals: PLAN_MEALS.flatMap((meal) => {
      const pool = pools.get(meal) ?? [];
      if (!pool.length) return [];
      let recipe = pool[(d + week) % pool.length];
      const before = pool[(d + week - 1 + pool.length) % pool.length];
      if (d > 0 && recipe.key === before.key && pool.length > 1) recipe = pool[(d + week + 1) % pool.length];
      return [{ meal, recipe }];
    }),
  }));
}

/** Every ingredient for the week's plan, one line per recipe ingredient (repeats kept so quantities add up). */
export function planIngredients(plan: PlanDay[]) {
  return plan.flatMap((d) => d.meals.flatMap((m) => m.recipe.ingredients.map((item) => ({ item, recipe_key: m.recipe.key }))));
}

export type DiaryEntry = { calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null };
/** Totals for a day's diary entries. Entries without numbers count as zero. */
export function diaryTotals(entries: DiaryEntry[]) {
  return entries.reduce((t, e) => ({ calories: t.calories + (e.calories ?? 0), protein: t.protein + (e.protein_g ?? 0), carbs: t.carbs + (e.carbs_g ?? 0), fat: t.fat + (e.fat_g ?? 0) }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
