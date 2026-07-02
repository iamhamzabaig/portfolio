export function Chip({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted ${className}`}>
      {children}
    </span>
  );
}
