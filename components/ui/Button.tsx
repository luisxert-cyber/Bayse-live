import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'solid' | 'quiet' | 'danger';

const styles: Record<Variant, string> = {
  // Studio brand: the main action is an outlined white box; "solid" is the filled white box.
  primary: 'border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-bg',
  secondary: 'border border-stone bg-transparent text-ink hover:border-ink',
  solid: 'border-[1.5px] border-ink bg-ink text-bg hover:opacity-90',
  quiet: 'bg-transparent text-ink hover:bg-stone/50',
  danger: 'border-[1.5px] border-clay bg-transparent text-clay hover:bg-clay hover:text-bg',
};

export function buttonClass(variant: Variant = 'primary', full = false) {
  return cx(
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-none px-6 text-[14px] font-bold uppercase tracking-[0.02em] transition',
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
