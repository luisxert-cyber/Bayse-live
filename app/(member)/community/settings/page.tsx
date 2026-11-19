import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { communityStatus, namesFor } from '@/lib/community/data';
import { CommunityShell, Gate } from '@/components/community/Shell';
import { savePrefs, unblock } from '../actions';

export const metadata = { title: 'Community privacy' };
export const dynamic = 'force-dynamic';

const INTERESTS = [['padel', 'Padel'], ['walk', 'Walks'], ['social', 'Socials'], ['pilates_friends', 'Pilates friends'], ['accountability', 'Accountability']] as const;

export default async function Settings({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const user = await requireUser('/community/settings');
  const status = await communityStatus();
  if (status !== 'ok') return <Gate status={status} />;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: prefs }, { data: blocks }, { data: profile }] = await Promise.all([
    supabase.from('discovery_prefs').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('blocks').select('blocked_id, created_at').eq('blocker_id', user.id),
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
  ]);
  // Names of people you blocked are not visible through public_names (by design), so show a neutral label.
  const names = await namesFor((blocks ?? []).map((b) => b.blocked_id as string));
  return (
    <CommunityShell active="/community/settings" title="Privacy" intro={`Other members see you as “${profile?.display_name ?? 'your display name'}”. Change it in You.`} e={sp.e} ok={sp.ok}>
      <form action={savePrefs} className="space-y-4 rounded-card border border-stone bg-surface p-4">
        <input type="hidden" name="back" value="/community/settings" />
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="discoverable" defaultChecked={prefs?.discoverable ?? false} className="mt-0.5 h-4 w-4 accent-ink" />
          <span><span className="font-semibold">Let other members find me</span><span className="block text-muted">Off by default. When on, members can see your display name and interests when looking for people to train with.</span></span></label>
        <fieldset>
          <legend className="text-sm font-semibold">I&rsquo;m interested in</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map(([k, l]) => (
              <label key={k} className="cursor-pointer rounded-full border border-stone px-3.5 py-1.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
                <input type="checkbox" name="interests" value={k} defaultChecked={(prefs?.interests ?? []).includes(k)} className="sr-only" />{l}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="notify" defaultChecked={prefs?.notify_new_activities ?? true} className="mt-0.5 h-4 w-4 accent-ink" />
          <span><span className="font-semibold">Tell me about new activities</span><span className="block text-muted">For the interests above. Notifications start when BAYSE emails go live.</span></span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="rankings" defaultChecked={prefs?.show_in_rankings ?? true} className="mt-0.5 h-4 w-4 accent-ink" />
          <span><span className="font-semibold">Show my level and include me in the weekly league</span><span className="block text-muted">Other members see your level beside your name and your place in this week&rsquo;s league. Switch off to keep both private.</span></span></label>
        <button className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-bg">Save</button>
      </form>
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em]">People you&rsquo;ve blocked</h2>
        {(blocks ?? []).length ? (
          <ul className="space-y-2">
            {(blocks ?? []).map((b, i) => (
              <li key={b.blocked_id} className="flex items-center justify-between gap-3 rounded-card border border-stone bg-surface p-3 text-sm">
                <span>{names.get(b.blocked_id) ?? `Blocked member ${i + 1}`}</span>
                <form action={unblock}><input type="hidden" name="user_id" value={b.blocked_id} /><input type="hidden" name="back" value="/community/settings" /><button className="rounded-full border border-stone px-3 py-1.5">Unblock</button></form>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">Nobody. You can block someone from the … menu on any post, reply or activity.</p>}
      </section>
    </CommunityShell>
  );
}
