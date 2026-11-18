import Link from 'next/link';
import { requireInstructor } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { PhotoManager } from '@/components/teach/PhotoManager';
import { STUDIOS, SPECIALITIES, input, btn, btnSolid } from '@/lib/teach/format';
import { saveProfile } from '../actions';

export const metadata = { title: 'My profile' };

const STATUS_TEXT: Record<string, string> = {
  draft: 'Not on the website yet. Fill this in and send it for approval.',
  pending: 'Waiting for BAYSE to approve. You can keep editing.',
  published: 'Live on the website. Changes go back to BAYSE for a quick check.',
  hidden: 'Hidden from the website by BAYSE.',
};

export default async function TeachProfile({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { me } = await requireInstructor();
  if (!me) return null;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: priv } = await supabase.from('instructor_private').select('zoom_url').eq('instructor_id', me.id).maybeSingle();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">My profile</h1>
        {me.status === 'published' && <Link href={`/instructors/${me.slug}`} className={btn}>See my page</Link>}
      </div>
      <Notice tone={me.status === 'published' ? 'success' : 'info'}>{STATUS_TEXT[me.status]}</Notice>
      {sp.ok && <Notice tone="success">{sp.ok === 'submitted' ? 'Sent to BAYSE for approval.' : 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">{sp.error === 'zoom' ? 'Your profile saved, but the Zoom link must be a zoom.us link starting with https://' : 'That could not be saved.'}</Notice>}

      <section className="space-y-2">
        <p className="font-bold">Photos</p>
        <PhotoManager instructorId={me.id} photos={me.photos ?? []} />
      </section>

      <form action={saveProfile} className="space-y-4 border border-stone p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Name members see<input name="display_name" defaultValue={me.display_name} required minLength={2} maxLength={60} className={input} /></label>
          <label className="grid gap-1 text-sm">One-line intro<input name="headline" defaultValue={me.headline ?? ''} maxLength={120} placeholder="Strength-focused Pilates for busy people" className={input} /></label>
        </div>
        <label className="grid gap-1 text-sm">About you<textarea name="bio" defaultValue={me.bio ?? ''} rows={6} maxLength={1500} placeholder="Your background, qualifications and what your classes feel like." className={input} /></label>
        <fieldset className="text-sm"><legend className="mb-1">What you specialise in</legend>
          <div className="flex flex-wrap gap-2">{SPECIALITIES.map((x) => <label key={x} className="flex items-center gap-1.5 border border-stone px-2 py-1"><input type="checkbox" name="specialities" value={x} defaultChecked={me.specialities?.includes(x)} />{x}</label>)}</div>
        </fieldset>
        <fieldset className="text-sm"><legend className="mb-1">Where you teach</legend>
          <div className="flex flex-wrap gap-2">{STUDIOS.map((x) => <label key={x} className="flex items-center gap-1.5 border border-stone px-2 py-1"><input type="checkbox" name="studios" value={x} defaultChecked={me.studios?.includes(x)} />{x}</label>)}</div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="offers_private" defaultChecked={me.offers_private} />I take 1-to-1 bookings</label>
        <label className="grid gap-1 text-sm">Your Zoom room for 1-to-1s (private)
          <input name="zoom_url" type="url" defaultValue={priv?.zoom_url ?? ''} placeholder="https://us02web.zoom.us/j/…" className={input} />
          <span className="text-xs text-muted">Only shown to a member once you have accepted their session. Never shown on the website.</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button name="submit" value="save" className={btn}>Save</button>
          {me.status !== 'published' && me.status !== 'hidden' && <button name="submit" value="review" className={btnSolid}>Save and send for approval</button>}
        </div>
      </form>
    </div>
  );
}
