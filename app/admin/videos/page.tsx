import { ClipManager } from '@/components/admin/ClipManager';

export const metadata = { title: 'Move videos' };

export default function VideosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Move videos</h1>
      <p className="max-w-[70ch] text-sm text-muted">
        Upload a short looping clip for any move and it replaces the drawing everywhere that move appears: the homepage, the class
        player and the move library. Moves without a clip keep the drawing.
      </p>
      <ul className="max-w-[70ch] list-disc space-y-1 pl-5 text-sm text-muted">
        <li>MP4 (H.264) or WebM, under 8&nbsp;MB. Aim for 4 to 8 seconds that loop cleanly.</li>
        <li>Landscape 16:10 (for example 1280×800), filmed side-on, the whole body in shot, plain light background.</li>
        <li>No music or voice needed: the player gives the cues. Get written consent from anyone filmed, and the instructor&rsquo;s consent before using her likeness in AI-made clips.</li>
      </ul>
      <ClipManager />
    </div>
  );
}
