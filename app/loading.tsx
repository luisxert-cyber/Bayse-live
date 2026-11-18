export default function Loading() {
  return (
    <div className="page space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-2/3 animate-pulse rounded-xl bg-stone/60" />
      <div className="h-40 animate-pulse rounded-card bg-stone/40" />
      <div className="h-24 animate-pulse rounded-card bg-stone/40" />
    </div>
  );
}
