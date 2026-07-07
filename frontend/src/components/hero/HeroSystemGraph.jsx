import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

// Restrained "systems" hero backdrop: a thin, hand-placed network graph with
// data pulses gliding along its edges. Reads as topology/architecture, not a
// decorative blob. Colors come from CSS tokens (rgb(var(--…))) so it is theme-
// aware for free; motion is gated on reduced-motion + in-view so an offscreen
// or motion-averse visitor pays nothing.

// Fixed layout in a 560×460 space — deterministic so it looks engineered, not
// noisy. `hub` nodes render a touch larger to imply focal services.
const NODES = {
  ingest: { x: 70, y: 96 },
  embed: { x: 250, y: 58, hub: true },
  api: { x: 452, y: 104 },
  store: { x: 150, y: 236, hub: true },
  retrieve: { x: 338, y: 228, hub: true },
  edge: { x: 486, y: 268 },
  ui: { x: 96, y: 372 },
  llm: { x: 292, y: 402, hub: true },
  stream: { x: 464, y: 388 }
};

// Undirected edges wiring the topology together.
const EDGES = [
  ['ingest', 'embed'],
  ['embed', 'api'],
  ['ingest', 'store'],
  ['embed', 'retrieve'],
  ['embed', 'store'],
  ['api', 'edge'],
  ['store', 'retrieve'],
  ['retrieve', 'edge'],
  ['store', 'ui'],
  ['retrieve', 'llm'],
  ['edge', 'stream'],
  ['ui', 'llm'],
  ['llm', 'stream'],
  ['retrieve', 'stream']
];

// Edges that carry a moving pulse (a subset, so the field stays calm). Each gets
// a staggered, slightly varied cycle derived from its index — no randomness.
const PULSES = [
  ['ingest', 'embed'],
  ['embed', 'retrieve'],
  ['store', 'retrieve'],
  ['retrieve', 'llm'],
  ['retrieve', 'edge'],
  ['llm', 'stream']
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !ref.current) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function Pulse({ from, to, index }) {
  const a = NODES[from];
  const b = NODES[to];
  // Vary the trip time a little per-edge so pulses never lockstep.
  const duration = 3.6 + (index % 3) * 0.7;
  // Position keyframes must match the length of `times` (4), so interpolate the
  // fade-in and fade-out points along the edge rather than using two endpoints.
  const at = (start, end, p) => start + (end - start) * p;
  return (
    <motion.circle
      r={2.6}
      fill="rgb(var(--accent))"
      initial={{ cx: a.x, cy: a.y, opacity: 0 }}
      animate={{
        cx: [a.x, at(a.x, b.x, 0.12), at(a.x, b.x, 0.88), b.x],
        cy: [a.y, at(a.y, b.y, 0.12), at(a.y, b.y, 0.88), b.y],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration,
        times: [0, 0.12, 0.88, 1],
        repeat: Infinity,
        repeatDelay: 0.6,
        delay: index * 0.5,
        ease: 'linear'
      }}
    />
  );
}

export default function HeroSystemGraph({ pointer }) {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(containerRef);
  const animate = !reduceMotion && inView;

  // Pointer parallax — the graph drifts opposite the cursor at low magnitude,
  // sitting on a further plane than the headline. Falls back to a still value
  // when no pointer springs are supplied (or under reduced motion).
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const sourceX = pointer?.glowX ?? fallbackX;
  const sourceY = pointer?.glowY ?? fallbackY;
  const driftX = useTransform(sourceX, (v) => (reduceMotion ? 0 : v * -0.35));
  const driftY = useTransform(sourceY, (v) => (reduceMotion ? 0 : v * -0.35));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
    >
      <motion.svg
        viewBox="0 0 560 460"
        style={{ x: driftX, y: driftY }}
        className="h-[34rem] w-[34rem] max-w-none opacity-70 sm:h-[40rem] sm:w-[40rem]"
        fill="none"
      >
        {/* Edges — hairline, using the theme border token. */}
        {EDGES.map(([from, to]) => {
          const a = NODES[from];
          const b = NODES[to];
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgb(var(--accent))"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
          );
        })}

        {/* Data pulses — only mounted when animating, so they cost nothing at rest. */}
        {animate && PULSES.map(([from, to], i) => <Pulse key={`p-${from}-${to}`} from={from} to={to} index={i} />)}

        {/* Nodes — faint accent ring + solid core; hubs a touch larger. */}
        {Object.entries(NODES).map(([id, node]) => (
          <g key={id}>
            <circle cx={node.x} cy={node.y} r={node.hub ? 13 : 9} fill="rgb(var(--accent))" fillOpacity="0.06" />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.hub ? 7 : 5}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <circle cx={node.x} cy={node.y} r={node.hub ? 2.6 : 2} fill="rgb(var(--accent))" fillOpacity="0.85" />
          </g>
        ))}
      </motion.svg>
    </div>
  );
}
