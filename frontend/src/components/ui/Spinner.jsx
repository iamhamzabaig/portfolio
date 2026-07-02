export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center p-8">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
