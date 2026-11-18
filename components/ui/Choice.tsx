import { cx } from './cx';

/** A large tappable option for onboarding. Works as a radio or checkbox inside a form. */
export function Choice({ name, value, label, hint, type, defaultChecked }: { name: string; value: string; label: string; hint?: string; type: 'radio' | 'checkbox'; defaultChecked?: boolean }) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className="group block cursor-pointer">
      <input id={id} type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={cx(
          'flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-stone bg-surface px-4 py-3 transition-colors',
          'peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent',
          'hover:border-ink/40',
        )}
      >
        <span>
          <span className="block text-base font-medium">{label}</span>
          {hint && <span className="block text-sm opacity-70">{hint}</span>}
        </span>
        <span aria-hidden className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current opacity-60', type === 'checkbox' && 'rounded-md')}>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 opacity-0 group-has-[:checked]:opacity-100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5l3 3 7-7" /></svg>
        </span>
      </span>
    </label>
  );
}
