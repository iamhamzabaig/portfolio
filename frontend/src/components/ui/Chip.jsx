import { Chip as HeroChip } from '@heroui/react';

export function Chip({ children, className = '' }) {
  return (
    <HeroChip
      variant="bordered"
      radius="full"
      className={`border-border bg-surface font-mono text-[11px] text-muted ${className}`}
    >
      {children}
    </HeroChip>
  );
}
