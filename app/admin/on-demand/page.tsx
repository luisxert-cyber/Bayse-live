import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/components/ui';
import { VideoClassForm } from '@/components/admin/VideoClassForm';
import { VIDEO_STYLES, coverUrl } from '@/lib/video';
import { ukDate } from '@/lib/teach/format';
import { setVideoStatus, deleteVideoClass } from './actions';

export const metadata = { title: 'On-demand classes' };
export const dynamic = 'force-dynamic';

const btn = 'inline-flex min-h-[36px] items-center border border-white px-3 text-xs font-bold uppercase hover:bg-white hover:text-black';

export default async function OnDemand({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { isAdmin } = await requireStaff('content');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: classes }, { data: instructors }] = await Promise.all([
    supabase.from('video_classes').select('*, instructors(display_name)').order('status').order('sort').order('created_at', { ascending: false }),
    supabase.from('instructors').select('id, display_name').eq('active', true).order('display_name'),
  ]);
  const edit = sp.edit ? classes?.find((c) => c.id === sp.edit) : null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">On-demand classes</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">Upload filmed classes for the member library. Members with a membership or free trial can watch published classes; classes marked free are open to everyone signed in. {isAdmin ? 'New classes start as drafts until you publish them.' : 'Your uploads go to BAYSE as drafts to publish.'}</p>
      </div>
      {sp.ok && <Notice tone="success">{sp.ok === 'deleted' ? 'Class deleted.' : 'Saved.'}</Notice>}
      {sp.error && <Notice tone="error">That change could not be made.</Notice>}

      <section className="space-y-2">
        <p className="font-bold">{edit ? `Edit: ${edit.title}` : 'Upload a new class'}</p>
        {edit && <Link href="/admin/on-demand" className="text-xs underline">Cancel editing</Link>}
        <VideoClassForm key={edit?.id ?? 'new'} v={edit ?? undefined} instructors={instructors ?? []} isAdmin={isAdmin} />
      </section>

      <section>
        <p className="mb-2 font-bold">Library ({classes?.length ?? 0})</p>
        <ul className="divide-y divide-stone border border-stone">
          {(classes ?? []).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-3 text-sm">
              <div className="h-16 w-28 shrink-0 overflow-hidden border border-stone bg-surface">{c.cover_path && <img src={coverUrl(c.cover_path)!} alt="" className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.title}</p>
                <p className="text-xs text-muted">{VIDEO_STYLES[c.style]} · {c.level} · {c.minutes} min · {(c.instructors as { display_name: string } | null)?.display_name ?? 'BAYSE team'}{c.free ? ' · free' : ''}</p>
                <p className="text-xs text-muted">{c.status === 'published' ? `Published ${c.published_at ? ukDate(c.published_at) : ''}` : c.status === 'hidden' ? 'Hidden' : 'Draft'} · {c.video_path ? 'uploaded video' : c.video_url ? 'linked video' : 'no video yet'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.status === 'published' && <Link href={`/train/video/${c.slug}`} className={btn}>Watch</Link>}
                <Link href={`/admin/on-demand?edit=${c.id}`} className={btn}>Edit</Link>
                {isAdmin && <form action={setVideoStatus}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value={c.status === 'published' ? 'hidden' : 'published'} /><button className={btn}>{c.status === 'published' ? 'Hide' : 'Publish'}</button></form>}
                {isAdmin && <form action={deleteVideoClass}><input type="hidden" name="id" value={c.id} /><button className={btn}>Delete</button></form>}
              </div>
            </li>
          ))}
          {!classes?.length && <li className="p-6 text-center text-sm text-muted">No filmed classes yet. Upload the first one above.</li>}
        </ul>
      </section>
    </div>
  );
}
