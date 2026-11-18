import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-ink text-bg hover:bg-ink/90',
  secondary: 'bg-surface text-ink border border-stone hover:border-ink/40',
  quiet: 'bg-transparent text-ink hover:bg-stone/50',
  danger: 'bg-clay text-white hover:bg-clay/90',
};

export function buttonClass(variant: Variant = 'primary', full = false) {
  return cx(
    'inline-flex min-h-tap items-center justify-center gap-2 rounded-pill px-6 text-sm font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    styles[variant],
    full && 'w-full',
  );
}

export function Button({ variant = 'primary', full, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean; children: ReactNode }) {
  return (
    <button className={cx(buttonClass(variant, full), className)} {...rest}>
      {children}
    </button>
  );
}
