import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cx('rounded-card border border-stone bg-surface p-5 shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}
