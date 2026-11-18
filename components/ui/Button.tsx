import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'border-[3px] border-ink bg-transparent text-ink hover:bg-ink hover:text-bg',
  secondary: 'border-[3px] border-ink bg-ink text-bg hover:bg-transparent hover:text-ink',
  quiet: 'bg-transparent text-ink hover:bg-stone/50',
  danger: 'bg-clay text-white hover:bg-clay/90',
};

export function buttonClass(variant: Variant = 'primary', full = false) {
  return cx(
    'inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-[15px] font-bold uppercase tracking-[0.02em] transition-colors',
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
