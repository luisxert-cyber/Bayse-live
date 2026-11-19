import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice, buttonClass } from '@/components/ui';
import { photoUrl } from '@/lib/teach/format';
import { COACH_REPLY_TARGET, REVIEW_EVERY_DAYS, KIND_LABEL, when, type CoachingMessage } from '@/lib/coaching';
import { askCoach, sendReview } from './actions';

export const metadata = { title: 'My coach' };
export const dynamic = 'force-dynamic';

const input = 'w-full border border-stone bg-bg px-3 py-2 text-[15px]';

export default async function MyCoach({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser('/you/coaching');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: black } = await supabase.rpc('has_entitlement', { k: 'individual_coaching' });
  if (!black) {
    return (
      <main className="page space-y-4">
        <p className="text-sm"><Link href="/you" className="text-muted">← You</Link></p>
        <h1 className="text-[30px] leading-none">My coach</h1>
        <div className="space-y-3 border border-ink p-5">
          <p className="eyebrow">Comes with BAYSE Black</p>
          <p>Your own BAYSE instructor: a private 40-minute Zoom session every paid 28 days, priority questions answered {COACH_REPLY_TARGET}, and a progress review each period with your focus for the next one.</p>
          <Link href="/you/membership" className={buttonClass('solid')}>See BAYSE Black</Link>
        </div>
      </main>
    );
  }
  const [{ data: coachRow }, { data: msgs }] = await Promise.all([
    supabase.from('black_coaches').select('instructors(display_name, slug, photos)').eq('user_id', user.id).maybeSingle(),
    supabase.from('coaching_messages').select('*').eq('member_id', user.id).order('created_at', { ascending: true }).limit(200),
  ]);
  const coach = (coachRow?.instructors ?? null) as unknown as { display_name: string; slug: string; photos: string[] } | null;
  const thread = (msgs ?? []) as CoachingMessage[];
  const lastReview = [...thread].reverse().find((m) => m.kind === 'review');
  const reviewDue = !lastReview || Date.now() - new Date(lastReview.created_at).getTime() > REVIEW_EVERY_DAYS * 864e5;
  const focus = [...thread].reverse().find((m) => m.kind === 'feedback' && m.focus);
  return (
    <main className="page space-y-5">
      <p className="text-sm"><Link href="/you" className="text-muted">← You</Link></p>
      <div className="flex items-center gap-4">
        {coach?.photos?.[0] && <img src={photoUrl(coach.photos[0])} alt="" className="h-16 w-16 border border-stone object-cover" />}
        <div>
          <h1 className="text-[28px] leading-none">My coach</h1>
          <p className="mt-1 text-muted">{coach ? <>Your BAYSE Black instructor is <Link href={`/instructors/${coach.slug}`} className="underline">{coach.display_name}</Link>.</> : 'BAYSE is choosing your instructor. You can ask a question now and the team will answer.'}</p>
        </div>
      </div>
      {sp.ok === 'asked' && <Notice tone="success" title="Sent">Your coach aims to reply {COACH_REPLY_TARGET}.</Notice>}
      {sp.ok === 'review' && <Notice tone="success" title="Review sent">Your coach will reply with feedback and your focus for the next 28 days.</Notice>}
      {sp.e && <Notice tone="error">{sp.e === 'review' ? 'Add a rating and at least one answer.' : sp.e === 'empty' ? 'Write your question first.' : 'That could not be sent. Please try again.'}</Notice>}

      {focus && (
        <section className="border-2 border-white p-4">
          <p className="eyebrow">Your focus this period</p>
          <p className="mt-2 whitespace-pre-line text-[16px]">{focus.focus}</p>
          <p className="mt-1 text-xs text-muted">From {coach?.display_name ?? 'your coach'}, {when(focus.created_at)}</p>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/you/sessions" className="border border-stone p-4 hover:border-ink"><p className="font-bold uppercase">Private session</p><p className="text-sm text-muted">One 40-minute Zoom session each paid 28 days. Book it with your instructor.</p></Link>
        <a href="#ask" className="border border-stone p-4 hover:border-ink"><p className="font-bold uppercase">Ask your coach</p><p className="text-sm text-muted">Priority answers {COACH_REPLY_TARGET}.</p></a>
      </div>

      {reviewDue && (
        <form action={sendReview} className="space-y-3 border border-ink p-4" data-review-form>
          <p className="font-bold uppercase">Progress review</p>
          <p className="text-sm text-muted">Once every 28 days. Your coach reads it and sends back feedback and your focus for the next period.</p>
          <fieldset className="flex flex-wrap gap-2"><legend className="mb-1 text-sm">How did the last 28 days go?</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer"><input type="radio" name="rating" value={n} required className="peer sr-only" />
                <span className="inline-flex h-11 w-11 items-center justify-center border border-stone font-bold peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg">{n}</span></label>
            ))}
          </fieldset>
          <label className="grid gap-1 text-sm">How training went<textarea name="went" rows={2} maxLength={600} className={input} /></label>
          <label className="grid gap-1 text-sm">Wins, big or small<textarea name="wins" rows={2} maxLength={600} className={input} /></label>
          <label className="grid gap-1 text-sm">What you want to work on next<textarea name="next" rows={2} maxLength={600} className={input} /></label>
          <label className="grid gap-1 text-sm">Anything your coach should know (optional)<textarea name="know" rows={2} maxLength={600} className={input} /></label>
          <button className={buttonClass('solid')}>Send my review</button>
        </form>
      )}

      <section id="ask" className="scroll-mt-4 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Messages</h2>
        <ul className="space-y-2">
          {thread.map((m) => {
            const mine = m.author_id === user.id;
            return (
              <li key={m.id} className={`border p-3 text-[15px] ${mine ? 'ml-6 border-stone' : 'mr-6 border-ink'}`}>
                <p className="text-xs text-muted">{mine ? 'You' : coach?.display_name ?? 'BAYSE'} · {KIND_LABEL[m.kind]}{m.rating ? ` · ${m.rating}/5` : ''} · {when(m.created_at)}</p>
                <p className="mt-1 whitespace-pre-line">{m.body}</p>
                {m.focus && <p className="mt-2 border-t border-stone pt-2 text-sm"><b>Focus for next period:</b> {m.focus}</p>}
              </li>
            );
          })}
          {!thread.length && <li className="border border-dashed border-stone p-4 text-sm text-muted">No messages yet. Ask anything about your training, form or plan.</li>}
        </ul>
        <form action={askCoach} className="space-y-2">
          <label className="grid gap-1 text-sm">Ask your coach<textarea name="body" rows={3} required maxLength={2000} placeholder="E.g. my lower back feels it in the hundred. What should I change?" className={input} /></label>
          <button className={buttonClass('solid')}>Send</button>
          <p className="text-xs text-muted">Not for emergencies or medical advice. If something hurts, stop and speak to your GP or physio.</p>
        </form>
      </section>
    </main>
  );
}
