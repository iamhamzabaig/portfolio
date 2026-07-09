// The small blue section label above a headline (Apple's quiet colored eyebrow).
// Previously redefined locally in Home and re-inlined on every other page; this is
// now the one source of truth. Spreads props so callers can pass through extras.
export function Eyebrow({ as: Component = 'p', className = '', children, ...props }) {
  return (
    <Component className={`text-eyebrow font-semibold text-accent ${className}`} {...props}>
      {children}
    </Component>
  );
}
