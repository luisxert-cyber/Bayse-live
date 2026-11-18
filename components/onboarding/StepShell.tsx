import type { ReactNode } from 'react';

export function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section aria-labelledby="step-title">
      <h1 id="step-title" className="text-xl font-semibold sm:text-[32px] sm:leading-[38px]">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}
