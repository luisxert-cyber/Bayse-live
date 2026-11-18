export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-ink">{message}</p>;
}
