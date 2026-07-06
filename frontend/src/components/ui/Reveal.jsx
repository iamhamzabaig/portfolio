import { motion } from 'motion/react';

// Scroll-reveal primitives shared across sections. Content rises + fades in once
// as it enters the viewport, on Apple's signature ease (a soft deceleration).
// Honors reduced motion automatically via the app's <MotionConfig
// reducedMotion="user"> (transforms drop out, opacity stays).

const appleEase = [0.16, 1, 0.3, 1];

// Exported so components with their own <motion> root (e.g. ProjectCard) can opt
// into a <RevealStagger> parent's entrance without an extra wrapper element.
export const revealRise = {
  hidden: { y: 28, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: appleEase } }
};

const riseItem = revealRise;

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

const viewport = { once: true, margin: '-80px' };

// Single block that reveals itself on enter.
export function Reveal({ as = 'div', className = '', children, ...props }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag variants={riseItem} initial="hidden" whileInView="show" viewport={viewport} className={className} {...props}>
      {children}
    </Tag>
  );
}

// Parent that staggers its <RevealItem> children as the group enters.
export function RevealStagger({ as = 'div', className = '', children, ...props }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag variants={staggerParent} initial="hidden" whileInView="show" viewport={viewport} className={className} {...props}>
      {children}
    </Tag>
  );
}

// Child of <RevealStagger>; inherits the parent's animation state.
export function RevealItem({ as = 'div', className = '', children, ...props }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag variants={riseItem} className={className} {...props}>
      {children}
    </Tag>
  );
}
