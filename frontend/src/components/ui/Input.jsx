import { forwardRef } from 'react';
import { Input as HeroInput } from '@heroui/react';

export const Input = forwardRef(function Input({ id, label, error, className = '', ...props }, ref) {
  return (
    <HeroInput
      id={id}
      ref={ref}
      label={label}
      labelPlacement="outside"
      variant="bordered"
      radius="lg"
      isInvalid={Boolean(error)}
      errorMessage={error}
      classNames={{ errorMessage: 'text-danger', inputWrapper: 'bg-panel border-border' }}
      className={className}
      {...props}
    />
  );
});
