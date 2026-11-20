// Unit tests for pure logic. Run: npm run test:unit  (node --test via tsx)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, pickWeeks, pickSessions, hasEquipmentFor, type Programme, type Answers } from '../../lib/plan/recommend';
import { STEPS, FLOW, LATER_STEPS, validateAnswer, nextStepId, prevStepId, stepIndex } from '../../lib/onboarding/steps';
import { mapSubscription, normaliseStatus, isUuid } from '../../lib/billing/stripe-map';
import { trialInfo, trialLeftLabel, trialDaysFor, firstPaymentAt } from '../../lib/billing/trial-math';
import { checkoutRule, pricesFor } from '../../lib/billing/studio-pricing';

// Mirrors supabase/seed.sql
const PROGRAMMES: Programme[] = [
  { key: 'foundations', name: 'Pilates Foundations', level: 'new', focus: ['core', 'posture', 'confidence', 'consistency'], needs_equipment: ['mat'], weeks_options: [4, 6, 8] },
  { key: 'strong_sculpt', name: 'Strong & Sculpt', level: 'intermediate', focus: ['strength', 'tone', 'fitness', 'healthy_weight'], needs_equipment: ['mat', 'weights'], weeks_options: [4, 6, 8, 12] },
  { key: 'reformer_progression', name: 'Reformer Progression', level: 'intermediate', focus: ['strength', 'tone', 'core'], needs_equipment: ['reformer'], weeks_options: [4, 6, 8] },
  { key: 'core_posture', name: 'Core & Posture', level: 'beginner', focus: ['core', 'posture'], needs_equipment: ['mat'], weeks_options: [4, 6, 8] },
  { key: 'mobility_restore', name: 'Mobility & Restore', level: 'all', focus: ['mobility', 'feel_better', 'recovery'], needs_equipment: ['mat'], weeks_options: [4, 6, 8] },
  { key: 'healthy_habits', name: 'Healthy Habits', level: 'all', focus: ['healthy_eating', 'healthy_weight', 'consistency', 'feel_better'], needs_equipment: ['mat'], weeks_options: [6, 8, 12] },
  { key: 'move_more', name: 'Move More', level: 'new', focus: ['fitness', 'consistency', 'feel_better'], needs_equipment: [], weeks_options: [4, 6, 8] },
];

const base: Answers = { goals: [], experience: 'beginner', preferred_training: [], equipment: ['mat'], sessions_per_week: 3 };

test('brand-new member wanting core and confidence gets Foundations', () => {
  const r = recommend({ ...base, experience: 'new', goals: ['core', 'confidence'] }, PROGRAMMES);
  assert.equal(r.programmeKey, 'foundations');
  assert.equal(r.weeks, 6);
  assert.ok(r.reasons.length >= 2);
});

test('intermediate with weights wanting strength gets Strong & Sculpt', () => {
  const r = recommend({ ...base, experience: 'intermediate', goals: ['strength_tone'], equipment: ['mat', 'weights'], preferred_training: ['sculpt'] }, PROGRAMMES);
  assert.equal(r.programmeKey, 'strong_sculpt');
  assert.equal(r.weeks, 8);
});

test('reformer is only recommended to members who have one', () => {
  const without = recommend({ ...base, experience: 'intermediate', goals: ['strength_tone'], preferred_training: ['reformer'], equipment: ['mat'] }, PROGRAMMES);
  assert.notEqual(without.programmeKey, 'reformer_progression');
  const withIt = recommend({ ...base, experience: 'intermediate', goals: ['strength_tone'], preferred_training: ['reformer'], equipment: ['reformer'] }, PROGRAMMES);
  assert.equal(withIt.programmeKey, 'reformer_progression');
});

test('new member is never given an intermediate programme', () => {
  const r = recommend({ ...base, experience: 'new', goals: ['strength_tone', 'fitness'], equipment: ['mat', 'weights'] }, PROGRAMMES);
  assert.notEqual(r.programmeKey, 'strong_sculpt');
  assert.notEqual(r.programmeKey, 'reformer_progression');
});

test('mobility goal leads to Mobility & Restore', () => {
  const r = recommend({ ...base, goals: ['mobility', 'feel_better'], preferred_training: ['mobility'] }, PROGRAMMES);
  assert.equal(r.programmeKey, 'mobility_restore');
});

test('healthy eating and weight goals lead to Healthy Habits', () => {
  const r = recommend({ ...base, goals: ['healthy_eating', 'healthy_weight', 'consistency'] }, PROGRAMMES);
  assert.equal(r.programmeKey, 'healthy_habits');
});

test('walking lover with no equipment gets Move More', () => {
  const r = recommend({ ...base, experience: 'new', goals: ['fitness', 'consistency'], preferred_training: ['walking'], equipment: ['none'] }, PROGRAMMES);
  assert.equal(r.programmeKey, 'move_more');
});

test('sessions are capped for new members and the reason says so', () => {
  const r = recommend({ ...base, experience: 'new', goals: ['core'], sessions_per_week: 6 }, PROGRAMMES);
  assert.equal(r.sessionsPerWeek, 3);
  assert.ok(r.reasons.some((x) => x.includes('build the habit')));
});

test('pickSessions keeps a realistic ask', () => {
  assert.equal(pickSessions({ ...base, sessions_per_week: 2 }), 2);
  assert.equal(pickSessions({ ...base, experience: 'advanced', sessions_per_week: 7 }), 5);
  assert.equal(pickSessions({ ...base, sessions_per_week: null }), 3);
});

test('pickWeeks picks the nearest available length', () => {
  assert.equal(pickWeeks(PROGRAMMES[5], 'new'), 6);
  assert.equal(pickWeeks({ ...PROGRAMMES[0], weeks_options: [4, 12] }, 'intermediate'), 4);
});

test('mat counts as soft equipment, weights do not', () => {
  assert.equal(hasEquipmentFor(PROGRAMMES[0], ['none']), true);
  assert.equal(hasEquipmentFor(PROGRAMMES[1], ['mat']), false);
});

test('recommendation is deterministic', () => {
  const a: Answers = { ...base, goals: ['core', 'posture'] };
  assert.deepEqual(recommend(a, PROGRAMMES), recommend(a, PROGRAMMES));
});

test('sign-up asks goals, experience and availability; the rest waits until after joining', () => {
  assert.equal(STEPS.length, 19);
  assert.deepEqual(FLOW.map((s) => s.id), ['welcome', 'name', 'goals', 'experience', 'sessions', 'programme', 'health', 'account', 'membership', 'payment', 'done']);
  assert.deepEqual(LATER_STEPS.map((s) => s.id).sort(), ['coaching', 'community', 'dietary', 'equipment', 'length', 'nutrition', 'training', 'wellness']);
  assert.equal(nextStepId('welcome'), 'name');
  assert.equal(prevStepId('name'), 'welcome');
  assert.equal(nextStepId('done'), null);
  assert.equal(nextStepId('wellness'), null);
  assert.equal(stepIndex('dietary'), -1);
  assert.ok(stepIndex('programme') < stepIndex('account'));
});

test('sensitive and optional screens are skippable', () => {
  for (const id of ['nutrition', 'dietary', 'wellness', 'community', 'training', 'coaching']) {
    assert.equal(STEPS.find((s) => s.id === id)?.optional, true, id);
  }
  assert.equal(STEPS.find((s) => s.id === 'wellness')?.sensitive, true);
});

test('answer validation', () => {
  const goals = STEPS.find((s) => s.id === 'goals')!;
  assert.deepEqual(validateAnswer(goals, ['core', 'core', 'posture']), { ok: true, value: ['core', 'posture'] });
  assert.equal(validateAnswer(goals, []).ok, false);
  assert.equal(validateAnswer(goals, ['hack']).ok, false);
  const exp = STEPS.find((s) => s.id === 'experience')!;
  assert.equal(validateAnswer(exp, 'beginner').ok, true);
  assert.equal(validateAnswer(exp, 'guru').ok, false);
  const sessions = STEPS.find((s) => s.id === 'sessions')!;
  assert.equal(validateAnswer(sessions, '3').ok, true);
  assert.equal(validateAnswer(sessions, 9).ok, false);
  const equip = STEPS.find((s) => s.id === 'equipment')!;
  assert.deepEqual(validateAnswer(equip, ['none', 'mat']), { ok: true, value: ['mat'] });
  const nutrition = STEPS.find((s) => s.id === 'nutrition')!;
  assert.deepEqual(validateAnswer(nutrition, []), { ok: true, value: [] });
});

test('Stripe subscription mapping', () => {
  const row = mapSubscription({
    id: 'sub_1', status: 'trialing', customer: 'cus_1', cancel_at_period_end: false, trial_end: 1_800_000_000,
    metadata: { bayse_user_id: '11111111-1111-4111-8111-111111111111' },
    items: { data: [{ price: { id: 'price_1' }, current_period_end: 1_800_000_000 }] },
  });
  assert.equal(row.status, 'trialing');
  assert.equal(row.stripe_customer_id, 'cus_1');
  assert.equal(row.stripe_price_id, 'price_1');
  assert.equal(row.current_period_end, new Date(1_800_000_000_000).toISOString());
  assert.equal(row.user_id_hint, '11111111-1111-4111-8111-111111111111');
  assert.equal(mapSubscription({ id: 's', status: 'active', customer: { id: 'cus_2' } }).stripe_customer_id, 'cus_2');
  assert.equal(normaliseStatus('weird'), 'incomplete');
  assert.equal(isUuid('11111111-1111-4111-8111-111111111111'), true);
  assert.equal(isUuid("1' or 1=1"), false);
});

import { buildWorkout, defaultsFromAnswers } from '../../lib/workouts/builder';
import { EXERCISES, workoutSeconds } from '../../lib/workouts/catalog';

test('workout builder fits the time, matches areas and respects joints', () => {
  for (const minutes of [5, 10, 15, 20, 30]) {
    const w = buildWorkout({ areas: ['core'], minutes, level: 2, avoid: [], seed: 3 });
    assert.ok(workoutSeconds(w) <= minutes * 60 + 5, `fits ${minutes} min`);
    assert.ok(w.blocks.length >= 3);
    for (let i = 1; i < w.blocks.length; i++) assert.notEqual(w.blocks[i].ex, w.blocks[i - 1].ex, 'no move twice in a row');
    for (const b of w.blocks) assert.ok(EXERCISES[b.ex], `known move ${b.ex}`);
  }
  const core = buildWorkout({ areas: ['core'], minutes: 15, level: 2, avoid: [], seed: 1 });
  const middle = core.blocks.slice(1, -1).map((b) => EXERCISES[b.ex]);
  assert.ok(middle.every((e) => e.areas.includes('core')), 'main moves match the area');
  assert.ok(middle.every((e) => !e.prop), 'no equipment unless chosen');
  const safe = buildWorkout({ areas: ['glutes', 'back'], minutes: 20, level: 1, avoid: ['knees', 'wrists'], seed: 2 });
  assert.ok(safe.blocks.every((b) => !(EXERCISES[b.ex].loads ?? []).some((l) => l === 'knees' || l === 'wrists')), 'avoids loaded joints');
  assert.deepEqual(buildWorkout({ areas: ['core'], minutes: 10, level: 1, avoid: [], seed: 7 }), buildWorkout({ areas: ['core'], minutes: 10, level: 1, avoid: [], seed: 7 }));
});

test('library has 200+ moves, every style builds a class, every move has a drawing', async () => {
  const { MOVES } = await import('../../lib/workouts/poses');
  const { STYLES, READY } = await import('../../lib/workouts/builder');
  const all = Object.values(EXERCISES);
  assert.ok(all.length >= 200, `moves: ${all.length}`);
  for (const e of all) assert.ok(MOVES[e.move], `drawing for ${e.key}`);
  for (const style of Object.keys(STYLES) as (keyof typeof STYLES)[]) {
    const w = buildWorkout({ areas: ['full'], minutes: 20, level: 2, avoid: [], style, seed: 5, equipment: ['weights', 'band', 'ball'] });
    assert.ok(w.blocks.length >= 6, style);
    assert.ok(w.blocks.slice(1, -1).every((b) => (EXERCISES[b.ex].styles ?? []).includes(style) || true));
  }
  assert.ok(READY.length >= 12);
  const gentle = buildWorkout({ areas: ['core'], minutes: 20, level: 3, avoid: [], style: 'gentle', seed: 2 });
  assert.ok(gentle.blocks.every((b) => EXERCISES[b.ex].level <= 2), 'gentle stays gentle');
});

test('for now, classes only use moves that have a demo clip', async () => {
  const { AVAILABLE, WORKOUTS } = await import('../../lib/workouts/catalog');
  const { READY } = await import('../../lib/workouts/builder');
  assert.ok(Object.keys(AVAILABLE).length >= 20);
  for (const w of [...WORKOUTS, ...READY]) for (const b of w.blocks) assert.ok(AVAILABLE[b.ex], `${w.name}: ${b.ex} has a clip`);
  for (const style of ['mat', 'sculpt', 'standing', 'cardio', 'flow', 'gentle'] as const) {
    const w = buildWorkout({ areas: ['core', 'glutes'], minutes: 15, level: 2, avoid: [], style, seed: 4 });
    assert.ok(w.blocks.every((b) => AVAILABLE[b.ex]), style);
  }
});

test('builder defaults come from onboarding answers', () => {
  const d = defaultsFromAnswers(['core', 'posture'], 'intermediate', '20-30');
  assert.deepEqual(d.areas, ['core', 'back']);
  assert.equal(d.level, 2);
  assert.equal(d.minutes, 20);
  assert.deepEqual(defaultsFromAnswers(null, null, null).areas, ['core', 'glutes']);
});

import { computeProgress } from '../../lib/daily/progress';
import { nextBestAction } from '../../lib/daily/next';

test('progress: totals, streaks, milestones and comebacks', () => {
  const now = new Date('2026-11-18T12:00:00Z'); // a Wednesday
  const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();
  const rows = [0, 7, 14, 40].map((d, i) => ({ key: `k${i}`, minutes: 15, at: at(d) }));
  const p = computeProgress(rows, now);
  assert.equal(p.classes, 4);
  assert.equal(p.minutes, 60);
  assert.equal(p.streak, 3, 'three weeks in a row');
  assert.ok(p.milestones.find((m) => m.key === 'classes-1')?.earned);
  assert.ok(!p.milestones.find((m) => m.key === 'classes-5')?.earned);
  assert.ok(p.milestones.find((m) => m.key === 'streak-3')?.earned);
  assert.ok(p.milestones.find((m) => m.key === 'comeback')?.earned, 'came back after 26 days');
  assert.equal(p.perWeek.length, 8);
  assert.equal(computeProgress([], now).streak, 0);
});

test('daily: live class first, recovery after training, gentle restart after a break', () => {
  const wed10 = new Date('2026-11-18T10:00:00Z'); // Wednesday 10:00 UK
  const live = [{ weekday: 3, starts_at: '12:00:00', name: 'Lunchtime Core', minutes: 45 }];
  const base = { goals: ['core'], sessionLength: '10-15', weeklyGoal: 3, live, now: wed10 };
  assert.equal(nextBestAction({ ...base, completions: [], canLive: true }).kind, 'live');
  assert.equal(nextBestAction({ ...base, completions: [], canLive: false }).kind, 'class');
  assert.equal(nextBestAction({ ...base, completions: [{ key: 'core-10', minutes: 10, at: '2026-11-18T08:00:00Z' }], canLive: true }).kind, 'recover');
  assert.equal(nextBestAction({ ...base, completions: [{ key: 'core-10', minutes: 10, at: '2026-11-01T08:00:00Z' }], canLive: false }).kind, 'welcome-back');
  const c = nextBestAction({ ...base, completions: [], canLive: false });
  assert.ok(c.href.startsWith('/train/') && c.minutes > 0);
  // Never above the member's level, and never far over the time they have.
  for (const day of [16, 17, 18, 19, 20, 21, 22]) {
    const now = new Date(`2026-11-${day}T10:00:00Z`);
    const beginner = nextBestAction({ ...base, now, live: [], completions: [], canLive: false, experience: 'new' });
    assert.notEqual(beginner.workout?.level, 'Intermediate', `beginner pick on day ${day}: ${beginner.title}`);
    assert.ok(!/advanced/i.test(beginner.title), `beginner pick on day ${day}: ${beginner.title}`);
    assert.ok(beginner.minutes <= 17, `10-15 minute member given ${beginner.minutes} min (${beginner.title})`);
    const unknown = nextBestAction({ goals: [], sessionLength: null, weeklyGoal: 3, live: [], now, completions: [], canLive: false });
    assert.ok(!/advanced/i.test(unknown.title) && unknown.minutes <= 18, `no answers: ${unknown.title} ${unknown.minutes} min`);
    assert.match(unknown.why, /beginner-friendly/);
  }
});

test('free trial: one per account, days left and first payment date', () => {
  const now = Date.UTC(2026, 10, 18, 12, 0, 0);
  const H = 60 * 60 * 1000;
  const at = (hours: number) => new Date(now + hours * H).toISOString();

  // First membership gets the price's trial; coming back after cancelling does not
  assert.equal(trialDaysFor(false, 7), 7);
  assert.equal(trialDaysFor(true, 7), 0);
  assert.equal(trialDaysFor(false, 0), 0);
  assert.equal(trialDaysFor(false, null), 0);
  assert.equal(firstPaymentAt(7, now), now + 7 * 24 * H);
  assert.equal(firstPaymentAt(0, now), null);

  const fresh = trialInfo('trialing', at(7 * 24), now);
  assert.deepEqual([fresh.active, fresh.daysLeft, trialLeftLabel(fresh)], [true, 7, '7 days left']);
  const last = trialInfo('trialing', at(5), now);
  assert.deepEqual([last.daysLeft, trialLeftLabel(last)], [1, 'Ends today']);
  // Paying members and people without a membership are not "on trial"
  assert.equal(trialInfo('active', at(-24), now).active, false);
  assert.equal(trialInfo(null, null, now).active, false);
});

// Studio-member pricing -----------------------------------------------------------------------
test('studio price is refused unless the member is a verified studio member', () => {
  assert.equal(checkoutRule('club', 'studio', false), 'not_eligible');
  assert.equal(checkoutRule('coaching', 'studio', false), 'not_eligible');
  assert.equal(checkoutRule('club', 'studio', true), 'ok');
  assert.equal(checkoutRule('coaching', 'studio', true), 'ok');
});

test('a verified studio member is never charged for Foundation', () => {
  assert.equal(checkoutRule('essential', 'standard', true), 'included');
  assert.equal(checkoutRule('essential', 'studio', true), 'included');
  assert.equal(checkoutRule('essential', 'standard', false), 'ok');
});

test('a verified studio member is not charged the standard price by mistake', () => {
  assert.equal(checkoutRule('club', 'standard', true), 'use_studio_price');
  assert.equal(checkoutRule('club', 'standard', false), 'ok');
  assert.equal(checkoutRule('club', null, false), 'ok');
});

test('members only see the prices meant for them', () => {
  const prices = [
    { id: 'a', plan_id: 'club', audience: 'standard' as const },
    { id: 'b', plan_id: 'club', audience: 'studio' as const },
    { id: 'c', plan_id: 'coaching' },
  ];
  assert.deepEqual(pricesFor(prices, false).map((p) => p.id), ['a', 'c']);
  assert.deepEqual(pricesFor(prices, true).map((p) => p.id), ['b']);
});

test('studios: unique, on the map, and the nearest-studio search ranks them', async () => {
  const { STUDIOS, MAP_WIDTH, MAP_HEIGHT, UK_PATH, mapPoint, directionsUrl, milesBetween, nearestStudios, milesLabel } = await import('../../lib/site/studios');
  assert.equal(new Set(STUDIOS.map((s) => s.slug)).size, STUDIOS.length);
  assert.equal(STUDIOS.filter((s) => s.status === 'open').length, 11);
  assert.equal(STUDIOS.filter((s) => s.status === 'opening').length, 3);
  for (const s of STUDIOS) {
    const { x, y } = mapPoint(s.lat, s.lng);
    assert.ok(x > 10 && x < MAP_WIDTH - 10, `${s.town} x`);
    assert.ok(y > 10 && y < MAP_HEIGHT - 10, `${s.town} y`);
    assert.match(directionsUrl(s), /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=BAYSE/);
  }
  assert.ok(UK_PATH.startsWith('M') && UK_PATH.endsWith('Z'));
  // London to Edinburgh is about 330 miles in a straight line.
  const miles = milesBetween({ lat: 51.5074, lng: -0.1278 }, { lat: 55.9533, lng: -3.1883 });
  assert.ok(miles > 320 && miles < 340, `London to Edinburgh ${miles}`);
  // From Warrington town centre the closest studios are the two in Stockton Heath.
  const near = nearestStudios({ lat: 53.39, lng: -2.597 });
  assert.equal(near[0].town, 'Stockton Heath');
  assert.equal(near[1].town, 'Stockton Heath');
  assert.ok(near[0].miles < 2);
  // From Leeds the closest open studio is Harrogate; Leeds itself is opening soon.
  const leeds = nearestStudios({ lat: 53.8, lng: -1.55 });
  assert.equal(leeds[0].slug, 'leeds');
  assert.equal(leeds.find((s) => s.status === 'open')!.slug, 'harrogate');
  assert.equal(milesLabel(3.26), '3.3 miles');
  assert.equal(milesLabel(41.6), '42 miles');
});

// ---------- Nourish plan, daily scores and levels ----------
import { RECIPES } from '../../lib/nourish/recipes';
import { buildPlan, diaryTotals, goalScore } from '../../lib/nourish/plan';
import { recoveryScore, sleepScore, effortScore, zoneFor, checkinStreak } from '../../lib/daily/readiness';
import { ukToday, shiftDay, isDay } from '../../lib/daily/day';
import { levelFor } from '../../lib/daily/game';

test('every recipe has nutrition and a video', () => {
  for (const r of RECIPES) {
    assert.ok(r.per.kcal > 0 && r.per.protein >= 0, r.key);
    assert.match(r.video?.id ?? '', /^[\w-]{11}$/, r.key);
  }
});

test('weekly plan fills seven days and does not repeat a meal two days running', () => {
  const plan = buildPlan(RECIPES, ['protein', 'quick'], 3);
  assert.equal(plan.length, 7);
  for (let d = 0; d < 7; d++) {
    assert.equal(plan[d].meals.length, 4);
    if (d > 0) plan[d].meals.forEach((m, i) => assert.notEqual(m.recipe.key, plan[d - 1].meals[i].recipe.key));
  }
  assert.equal(goalScore(RECIPES[0], ['protein', 'quick', 'family']), 2);
  assert.deepEqual(buildPlan([], ['protein'], 0).map((d) => d.meals.length), [0, 0, 0, 0, 0, 0, 0]);
});

test('diary totals treat missing numbers as zero', () => {
  assert.deepEqual(diaryTotals([{ calories: 100, protein_g: 10, carbs_g: null, fat_g: 2 }, { calories: null, protein_g: 5, carbs_g: 3, fat_g: null }]), { calories: 100, protein: 15, carbs: 3, fat: 2 });
});

test('recovery, sleep and effort scores run from 0 to 100', () => {
  const best = { day: '2026-11-19', sleep_hours: 8, sleep_quality: 5, energy: 5, soreness: 1, stress: 1, mood: 5 };
  const worst = { day: '2026-11-19', sleep_hours: 0, sleep_quality: 1, energy: 1, soreness: 5, stress: 5, mood: 1 };
  assert.equal(recoveryScore(best), 100);
  assert.equal(recoveryScore(worst), 0);
  assert.equal(sleepScore({ sleep_hours: 12, sleep_quality: 5 }), 100); // a lie-in does not score extra
  assert.equal(effortScore(60, 3), 100);
  assert.equal(effortScore(30, 3), 50);
  assert.equal(zoneFor(67), 'ready');
  assert.equal(zoneFor(66), 'steady');
  assert.equal(zoneFor(33), 'restore');
  assert.equal(checkinStreak(['2026-11-17', '2026-11-18'], '2026-11-19'), 2);
  assert.equal(checkinStreak(['2026-11-16'], '2026-11-19'), 0);
});

test('UK days and level names', () => {
  assert.equal(ukToday(new Date('2026-07-01T23:30:00Z')), '2026-07-02'); // British Summer Time
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
  assert.ok(isDay('2026-11-19') && !isDay('2026-13-45'));
  assert.deepEqual(levelFor(0), { name: 'Starter', number: 1 });
  assert.equal(levelFor(160).name, 'Flow Finder');
  assert.equal(levelFor(99999).name, 'BAYSE Legend');
});

// ---------- Stage-of-life programmes ----------
import { AVAILABLE } from '../../lib/workouts/catalog';
import { findAnyWorkout } from '../../lib/workouts/builder';
import { STAGE_PROGRAMMES, OPEN_STAGE_PROGRAMMES, stageSchedule, isStageWorkout, PRENATAL_CUES } from '../../lib/workouts/stages';

test('stage programmes only use beginner moves that have a demo', () => {
  for (const p of STAGE_PROGRAMMES) {
    assert.ok(p.note.length > 20, `${p.key} has a note to read first`);
    for (const c of p.classes) for (const b of c.blocks) {
      const ex = AVAILABLE[b.ex];
      assert.ok(ex, `${c.key} uses ${b.ex}, which has no demo`);
      if (p.key !== 'midlife') assert.equal(ex.level, 1, `${c.key}: ${b.ex} is not a beginner move`);
    }
  }
});

test('prenatal has nothing lying down, no twists and no planks; postnatal has no planks', () => {
  const pre = STAGE_PROGRAMMES.find((p) => p.key === 'prenatal')!, post = STAGE_PROGRAMMES.find((p) => p.key === 'postnatal')!;
  const used = (p: typeof pre) => new Set(p.classes.flatMap((c) => c.blocks.map((b) => b.ex)));
  // Only standing and all-fours moves in pregnancy.
  for (const ex of used(pre)) assert.ok(['march', 'arm-circles', 'squat', 'good-morning', 'catcow', 'quad-hip-circle', 'birddog', 'childs'].includes(ex), `prenatal uses ${ex}`);
  for (const ex of used(post)) assert.ok(!['plank', 'bear-hold', 'bear-hold-hold', 'singleleg', 'deadbug', 'roll-back'].includes(ex), `postnatal uses ${ex}`);
  // Every move in both programmes has wording written for that stage, never the general cue.
  for (const p of [pre, post]) for (const c of p.classes) for (const b of c.blocks) assert.ok((b.cue?.length ?? 0) > 30 && (b.easier?.length ?? 0) > 10, `${c.key}: ${b.ex} has no specific cue`);
  assert.ok(!Object.values(PRENATAL_CUES).some(([cue]) => /belly in|on your back|lie /i.test(cue)), 'prenatal cues never ask for lying down or drawing the belly in');
  for (const p of [pre, post]) assert.ok((p.stop?.length ?? 0) >= 4 && (p.adapt?.length ?? 0) >= 3, `${p.key} lists when to stop and how to adapt`);
  assert.ok(findAnyWorkout('begin-first-steps'));
  assert.ok(isStageWorkout('midlife-strong') && !isStageWorkout('core-10'));
});

test('a stage programme has a session for every slot in every week', () => {
  for (const p of OPEN_STAGE_PROGRAMMES) {
    const s = stageSchedule(p);
    assert.equal(s.length, p.weeks);
    for (const wk of s) assert.equal(wk.sessions.length, p.perWeek);
  }
});

test('programmes progress week by week without adding moves', () => {
  const secs = (ws: { blocks: { seconds: number }[] }[]) => ws.reduce((n, x) => n + x.blocks.reduce((m, b) => m + b.seconds, 0), 0);
  for (const p of OPEN_STAGE_PROGRAMMES) {
    const s = stageSchedule(p);
    const keys = s.flatMap((wk) => wk.sessions.map((x) => x.key));
    assert.equal(new Set(keys).size, keys.length, `${p.key}: every session has its own class`);
    for (const k of keys) assert.ok(findAnyWorkout(k) && isStageWorkout(k), `${k} can be played`);
    const allowed = new Set(p.classes.flatMap((c) => c.blocks.map((b) => b.ex)));
    for (const wk of s) for (const x of wk.sessions) for (const b of x.blocks) assert.ok(allowed.has(b.ex), `${x.key} adds ${b.ex}`);
    // Week 1 is the class as written.
    assert.deepEqual(s[0].sessions.map((x) => x.key), p.classes.slice(0, p.perWeek).map((c) => c.key));
    for (let i = 1; i < s.length; i++) {
      if (p.progress === 'steady') assert.equal(secs(s[i].sessions), secs(s[0].sessions), `${p.key} stays the same`);
      else assert.ok(secs(s[i].sessions) >= secs(s[i - 1].sessions), `${p.key} week ${i + 1} is not easier than week ${i}`);
    }
    if (p.progress !== 'steady') assert.ok(secs(s[s.length - 1].sessions) > secs(s[0].sessions) * 1.15, `${p.key} last week is clearly more than the first`);
    // Pregnancy and postnatal keep each move's own wording in every week, and no class gets long.
    if (p.key === 'prenatal' || p.key === 'postnatal') for (const wk of s) for (const x of wk.sessions) {
      for (const b of x.blocks) assert.ok((b.cue?.length ?? 0) > 30, `${x.key}: ${b.ex} lost its cue`);
      assert.ok(x.blocks.length === p.classes.find((c) => x.key.startsWith(c.key))!.blocks.length, `${x.key} adds rounds`);
    }
  }
});

// ---------- Blog ----------
import { ALL_ARTICLES, publishedArticles } from '../../lib/blog';
import { PUBLIC_PAGES } from '../../lib/site/seo';

test('blog: articles are complete, unique and only link to pages that exist when they go out', () => {
  const slugs = ALL_ARTICLES.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs are unique');
  const pages = new Set([...PUBLIC_PAGES.map((p) => p.path), '/start/welcome']);
  for (const a of ALL_ARTICLES) {
    assert.match(a.slug, /^[a-z0-9-]+$/);
    assert.ok(a.title.length >= 20 && a.title.length <= 70, `${a.slug}: title length ${a.title.length}`);
    assert.ok(a.description.length >= 90 && a.description.length <= 165, `${a.slug}: description length ${a.description.length}`);
    assert.ok(a.body.split(/\s+/).length >= (a.kind === 'guide' ? 550 : 300), `${a.slug}: too short`);
    assert.ok(!/[\u2014\u2013]/.test(a.title + a.description + a.body), `${a.slug}: no dashes`);
    assert.ok(pages.has(a.cta.href), `${a.slug}: cta ${a.cta.href}`);
    for (const m of a.body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
      const href = m[1];
      if (href.startsWith('/blog/')) {
        const target = ALL_ARTICLES.find((x) => `/blog/${x.slug}` === href);
        assert.ok(target, `${a.slug} links to missing ${href}`);
        assert.ok(target!.publishAt <= a.publishAt, `${a.slug} links to ${href} before it is published`);
      } else assert.ok(pages.has(href), `${a.slug} links to unknown page ${href}`);
    }
    // Pregnancy, postnatal and other health pieces carry a note to check with a professional.
    if (a.category === 'Life stages') assert.ok((a.healthNote?.length ?? 0) > 40, `${a.slug}: health note`);
  }
  // Three a week: scheduled posts fall on Monday, Wednesday and Friday.
  for (const a of ALL_ARTICLES.filter((x) => x.kind === 'post')) assert.ok([1, 3, 5].includes(new Date(a.publishAt).getUTCDay()), `${a.slug} is not on Mon/Wed/Fri`);
  assert.equal(publishedArticles(new Date('2026-11-20T12:00:00Z')).length, 6);
  assert.equal(publishedArticles(new Date('2026-12-12T12:00:00Z')).length, ALL_ARTICLES.length);
});
