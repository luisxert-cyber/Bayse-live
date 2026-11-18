import type { ReactNode } from 'react';
import { cx } from './cx';

type Tone = 'info' | 'success' | 'warning' | 'error';
const tones: Record<Tone, string> = {
  info: 'border-stone bg-surface text-ink',
  success: 'border-sage/40 bg-sage/10 text-ink',
  warning: 'border-ochre/40 bg-ochre/10 text-ink',
  error: 'border-clay/40 bg-clay/10 text-ink',
};

export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('rounded-2xl border px-4 py-3 text-sm', tones[tone])}>
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={cx(title && 'mt-0.5', 'text-muted')}>{children}</div>}
    </div>
  );
}
