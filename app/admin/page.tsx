import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { money } from '@/lib/teach/format';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

type M = Record<string, number> & { plans: { plan: string; paying: number; trialing: number; mrr_pence: number }[]; signups_by_week: { week: string; n: number }[] };

function Tile({ label, value, sub, href, strong }: { label: string; value: string | number; sub?: string; href?: string; strong?: boolean }) {
  const body = (
    <div className={`h-full bg-bg p-4 ${href ? 'hover:bg-surface' : ''}`}>
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className={`mt-1 font-bold ${strong ? 'text-3xl' : 'text-2xl'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section><p className="mb-2 text-sm font-bold uppercase tracking-[0.08em]">{title}</p>{children}</section>
);
const Grid = ({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) => (
  <div className={`grid grid-cols-2 gap-px border border-stone bg-stone ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>{children}</div>
);

export default async function Dashboard() {
  await requireStaff('overview');
  const supabase = await createClient();
  const [{ data }, { data: period }] = await Promise.all([
    supabase.rpc('admin_metrics'),
    supabase.rpc('pay_period', { p_offset: 0 }).single(),
  ]);
  const m = (data ?? {}) as M;
  const p = period as { period_start: string; period_end: string } | null;
  const { data: pay } = p ? await supabase.rpc('instructor_pay', { p_from: p.period_start, p_to: p.period_end }) : { data: [] };
  const owed = ((pay ?? []) as { amount_pence: number }[]).reduce((a, x) => a + x.amount_pence, 0);
  const weeks = m.signups_by_week ?? [];
  const peak = Math.max(1, ...weeks.map((w) => w.n));
  const conversion = m.accounts ? Math.round(((m.paying ?? 0) / m.accounts) * 100) : 0;
  const todo = [
    m.sessions_requests ? [`${m.sessions_requests} 1-to-1 request${m.sessions_requests > 1 ? 's' : ''} waiting`, '/admin/sessions'] : null,
    m.refunds_due ? [`${m.refunds_due} refund${m.refunds_due > 1 ? 's' : ''} to make in Stripe`, '/admin/sessions'] : null,
    m.instructors_pending ? [`${m.instructors_pending} instructor profile${m.instructors_pending > 1 ? 's' : ''} to approve`, '/admin/staff'] : null,
    m.open_reports ? [`${m.open_reports} community report${m.open_reports > 1 ? 's' : ''} to review`, '/admin/reports'] : null,
    m.past_due ? [`${m.past_due} member${m.past_due > 1 ? 's' : ''} with a failed payment`, '/admin/members'] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">BAYSE Online at a glance. {m.test_accounts ? `${m.test_accounts} automatic test accounts are left out of these figures.` : ''}</p>
      </div>
      <Notice tone="warning" title="Payments are in test mode">Stripe is not connected for real payments yet, so revenue shows £0 until it is. Member, trial and activity numbers are live.</Notice>

      {todo.length > 0 && (
        <section className="border border-white p-4">
          <p className="font-bold">Needs you</p>
          <ul className="mt-2 space-y-1 text-sm">{todo.map(([t, href]) => <li key={t}><Link href={href} className="underline">{t}</Link></li>)}</ul>
        </section>
      )}

      <Section title="Members">
        <Grid>
          <Tile strong label="Accounts" value={m.accounts ?? 0} sub={`${m.new_7d ?? 0} new this week · ${m.new_30d ?? 0} in 30 days`} href="/admin/members" />
          <Tile strong label="With access now" value={m.with_access ?? 0} sub={`${m.manual_access ?? 0} by code or added by BAYSE`} />
          <Tile strong label="On free trial" value={m.trialing ?? 0} />
          <Tile strong label="Paying" value={m.paying ?? 0} sub={`${conversion}% of accounts`} />
          <Tile label="Cancelling at period end" value={m.cancelling ?? 0} />
          <Tile label="Cancelled (30 days)" value={m.cancelled_30d ?? 0} />
          <Tile label="Failed payments" value={m.past_due ?? 0} />
          <Tile label="Studio members linked" value={m.studio_linked ?? 0} />
        </Grid>
      </Section>

      <Section title="Sign-ups, last 8 weeks">
        <div className="flex h-36 items-end gap-2 border border-stone p-4" role="img" aria-label={`Weekly sign-ups: ${weeks.map((w) => w.n).join(', ')}`}>
          {weeks.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs">{w.n || ''}</span>
              <div className="w-full bg-white" style={{ height: `${Math.max(2, (w.n / peak) * 80)}px` }} />
              <span className="text-[10px] text-muted">{new Date(w.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Revenue">
        <Grid cols={3}>
          <Tile strong label="Monthly recurring revenue" value={money(m.mrr_pence)} sub="From active paid memberships" href="/admin/plans" />
          <Tile strong label="1-to-1s paid this month" value={money(m.sessions_revenue_month_pence)} href="/admin/sessions" />
          <Tile strong label="Instructor pay this period" value={money(owed)} sub={p ? `${new Date(p.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} to ${new Date(p.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : undefined} href="/admin/pay" />
        </Grid>
        {(m.plans ?? []).length > 0 && (
          <table className="mt-3 w-full border border-stone text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="p-2 font-normal">Plan</th><th className="font-normal">Paying</th><th className="font-normal">Trial</th><th className="p-2 text-right font-normal">Monthly</th></tr></thead>
            <tbody>{m.plans.map((pl) => <tr key={pl.plan} className="border-t border-stone"><td className="p-2">{pl.plan}</td><td>{pl.paying}</td><td>{pl.trialing}</td><td className="p-2 text-right font-bold">{money(pl.mrr_pence)}</td></tr>)}</tbody>
          </table>
        )}
      </Section>

      <Section title="Activity and team">
        <Grid>
          <Tile label="Classes done (7 days)" value={m.workouts_7d ?? 0} sub={`by ${m.active_members_7d ?? 0} members`} />
          <Tile label="1-to-1s this month" value={m.sessions_month ?? 0} sub={`${m.credits_unused ?? 0} coaching credits unused`} href="/admin/sessions" />
          <Tile label="Instructors" value={m.instructors ?? 0} sub={m.instructors_pending ? `${m.instructors_pending} to approve` : undefined} href="/admin/staff" />
          <Tile label="Filmed classes live" value={m.video_classes ?? 0} href="/admin/on-demand" />
        </Grid>
      </Section>
    </div>
  );
}
