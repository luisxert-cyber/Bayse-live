// BAYSE Black coaching: what members can expect, kept small enough to deliver well every period.
export const COACH_REPLY_TARGET = 'within 2 working days';
export const REVIEW_EVERY_DAYS = 28;
export type CoachingMessage = { id: string; member_id: string; author_id: string; kind: 'question' | 'reply' | 'review' | 'feedback'; body: string; focus: string | null; rating: number | null; created_at: string };
export const KIND_LABEL: Record<CoachingMessage['kind'], string> = { question: 'Question', reply: 'Reply', review: 'Progress review', feedback: 'Coach feedback' };
export const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
