import { STATUS, PAYMENT, ukDateTime, btn, btnSolid, input } from '@/lib/teach/format';
import { respondSession, cancelSessionAsStaff, markSession } from '@/app/teach/actions';
import type { Session } from '@/lib/teach/data';

// One 1-to-1 from the instructor's side, with the actions that make sense for its state.
export function SessionCard({ s, joinUrl, back }: { s: Session; joinUrl?: string | null; back: string }) {
  const start = new Date(s.starts_at);
  const ended = start.getTime() + s.minutes * 60000 < Date.now();
  const canAccept = ['paid', 'credit', 'none'].includes(s.payment);
  const H = ({ id }: { id: string }) => <><input type="hidden" name="id" value={id} /><input type="hidden" name="back" value={back} /></>;
  return (
    <li className="space-y-2 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold">{ukDateTime(s.starts_at)} · {s.minutes} min</p>
          <p>{s.member_name}</p>
          {s.health_flag && <p className="mt-1 border border-white px-2 py-1 text-xs">Has told BAYSE about a health condition. Ask them about it before you start.</p>}
          <p className="text-xs text-muted">{STATUS[s.status]} · {PAYMENT[s.payment]}</p>
        </div>
        {s.status === 'confirmed' && !ended && joinUrl && <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={btnSolid}>Open Zoom</a>}
      </div>
      {s.member_note && <p className="border-l-2 border-stone pl-3 text-muted">“{s.member_note}”</p>}
      {s.status === 'requested' && (
        <div className="flex flex-wrap items-end gap-2">
          <form action={respondSession} className="flex flex-wrap items-end gap-2">
            <H id={s.id} /><input type="hidden" name="accept" value="1" />
            <input name="note" maxLength={500} placeholder="Message to the member (optional)" className={`${input} w-64`} />
            <button className={btnSolid} disabled={!canAccept}>Accept</button>
          </form>
          <form action={respondSession}><H id={s.id} /><input type="hidden" name="accept" value="0" /><button className={btn}>Decline</button></form>
          {!canAccept && <p className="w-full text-xs text-muted">You can accept once the member has paid.</p>}
        </div>
      )}
      {s.status === 'confirmed' && !ended && start > new Date() && (
        <form action={cancelSessionAsStaff} className="flex flex-wrap items-end gap-2">
          <H id={s.id} /><input name="reason" maxLength={300} placeholder="Reason (the member sees this)" className={`${input} w-64`} />
          <button className={btn}>Cancel session</button>
        </form>
      )}
      {['confirmed', 'completed', 'no_show'].includes(s.status) && start < new Date() && (
        <div className="flex gap-2">
          <form action={markSession}><H id={s.id} /><input type="hidden" name="status" value="completed" /><button className={s.status === 'completed' ? btnSolid : btn}>Completed</button></form>
          <form action={markSession}><H id={s.id} /><input type="hidden" name="status" value="no_show" /><button className={s.status === 'no_show' ? btnSolid : btn}>No-show</button></form>
        </div>
      )}
    </li>
  );
}
