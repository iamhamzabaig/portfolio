import { useEffect, useRef, useState } from 'react';
import { Binary, Database, FileText, MonitorSmartphone, Search, Sparkles } from 'lucide-react';

// Animated-beam diagram: pipeline steps as nodes, joined by hairline curves.
// A glowing pulse runs the chain in order, lighting each node as it lands.
// Snake layout on wide screens (row one left→right, row two right→left),
// one column on phones; connectors are measured from the live layout.
const icons = { ingest: FileText, embed: Binary, store: Database, retrieve: Search, llm: Sparkles, ui: MonitorSmartphone };
const STEP = 1; // seconds per hop

function connector(a, b, box) {
  const ax = a.left + a.width / 2 - box.left;
  const ay = a.top + a.height / 2 - box.top;
  const bx = b.left + b.width / 2 - box.left;
  const by = b.top + b.height / 2 - box.top;
  if (Math.abs(ay - by) < 8) {
    // Same row: edge to edge with a gentle upward arc.
    const dir = bx > ax ? 1 : -1;
    const x1 = ax + (dir * a.width) / 2;
    const x2 = bx - (dir * b.width) / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${ay} C ${mx} ${ay - 18}, ${mx} ${by - 18}, ${x2} ${by}`;
  }
  // Row change: bottom edge to top edge, S-curve.
  const y1 = ay + a.height / 2;
  const y2 = by - b.height / 2;
  const my = (y1 + y2) / 2;
  return `M ${ax} ${y1} C ${ax} ${my}, ${bx} ${my}, ${bx} ${y2}`;
}

export function PipelineBeam({ steps }) {
  const box = useRef(null);
  const nodes = useRef([]);
  const [paths, setPaths] = useState([]);
  const cycle = (steps.length - 1) * STEP + 1.5;

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const b = box.current.getBoundingClientRect();
      const r = nodes.current.map((n) => n.getBoundingClientRect());
      setPaths(r.slice(1).map((rect, i) => connector(r[i], rect, b)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [steps.length]);

  return (
    <div ref={box} className="beam relative" style={{ '--cycle': `${cycle}s`, '--hop': `${STEP}s` }}>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {paths.map((d, i) => (
          <g key={i} style={{ '--k': i }}>
            <path d={d} className="beam-base" />
            <path d={d} pathLength="1" className="beam-pulse" />
          </g>
        ))}
      </svg>
      <ol className="relative grid gap-x-16 gap-y-12 sm:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = icons[step.id] || Sparkles;
          // Snake order on wide screens: 1 2 3 / 6 5 4.
          const order = i < 3 ? i : 3 + (steps.length - 1 - i);
          return (
            <li key={step.id} className="flex justify-center sm:[order:var(--order)]" style={{ '--order': order }}>
              <div
                ref={(el) => { nodes.current[i] = el; }}
                className="beam-node"
                style={{ '--k': i }}
              >
                <span className="beam-icon"><Icon aria-hidden="true" size={18} strokeWidth={1.6} /></span>
                <span>
                  <span className="mono block text-micro text-muted">Step {i + 1}</span>
                  <strong className="block text-body font-medium">{step.label}</strong>
                  <span className="block text-caption text-muted">{step.sub}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
