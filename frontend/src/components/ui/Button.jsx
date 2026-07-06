// Apple-style controls: fully-rounded pills with a soft press. `link` renders
// the blue chevron affordance Apple uses for secondary actions ("Learn more ›").
const variants = {
  primary: 'border-transparent bg-accent text-white hover:brightness-110 active:brightness-95',
  secondary: 'border-transparent bg-surface text-ink hover:bg-border/60',
  outline: 'border-ink/15 bg-transparent text-ink hover:bg-ink/[0.04]',
  link: 'border-transparent bg-transparent px-0 text-accent hover:underline underline-offset-4',
  danger: 'border-transparent bg-danger text-white hover:brightness-110'
};

export function Button({ as: Component = 'button', variant = 'primary', className = '', type, ...props }) {
  const buttonType = Component === 'button' ? type || 'button' : type;
  return (
    <Component
      type={buttonType}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-6 text-[15px] font-medium leading-none transition duration-300 ease-apple disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
