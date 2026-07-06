// Apple-style control. One component covers every button in the app:
//   variant  — visual role (primary / secondary / outline / ghost / link / danger)
//   size     — sm | md | lg (height + horizontal padding + text token)
//   iconOnly — square, icon-centered target (pass an aria-label)
//   loading  — leading spinner, disables the control, sets aria-busy
// `as` swaps the element (e.g. Link) while keeping the styling. Keyboard focus is
// handled globally by the :focus-visible ring in styles/index.css.
const base =
  'inline-flex items-center justify-center gap-1.5 rounded-full border font-medium leading-none transition duration-300 ease-apple active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'border-transparent bg-accent text-on-accent hover:brightness-110 active:brightness-95',
  secondary: 'border-transparent bg-surface text-ink hover:bg-border/60',
  outline: 'border-ink/15 bg-transparent text-ink hover:bg-ink/[0.04]',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink',
  link: 'border-transparent bg-transparent text-accent hover:underline underline-offset-4',
  danger: 'border-transparent bg-danger text-on-accent hover:brightness-110'
};

const sizeText = { sm: 'text-caption', md: 'text-body-sm', lg: 'text-body' };
const sizePad = { sm: 'min-h-9 px-4', md: 'min-h-11 px-6', lg: 'min-h-12 px-7' };
const sizeIcon = { sm: 'min-h-9 w-9', md: 'min-h-11 w-11', lg: 'min-h-12 w-12' };

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  disabled,
  type,
  className = '',
  children,
  ...props
}) {
  const buttonType = Component === 'button' ? type || 'button' : type;
  // Link is inline text — no box padding; every other variant gets sizing.
  const spacing = iconOnly ? sizeIcon[size] : variant === 'link' ? '' : sizePad[size];
  return (
    <Component
      type={buttonType}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={`${base} ${sizeText[size]} ${spacing} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {iconOnly && loading ? null : children}
    </Component>
  );
}
