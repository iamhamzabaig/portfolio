export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-card border border-border bg-panel shadow-soft ${className}`}>{children}</div>
  );
}
