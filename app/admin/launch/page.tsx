import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Launch checklist' };
export const dynamic = 'force-dynamic';

type Status = { prices_missing: string[]; webhook_events_7d: number; webhook_errors_7d: number; flags: Record<string, boolean>; instructors_published: number; live_classes: number; live_without_instructor: number; live_without_zoom: number; video_classes: number };
type Item = { ok: boolean | null; title: string; detail: string; who: 'You' | 'Claude' | 'Instructors'; href?: string };

// Live check of what stands between the site and real members. Secrets are never shown: only whether they are set.
export default async function Launch() {
  await requireStaff('overview');
  const supabase = await createClient();
  const { data } = await supabase.rpc('launch_status');
  const s = (data ?? {}) as Status;
  const env = (k: string) => Boolean(process.env[k]);
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
  const mode = stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_') ? 'live' : stripeKey ? 'test' : 'none';
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const flags = s.flags ?? {};
  const items: Item[] = [
    { ok: env('STRIPE_SECRET_KEY') && env('STRIPE_WEBHOOK_SECRET') && env('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'), title: 'Stripe keys in Netlify', detail: `Secret key ${env('STRIPE_SECRET_KEY') ? `set (${mode} mode)` : 'missing'} · webhook secret ${env('STRIPE_WEBHOOK_SECRET') ? 'set' : 'missing'} · publishable key ${env('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') ? 'set' : 'missing'}. Add in Netlify → Environment variables, then redeploy.`, who: 'You' },
    { ok: env('SUPABASE_SERVICE_ROLE_KEY'), title: 'Supabase server key in Netlify', detail: env('SUPABASE_SERVICE_ROLE_KEY') ? 'Set.' : 'Missing: needed to confirm payments and switch access on. Supabase → Project Settings → API keys → service_role.', who: 'You' },
    { ok: site === 'https://www.thebayseclub.com', title: 'Site address setting', detail: `NEXT_PUBLIC_SITE_URL is “${site || 'not set'}”. Should be https://www.thebayseclub.com.`, who: 'You' },
    { ok: (s.prices_missing ?? []).length === 0, title: 'Every price linked to Stripe', detail: (s.prices_missing ?? []).length ? `Missing Stripe price ids: ${s.prices_missing.join(', ')}. Create them in Stripe (every 28 days) and paste in Plans and prices.` : 'All linked.', who: 'You', href: '/admin/plans' },
    { ok: s.webhook_events_7d > 0 && s.webhook_errors_7d === 0, title: 'Stripe is talking to the site', detail: `${s.webhook_events_7d ?? 0} payment events processed in the last 7 days${s.webhook_errors_7d ? `, ${s.webhook_errors_7d} with errors` : ''}. This turns green after the first test checkout.`, who: 'Claude' },
    { ok: !flags.test_mode, title: 'Test mode button switched off', detail: flags.test_mode ? '“Test mode · skip payment” is showing on the join screen. Switch off test_mode in Feature flags before inviting real members.' : 'Off.', who: 'You', href: '/admin/flags' },
    { ok: flags.live_billing ? mode === 'live' : null, title: 'Live billing', detail: flags.live_billing ? (mode === 'live' ? 'On, with live Stripe keys: real cards are charged.' : 'Switched ON already. As soon as live Stripe keys are added, real cards will be charged. Keep it off until you are ready to launch.') : 'Off: only Stripe test keys work. Switch on at launch with live keys.', who: 'You', href: '/admin/flags' },
    { ok: false, title: 'Email service', detail: 'Not connected: no trial reminders, booking reminders or “class launched” emails yet, and sign-in emails come from Supabase (a few per hour). Choose a provider (e.g. Resend or Postmark) and add its key; Claude builds the emails.', who: 'You' },
    { ok: s.instructors_published > 0 || null, title: 'Instructor profiles published', detail: `${s.instructors_published ?? 0} published.${s.instructors_published ? '' : ' Until then the instructors page says “coming soon”.'}`, who: 'Instructors', href: '/admin/staff' },
    { ok: s.live_without_instructor === 0 || null, title: 'Every live class has an instructor', detail: `${s.live_without_instructor ?? 0} of ${s.live_classes ?? 0} live classes have no instructor yet. The timetable shows “Instructor announced soon” for those.`, who: 'You', href: '/admin/classes' },
    { ok: s.live_without_zoom === 0, title: 'Every live class has a Zoom link', detail: `${s.live_without_zoom ?? 0} live classes without a Zoom link.`, who: 'You', href: '/admin/classes' },
    { ok: s.video_classes > 0 || null, title: 'Filmed classes uploaded', detail: `${s.video_classes ?? 0} published. Until then members see “available soon” in Train and Reformer at home.`, who: 'You', href: '/admin/on-demand' },
    { ok: true, title: 'Terms and privacy details', detail: 'Company number, registered office and dates filled in (19 November 2026).', who: 'Claude', href: '/terms' },
    { ok: null, title: 'Support mailbox', detail: 'The terms and privacy policy tell members to email support@thebayseclub.com. Make sure that mailbox exists (or forwards to you) and is read.', who: 'You' },
    { ok: true, title: 'Search engines', detail: 'Google can list the public website (switched on 20 November 2026). Member, staff and payment pages stay hidden. Submit https://www.thebayseclub.com/sitemap.xml in Google Search Console to speed it up.', who: 'You' },
  ];
  const done = items.filter((i) => i.ok === true).length;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Launch checklist</h1>
        <p className="mt-1 text-sm text-muted">{done} of {items.length} done. Checked live each time you open this page; secret keys are never shown, only whether they are set.</p>
      </div>
      <ul className="divide-y divide-stone border border-stone">
        {items.map((i) => (
          <li key={i.title} className="flex gap-3 p-4 text-sm">
            <span aria-label={i.ok ? 'Done' : i.ok === false ? 'To do' : 'Check'} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${i.ok ? 'bg-white text-black' : i.ok === false ? 'border border-white' : 'border border-stone text-muted'}`}>{i.ok ? '✓' : i.ok === false ? '!' : '?'}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 font-bold">{i.title}<span className="border border-stone px-1.5 text-[10px] font-normal uppercase text-muted">{i.who}</span></span>
              <span className="mt-0.5 block text-muted">{i.detail}</span>
              {i.href && <Link href={i.href} className="mt-1 inline-block text-xs underline">Open</Link>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
