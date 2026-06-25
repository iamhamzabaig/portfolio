import { motion } from 'motion/react';

export function StaticGlow({ glowX, glowY }) {
  return (
    <motion.div
      aria-hidden="true"
      data-testid="static-glow"
      style={{ x: glowX, y: glowY }}
      className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[120px]"
    />
  );
}
