import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';

// Timeline rail for the project list: a hairline beside the projects whose
// ember→violet beam grows with scroll; each project's number stays pinned
// beside it while it's on screen, and its node lights once reached.
export function ProjectTimeline({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 30%', 'end 60%'] });
  const height = useTransform(scrollYProgress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  const opacity = useTransform(scrollYProgress, [0, 0.04], [0, 1]);

  return (
    <div ref={ref} className="relative">
      <div aria-hidden="true" className="timeline-rail">
        <motion.div className="timeline-beam" style={{ height, opacity }} />
      </div>
      {children}
    </div>
  );
}

export function TimelineItem({ index, title, children }) {
  const ref = useRef(null);
  const reached = useInView(ref, { once: true, margin: '0px 0px -55% 0px' });
  const n = String(index + 1).padStart(2, '0');

  return (
    <div ref={ref} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 md:grid-cols-[7.5rem_minmax(0,1fr)] md:gap-6">
      <div className="sticky top-28 flex items-start gap-3 self-start">
        <div className={`timeline-node ${reached ? 'is-lit' : ''}`} aria-hidden="true" />
        <p className="timeline-index hidden md:flex" aria-hidden="true">
          <span className="timeline-num">{n}</span>
          <span className="timeline-title">{title}</span>
        </p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
