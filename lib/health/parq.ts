// Health check (PAR-Q style) and the health and safety agreement members accept before exercising.
// Wording is BAYSE's own. Have the agreement checked by a solicitor or insurer before launch.

export const PARQ_VERSION = 'parq-2026-11';
export const AGREEMENT_VERSION = 'hs-2026-11';
export const VALID_MONTHS = 12;

export const PARQ: { id: string; q: string }[] = [
  { id: 'heart', q: 'Has a doctor ever told you that you have a heart condition or high blood pressure?' },
  { id: 'chest_pain', q: 'Do you get pain or pressure in your chest at rest, during everyday activities or when you exercise?' },
  { id: 'dizzy', q: 'Do you lose your balance because of dizziness, or have you fainted or lost consciousness in the last 12 months?' },
  { id: 'condition', q: 'Have you been diagnosed with any other long-term medical condition, such as diabetes, epilepsy, asthma or osteoporosis?' },
  { id: 'medication', q: 'Do you take prescribed medication for a long-term condition?' },
  { id: 'joints', q: 'Do you have a bone, joint or muscle problem (for example in your back, neck, hips or knees) that exercise could make worse?' },
  { id: 'surgery', q: 'Have you had surgery, a serious injury or a broken bone in the last 6 months?' },
  { id: 'pregnancy', q: 'Are you pregnant, or have you given birth in the last 6 months?' },
  { id: 'supervised', q: 'Has a doctor ever said you should only exercise under medical supervision?' },
];

export const CLEARANCE_TEXT = 'I have been told by a doctor or other qualified health professional that I can take part in this kind of exercise, or I will get that advice before I take part, and I will follow it.';

export const AGREEMENT: { title: string; body: string }[] = [
  { title: 'Your health', body: 'The answers you give in the health check are true and complete. If your health changes (for example an injury, a new condition or pregnancy) you will stop and get advice before carrying on, and update your health check in My BAYSE. We will ask you to confirm it every 12 months.' },
  { title: 'Not medical advice', body: 'BAYSE classes, programmes, the workout builder and nutrition content are general fitness information. They are not medical advice, diagnosis or treatment, and they do not replace advice from your doctor, midwife or physiotherapist.' },
  { title: 'Training within your limits', body: 'You will exercise at a level that is right for you, use the easier options when you need them, and follow your instructor’s guidance. Stop straight away if you feel pain, dizziness, faintness, unusual breathlessness or chest discomfort, and seek medical help if you need it.' },
  { title: 'Your space and equipment', body: 'You are responsible for training somewhere safe: enough clear space, a non-slip surface, no trip hazards, and children and pets kept safely away. Any equipment you use (mats, weights, bands, balls or a reformer) is in good condition and used as its maker intends.' },
  { title: 'Live classes and 1-to-1s', body: 'Instructors teach you remotely and cannot see or correct everything. You will tell your instructor about any injury or condition that affects how you should exercise. You choose whether to have your camera on.' },
  { title: 'Community meet-ups', body: 'Clubs, rooms and meet-ups (such as walks or padel) are organised by members, not run or supervised by BAYSE. You take part at your own risk and should use your own judgement about safety.' },
  { title: 'Taking part', body: 'You understand that all exercise carries some risk of injury, and you choose to take part. You accept the normal risks that come with exercising at home or outdoors.' },
  { title: 'Our responsibility', body: 'As far as the law allows, BAYSE and its instructors are not liable for any injury, loss or damage that arises from you taking part, except where it is caused by our negligence or our breach of these terms. Nothing in this agreement limits or excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited or excluded by law, and it does not affect your statutory rights.' },
];

export type ParqAnswers = Record<string, boolean>;
export const anyYes = (a: ParqAnswers) => PARQ.some((q) => a[q.id]);
