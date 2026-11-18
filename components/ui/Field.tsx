import type { InputHTMLAttributes } from 'react';
import { cx } from './cx';

export function Field({ label, hint, error, id, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; id: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        className={cx(
          'block min-h-tap w-full rounded-2xl border bg-surface px-4 text-base text-ink placeholder:text-muted/70',
          error ? 'border-clay' : 'border-stone focus:border-ink/50',
          className,
        )}
        {...rest}
      />
      {(hint || error) && (
        <span id={`${id}-help`} className={cx('mt-1.5 block text-xs', error ? 'text-clay' : 'text-muted')}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
