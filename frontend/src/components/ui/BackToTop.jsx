import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';

// Appears after one viewport of scroll; its ring fills with page progress.
export function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40 });
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-panel/90 text-ink shadow-lift ring-1 ring-border backdrop-blur md:bottom-6 md:right-6"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="rgb(var(--accent))" strokeWidth="2"
              strokeLinecap="round" style={{ pathLength: progress }} />
          </svg>
          <ArrowUp aria-hidden="true" size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
