import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

// Route transition. On phones pages slide horizontally like a native iOS push/
// pop stack; on desktop they keep the Apple-style fade + rise. Navigation
// resets scroll to the top the way apple.com does — unless the URL carries an
// anchor (#section), which stays a deep-link. Reduced-motion: no entrance, only
// the scroll reset.
//
// Rendered inside an <AnimatePresence mode="popLayout"> in PublicLayout, keyed
// by pathname, so the outgoing page animates out while the new one slides in.
// `direction` (1 forward / -1 back) is supplied by the layout.

const appleEase = [0.16, 1, 0.3, 1];

export function PageTransition({ children, direction = 1 }) {
  const { pathname, hash } = useLocation();
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  if (reduce) {
    return <div>{children}</div>;
  }

  const variants = isMobile
    ? {
        initial: { x: `${direction * 28}%`, opacity: 0.6 },
        animate: { x: '0%', opacity: 1 },
        exit: { x: `${direction * -18}%`, opacity: 0 }
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 }
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: isMobile ? 0.34 : 0.5, ease: appleEase }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
