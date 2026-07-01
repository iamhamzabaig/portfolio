import { Skeleton as HeroSkeleton } from '@heroui/react';

export function Skeleton({ className = '' }) {
  return <HeroSkeleton className={`rounded-2xl ${className}`} />;
}
