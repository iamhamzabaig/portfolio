import { useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { createScrollMotion } from '../../lib/scrollMotion.js';
import { enableMagnetic } from '../../lib/magnetic.js';

// Scene controllers own motion. Entrance is opacity-only: a transform or filter
// here would become the containing block for GSAP pins and fixed elements.
export function PageTransition({ children }) {
  const root = useRef(null);
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    else document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    const stopScroll = createScrollMotion(root.current);
    const stopMagnetic = enableMagnetic(root.current);
    return () => { stopScroll(); stopMagnetic(); };
  }, [pathname, hash]);
  return (
    <motion.div ref={root} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
      <div aria-hidden="true" data-scene="progress"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-accent motion-reduce:hidden" />
      {children}
    </motion.div>
  );
}
