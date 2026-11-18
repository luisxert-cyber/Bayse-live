/** Official BAYSE logo (from Luis's brand files), swapped for light and dark themes by CSS in globals.css. */
export function Wordmark({ className = 'h-5' }: { className?: string }) {
  return (
    <span className="inline-flex items-center" aria-label="BAYSE" role="img">
      <img src="/brand/bayse-logo-dark.png" alt="" className={`logo-for-light w-auto ${className}`} />
      <img src="/brand/bayse-logo-light.png" alt="" className={`logo-for-dark w-auto ${className}`} />
    </span>
  );
}
