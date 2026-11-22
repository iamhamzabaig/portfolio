// The small section label above a headline, styled as a code comment
// (`// label`) to match the editor theme. One source of truth for every page.
export function Eyebrow({ as: Component = 'p', className = '', children, ...props }) {
  return (
    <Component className={`font-mono text-eyebrow syn-comment ${className}`} {...props}>
      <span aria-hidden="true">{'// '}</span>
      {children}
    </Component>
  );
}
