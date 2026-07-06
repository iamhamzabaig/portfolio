export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-border bg-panel shadow-soft ${className}`}>{children}</div>
  );
}
