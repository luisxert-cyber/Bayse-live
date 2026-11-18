import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'border-[1.5px] border-ink bg-ink text-bg hover:opacity-90',
  secondary: 'border-[1.5px] border-stone bg-transparent text-ink hover:border-ink',
  quiet: 'bg-transparent text-ink hover:bg-stone/50',
  danger: 'border-[1.5px] border-clay bg-transparent text-clay hover:bg-clay hover:text-bg',
};

export function buttonClass(variant: Variant = 'primary', full = false) {
  return cx(
    'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
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
