// BAYSE onboarding: one question per screen (spec section 6).
// Pure data, shared by the onboarding UI, the server actions that save answers,
// and the plan engine. Option ids are stored in the database; labels are shown.

export type Option = { id: string; label: string; hint?: string };

export type StepKind = 'intro' | 'name' | 'single' | 'multi' | 'number' | 'studio' | 'dietary' | 'wellness' | 'result' | 'account' | 'membership' | 'payment' | 'done';

export type Step = {
  id: string;
  kind: StepKind;
  title: string;
  subtitle?: string;
  options?: Option[];
  /** Field in onboarding_answers / nutrition_preferences this step writes. */
  field?: string;
  table?: 'onboarding_answers' | 'nutrition_preferences';
  optional?: boolean;
  /** Special-category: needs explicit consent before anything is stored. */
  sensitive?: boolean;
  /** Optional personalisation asked after joining (from You), not in the sign-up flow. */
  later?: boolean;
  min?: number;
  max?: number;
};

export const GOALS: Option[] = [
  { id: 'strength_tone', label: 'Build strength and tone' },
  { id: 'fitness', label: 'Improve general fitness' },
  { id: 'core', label: 'Develop core strength' },
  { id: 'posture', label: 'Improve posture' },
  { id: 'mobility', label: 'Improve mobility' },
  { id: 'confidence', label: 'Build confidence' },
  { id: 'healthy_eating', label: 'Develop healthier eating habits' },
  { id: 'healthy_weight', label: 'Support a healthy weight' },
  { id: 'consistency', label: 'Become more consistent' },
  { id: 'feel_better', label: 'Feel better day to day' },
];

export const STEPS: Step[] = [
  { id: 'welcome', kind: 'intro', title: 'Your programme. Your coach. Your people.', subtitle: 'A few quick questions about your goals, experience and time, and we will build a plan around you. About a minute. Food and wellness preferences can wait until later.' },
  { id: 'name', kind: 'name', title: 'What should we call you?', subtitle: 'Your first name is for your coach. Your display name is what other members see in the community.' },
  { id: 'goals', kind: 'multi', field: 'goals', table: 'onboarding_answers', title: 'What would you like BAYSE to help with?', subtitle: 'Choose as many as you like.', options: GOALS, min: 1 },
  { id: 'experience', kind: 'single', field: 'experience', table: 'onboarding_answers', title: 'How much Pilates have you done?', options: [
    { id: 'new', label: 'None yet', hint: 'Brand new to Pilates' },
    { id: 'beginner', label: 'A little', hint: 'A handful of classes' },
    { id: 'intermediate', label: 'Regularly', hint: 'Comfortable with the basics' },
    { id: 'advanced', label: 'A lot', hint: 'Confident with advanced work' },
  ] },
  { id: 'sessions', kind: 'number', field: 'sessions_per_week', table: 'onboarding_answers', title: 'How many sessions a week feels realistic?', subtitle: 'Be kind to yourself. We would rather you hit two than miss five.', min: 1, max: 7 },
  { id: 'length', kind: 'single', field: 'session_length', table: 'onboarding_answers', title: 'How long do you usually have?', options: [
    { id: '10-15', label: '10 to 15 minutes' }, { id: '20-30', label: '20 to 30 minutes' }, { id: '30-45', label: '30 to 45 minutes' },
    { id: '45-60', label: '45 to 60 minutes' }, { id: 'flexible', label: 'It varies' },
  ] },
  { id: 'equipment', kind: 'multi', field: 'equipment', table: 'onboarding_answers', title: 'What do you have at home?', options: [
    { id: 'mat', label: 'A mat' }, { id: 'weights', label: 'Weights' }, { id: 'bands', label: 'Resistance bands' },
    { id: 'accessories', label: 'Pilates ball, ring or blocks' }, { id: 'reformer', label: 'A reformer' }, { id: 'none', label: 'Nothing yet' },
  ], min: 1 },
  { id: 'studio', kind: 'studio', optional: true, title: 'Do you train at a BAYSE studio?', subtitle: 'Studio members can link their membership. We check it with your studio before any studio benefits switch on.' },
  { id: 'programme', kind: 'result', title: 'Your programme' },
  { id: 'account', kind: 'account', title: 'Save your plan', subtitle: 'Create your account so your answers and programme are kept safe.' },
  { id: 'membership', kind: 'membership', title: 'Choose your membership' },
  { id: 'payment', kind: 'payment', title: 'Payment' },
  { id: 'done', kind: 'done', title: 'Welcome to BAYSE' },
  // Optional, after joining: asked from You → Personalise BAYSE.
  { id: 'training', later: true, optional: true, kind: 'multi', field: 'preferred_training', table: 'onboarding_answers', title: 'What do you enjoy?', options: [
    { id: 'mat', label: 'Mat Pilates' }, { id: 'reformer', label: 'Reformer' }, { id: 'strength', label: 'Strength' },
    { id: 'sculpt', label: 'Sculpt' }, { id: 'mobility', label: 'Mobility' }, { id: 'walking', label: 'Walking' },
  ], min: 1 },
  { id: 'coaching', later: true, optional: true, kind: 'multi', field: 'coaching_style', table: 'onboarding_answers', title: 'How do you like to be coached?', options: [
    { id: 'live', label: 'Live group classes' }, { id: 'on_demand', label: 'On-demand sessions' }, { id: 'plan', label: 'A structured plan' },
    { id: 'messaging', label: 'Messaging an instructor' }, { id: 'mix', label: 'A mixture' },
  ], min: 1 },
  { id: 'community', later: true, kind: 'multi', field: 'community_interests', table: 'onboarding_answers', optional: true, title: 'What would you enjoy with other members?', options: [
    { id: 'padel', label: 'Padel' }, { id: 'walking', label: 'Walking' }, { id: 'pilates_friends', label: 'Pilates friendships' },
    { id: 'coffee', label: 'Coffee socials' }, { id: 'accountability', label: 'Accountability' }, { id: 'meetups', label: 'Local meetups' },
  ] },
  { id: 'nutrition', later: true, kind: 'multi', field: 'goals', table: 'nutrition_preferences', optional: true, title: 'Any food goals?', subtitle: 'Optional. BAYSE is never about strict diets.', options: [
    { id: 'balanced', label: 'Eat more balanced meals' }, { id: 'protein', label: 'Increase protein' }, { id: 'cook', label: 'Learn to cook healthy meals' },
    { id: 'plan', label: 'Plan meals more easily' }, { id: 'habits', label: 'Improve eating habits' },
    { id: 'guided_weight', label: 'Professionally guided weight management' }, { id: 'none', label: 'Not right now' },
  ] },
  { id: 'dietary', later: true, kind: 'dietary', optional: true, title: 'How do you like to eat?', subtitle: 'Preferences help us suggest recipes. Allergies are health information, so we ask for your permission separately and keep them private to you.' },
  { id: 'wellness', later: true, kind: 'wellness', optional: true, sensitive: true, title: 'Women’s wellness', subtitle: 'Optional and private. Only you can see this. You can change or delete it at any time.', options: [
    { id: 'general', label: 'General wellbeing' }, { id: 'stress_sleep', label: 'Stress and sleep' }, { id: 'menstrual_health', label: 'Menstrual health education' },
    { id: 'perimenopause', label: 'Perimenopause' }, { id: 'menopause', label: 'Menopause' }, { id: 'pregnancy_postpartum', label: 'Pregnancy or postpartum' },
    { id: 'mobility_recovery', label: 'Mobility and recovery' },
  ] },
];

/** The sign-up journey: goals, experience and availability first. Everything else waits until after joining. */
export const FLOW: Step[] = STEPS.filter((s) => !s.later);
export const LATER_STEPS: Step[] = STEPS.filter((s) => s.later);
export const STEP_IDS = FLOW.map((s) => s.id);

/** Position in the sign-up journey, or -1 for an optional later question. */
export function stepIndex(id: string): number {
  return STEP_IDS.indexOf(id);
}

/** Next screen in the sign-up journey. Later questions return null (they go back to Personalise). */
export function nextStepId(id: string): string | null {
  const i = stepIndex(id);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1].id : null;
}

export function prevStepId(id: string): string | null {
  const i = stepIndex(id);
  return i > 0 ? FLOW[i - 1].id : null;
}

export const PERSONALISE_PATH = '/you/personalise';

/** Validate a submitted answer for a question step. Returns the cleaned value or an error. */
export function validateAnswer(step: Step, raw: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  const allowed = new Set((step.options ?? []).map((o) => o.id));
  if (step.kind === 'single') {
    if (raw == null || raw === '') return step.optional ? { ok: true, value: null } : { ok: false, error: 'Please choose one.' };
    if (typeof raw !== 'string' || !allowed.has(raw)) return { ok: false, error: 'That is not one of the options.' };
    return { ok: true, value: raw };
  }
  if (step.kind === 'multi' || step.kind === 'wellness') {
    const arr = Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw];
    if (!arr.every((v) => typeof v === 'string' && allowed.has(v))) return { ok: false, error: 'That is not one of the options.' };
    let uniq = Array.from(new Set(arr as string[]));
    if (uniq.includes('none') && uniq.length > 1) uniq = uniq.filter((v) => v !== 'none');
    if (!step.optional && uniq.length < (step.min ?? 1)) return { ok: false, error: 'Please choose at least one.' };
    return { ok: true, value: uniq };
  }
  if (step.kind === 'number') {
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isInteger(n) || n < (step.min ?? 1) || n > (step.max ?? 7)) return { ok: false, error: `Choose between ${step.min ?? 1} and ${step.max ?? 7}.` };
    return { ok: true, value: n };
  }
  return { ok: true, value: raw };
}
