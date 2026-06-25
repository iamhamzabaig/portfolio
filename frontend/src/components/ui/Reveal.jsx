import { motion } from 'motion/react';

// Scroll-reveal primitives shared across sections. Content rises + fades in once
// as it enters the viewport. Honors reduced motion automatically via the app's
// <MotionConfig reducedMotion="user"> (transforms drop out, opacity stays).

const riseItem = {
  hidden: { y: 22, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 130, damping: 18 } }
};

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } }
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
