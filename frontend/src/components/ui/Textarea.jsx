import { forwardRef } from 'react';
import { Textarea as HeroTextarea } from '@heroui/react';

export const Textarea = forwardRef(function Textarea({ id, label, error, className = '', ...props }, ref) {
  return (
    <HeroTextarea
      id={id}
      ref={ref}
      label={label}
      labelPlacement="outside"
      variant="bordered"
      radius="lg"
      minRows={5}
      isInvalid={Boolean(error)}
      errorMessage={error}
      classNames={{ errorMessage: 'text-danger', inputWrapper: 'bg-panel border-border' }}
      className={className}
      {...props}
    />
  );
});
