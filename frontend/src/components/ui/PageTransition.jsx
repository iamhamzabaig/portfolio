import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';

// Apple-style route transition. Each page settles in with a soft fade + rise on
// the signature ease, and navigation resets to the top the way apple.com does —
// unless the URL carries an anchor (#section), which stays a deep-link.
// Reduced-motion: the entrance is skipped; only the scroll reset remains.

const appleEase = [0.16, 1, 0.3, 1];

export function PageTransition({ children }) {
  const { pathname, hash } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: appleEase }}
    >
      {children}
    </motion.div>
  );
}
