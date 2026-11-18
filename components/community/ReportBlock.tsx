import { report, block } from '@/app/(member)/community/actions';

/** "…" menu on someone else's content: report it, or block the person. No JavaScript needed. */
export function ReportBlock({ targetType, targetId, userId, name, back }: { targetType: string; targetId: string; userId?: string; name: string; back: string }) {
  return (
    <details className="relative shrink-0">
      <summary aria-label="More options" className="cursor-pointer list-none rounded-full px-2 text-lg leading-none text-muted hover:text-ink">…</summary>
      <div className="absolute right-0 z-10 mt-1 w-64 space-y-3 rounded-2xl border border-stone bg-bg p-3 text-sm shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]">
        <form action={report} className="space-y-2">
          <input type="hidden" name="target_type" value={targetType} /><input type="hidden" name="target_id" value={targetId} /><input type="hidden" name="back" value={back} />
          <p className="font-semibold">Report this</p>
          <select name="reason" required defaultValue="" className="w-full rounded-[10px] border border-stone bg-surface px-2 py-2">
            <option value="" disabled>Choose a reason</option>
            <option value="harassment">Harassment or bullying</option>
            <option value="unsafe">Unsafe or threatening</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="privacy">Shares private information</option>
            <option value="spam">Spam or selling</option>
            <option value="other">Something else</option>
          </select>
          <input name="details" maxLength={1000} placeholder="Anything else? (optional)" className="w-full rounded-[10px] border border-stone bg-surface px-2 py-2" />
          <button className="w-full rounded-full bg-ink py-2 font-bold text-bg">Send report</button>
        </form>
        {userId && (
          <form action={block}>
            <input type="hidden" name="user_id" value={userId} /><input type="hidden" name="back" value={back} />
            <button className="w-full rounded-full border border-stone py-2">Block {name}</button>
          </form>
        )}
      </div>
    </details>
  );
}
