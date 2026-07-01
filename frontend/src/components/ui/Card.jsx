import { Card as HeroCard } from '@heroui/react';

export function Card({ children, className = '' }) {
  return (
    <HeroCard shadow="none" radius="lg" className={`soft-card ${className}`}>
      {children}
    </HeroCard>
  );
}
