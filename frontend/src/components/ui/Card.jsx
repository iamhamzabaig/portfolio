export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-border bg-panel shadow-soft ${className}`}>{children}</div>;
}
