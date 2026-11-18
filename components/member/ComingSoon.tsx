import { EmptyState } from '@/components/ui';

/** Honest placeholder for a section that is planned but not built yet. */
export function ComingSoon({ title, phase, children }: { title: string; phase: string; children: React.ReactNode }) {
  return (
    <main className="page">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="mt-6">
        <EmptyState title="Coming soon">
          {children} <span className="mt-2 block text-xs">Planned in {phase}.</span>
        </EmptyState>
      </div>
    </main>
  );
}
