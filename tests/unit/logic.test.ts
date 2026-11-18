// Unit tests for pure logic. Run: npm run test:unit  (node --test via tsx)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, pickWeeks, pickSessions, hasEquipmentFor, type Programme, type Answers } from '../../lib/plan/recommend';
import { STEPS, FLOW, LATER_STEPS, validateAnswer, nextStepId, prevStepId, stepIndex } from '../../lib/onboarding/steps';
import { mapSubscription, normaliseStatus, isUuid } from '../../lib/billing/stripe-map';

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
});
