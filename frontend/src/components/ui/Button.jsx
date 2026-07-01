import { Button as HeroButton } from '@heroui/react';

const variantProps = {
  primary: { color: 'primary', variant: 'solid', className: 'gradient-primary text-white shadow-glow' },
  outline: { variant: 'bordered', className: 'border-border text-ink data-[hover=true]:border-primary' },
  ghost: { variant: 'light', className: 'text-muted data-[hover=true]:text-ink' },
  danger: { color: 'danger', variant: 'solid', className: 'text-white' }
};

export function Button({ as, variant = 'primary', className = '', type, ...props }) {
  const v = variantProps[variant] ?? variantProps.primary;
  return (
    <HeroButton
      as={as}
      // When rendered as an anchor/Link, keep link semantics (HeroUI defaults to
      // role="button"). All `as` usages in this app navigate, so link is correct.
      role={as ? 'link' : undefined}
      type={as ? type : type || 'button'}
      radius="full"
      className={`font-semibold ${v.className} ${className}`}
      color={v.color}
      variant={v.variant}
      {...props}
    />
  );
}
