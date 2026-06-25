import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion } from 'motion/react';

// Counts an integer up from 0 to `value` once it scrolls into view. Under
// reduced motion (or before it enters), it just shows the final number.
export function CountUp({ value, duration = 1.4, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionVal = useMotionValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return undefined;

    if (reduce) {
      ref.current.textContent = String(value);
      return undefined;
    }

    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = String(Math.round(latest));
      }
    });

    return () => controls.stop();
  }, [inView, value, duration, reduce, motionVal]);

  return (
    <span ref={ref} className={className}>
      {reduce ? value : 0}
    </span>
  );
}
