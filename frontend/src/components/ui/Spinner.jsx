import { Spinner as HeroSpinner } from '@heroui/react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center p-8">
      <HeroSpinner color="primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
