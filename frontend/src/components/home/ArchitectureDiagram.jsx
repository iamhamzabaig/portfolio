import { motion, useReducedMotion } from 'motion/react';
import { Container } from '../layout/Container.jsx';
import { Eyebrow } from '../ui/Eyebrow.jsx';
import { RevealScope } from '../ui/RevealScope.jsx';
import { RevealStagger, RevealItem } from '../ui/Reveal.jsx';
import { engineeringApproach } from '../../utils/fallbackData.js';

// "How I engineer" — turns the RAG claim into a visible architecture. The SVG
// pipeline draws its own connectors on scroll (SVG pathLength 0→1), and the
// principles stagger in beside it. Everything is token-colored and theme-aware;
// under reduced motion the diagram renders already-drawn.

const NODE_W = 120;
const NODE_H = 66;
const GAP = 40;
const PAD = 12;
const STEP = NODE_W + GAP;

const appleEase = [0.16, 1, 0.3, 1];
const viewport = { once: true, margin: '-60px' };

// Store + model nodes get an accent outline; the rest are neutral panels.
const ACCENTED = new Set(['store', 'llm']);

export function ArchitectureDiagram() {
  const reduce = useReducedMotion();
  const nodes = engineeringApproach.pipeline;
  const width = PAD * 2 + nodes.length * NODE_W + (nodes.length - 1) * GAP;
  const height = 84;
  const cy = height / 2;

  return (
    <section className="py-24 sm:py-28">
      <Container>
        <RevealScope className="mx-auto max-w-2xl text-center">
          <Eyebrow data-fade>How I engineer</Eyebrow>
          <h2 data-split className="mt-3 font-display text-fluid-h2 font-semibold text-ink">
            Systems, not scripts.
          </h2>
          <p data-split className="mt-4 text-body-lg text-muted">
            A production retrieval pipeline — every stage typed, measured, and grounded. This is the
            shape of the AI Knowledge Assistant, drawn from ingest to answer.
          </p>
        </RevealScope>

        {/* Diagram scrolls horizontally on narrow screens rather than shrinking to
            illegible text. */}
        <div className="overflow-x-auto pb-2">
          <motion.svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Retrieval pipeline: Ingest, Embed, pgvector, Retrieve, LLM, React UI"
            className="mx-auto block h-auto w-full min-w-[680px] max-w-4xl"
            fill="none"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <defs>
              <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="rgb(var(--accent))" fillOpacity="0.8" />
              </marker>
            </defs>

            {/* Connectors — drawn left to right, staggered. */}
            {nodes.slice(0, -1).map((node, i) => {
              const x1 = PAD + i * STEP + NODE_W;
              const x2 = PAD + (i + 1) * STEP;
              return (
                <motion.line
                  key={`edge-${node.id}`}
                  x1={x1}
                  y1={cy}
                  x2={x2 - 2}
                  y2={cy}
                  stroke="rgb(var(--accent))"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                  markerEnd="url(#arch-arrow)"
                  initial={reduce ? false : 'hidden'}
                  variants={
                    reduce
                      ? undefined
                      : {
                          hidden: { pathLength: 0, opacity: 0 },
                          show: {
                            pathLength: 1,
                            opacity: 1,
                            transition: { duration: 0.5, ease: appleEase, delay: 0.15 + i * 0.18 }
                          }
                        }
                  }
                />
              );
            })}

            {/* Nodes — labeled boxes; store/model accented. */}
            {nodes.map((node, i) => {
              const x = PAD + i * STEP;
              const accent = ACCENTED.has(node.id);
              return (
                <motion.g
                  key={node.id}
                  initial={reduce ? false : 'hidden'}
                  variants={
                    reduce
                      ? undefined
                      : {
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: appleEase, delay: i * 0.18 } }
                        }
                  }
                >
                  <rect
                    x={x}
                    y={cy - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx="10"
                    fill="rgb(var(--panel))"
                    stroke={accent ? 'rgb(var(--accent))' : 'rgb(var(--border))'}
                    strokeOpacity={accent ? '0.6' : '1'}
                    strokeWidth="1"
                  />
                  <text
                    x={x + NODE_W / 2}
                    y={cy - 6}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="14"
                    fontWeight="600"
                    fill="rgb(var(--ink))"
                  >
                    {node.label}
                  </text>
                  <text
                    x={x + NODE_W / 2}
                    y={cy + 15}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="10.5"
                    fill="rgb(var(--muted))"
                  >
                    {node.sub}
                  </text>
                </motion.g>
              );
            })}
          </motion.svg>
        </div>

        {/* Principles — the operating rules behind the pipeline. */}
        <RevealStagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {engineeringApproach.principles.map((p, i) => (
            <RevealItem
              key={p.title}
              className="rounded-card border border-border/70 bg-panel bg-gradient-to-br from-accent/[0.05] to-transparent p-6 shadow-soft"
            >
              <p className="font-mono text-caption text-accent">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-display text-body font-semibold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 text-body-sm text-muted">{p.text}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
