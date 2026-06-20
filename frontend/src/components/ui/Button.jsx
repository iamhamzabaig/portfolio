const variants = {
  primary: 'border-accent bg-accent text-white hover:bg-[#6d5fed]',
  outline: 'border-border bg-transparent text-ink hover:border-accent hover:text-white',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink',
  danger: 'border-danger bg-danger text-white hover:bg-[#f43f5e]'
};

export function Button({ as: Component = 'button', variant = 'primary', className = '', type, ...props }) {
  const buttonType = Component === 'button' ? type || 'button' : type;
  return (
    <Component
      type={buttonType}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
