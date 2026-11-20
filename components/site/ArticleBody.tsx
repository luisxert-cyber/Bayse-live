import Link from 'next/link';
import type { ReactNode } from 'react';

// Turns an article's plain text into the page: "## " headings, "- " lists, **bold** and [links](/path).
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] !== undefined ? <strong key={k++}>{m[1]}</strong> : <Link key={k++} href={m[3]} className="underline underline-offset-2 hover:text-ink">{m[2]}</Link>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-4 text-[17px] leading-[1.7]">
      {blocks.map((b, i) => {
        const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines[0].startsWith('## ')) return <h2 key={i} className="pt-6 text-[24px] leading-tight sm:text-[28px]">{lines[0].slice(3)}</h2>;
        if (lines.every((l) => l.startsWith('- '))) return <ul key={i} className="list-disc space-y-2 pl-6">{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i} className="text-ink/90">{inline(lines.join(' '))}</p>;
      })}
    </div>
  );
}
