import { useRef } from 'react';
import { Activity, ArrowRight, Cloud, Code2, Gauge, Server, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CountUp } from '../../components/ui/CountUp.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { RevealStagger, RevealItem } from '../../components/ui/Reveal.jsx';
import { RevealScope } from '../../components/ui/RevealScope.jsx';
import { Sparkline } from '../../components/ui/Sparkline.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { fallbackProjects, fallbackProfile } from '../../utils/fallbackData.js';

// Trust strip under the hero CTAs — proof over soft facts (what/where/how long).
const trustPoints = [
  '3+ years shipping',
  'Enterprise ERP & real-time',
  'Angular · React · Node',
  'Currently @ Code Agrius'
];

// Services offered — the client-facing menu. The AI card is flagged `featured`
// so it reads as the differentiator, not an afterthought.
const services = [
  {
    title: 'Web & App Development',
    icon: Code2,
    text: 'Production frontends in Angular, React, and Next.js — typed component libraries, design systems, and Nx monorepos built to scale.',
    tools: ['Angular', 'React', 'Next.js', 'TypeScript']
  },
  {
    title: 'Backend & APIs',
    icon: Server,
    text: 'REST, GraphQL, and WebSocket services on Node/Express with JWT auth, RBAC, and clean, documented contracts.',
    tools: ['Node', 'Express', 'GraphQL', 'PostgreSQL']
  },
  {
    title: 'AI Integration',
    icon: Sparkles,
    text: 'LLM-powered features that ship: chatbots, RAG pipelines, semantic search, and workflow automation wired to the Claude and OpenAI APIs.',
    tools: ['Claude API', 'OpenAI', 'RAG', 'Embeddings'],
    featured: true
  },
  {
    title: 'Performance Engineering',
    icon: Gauge,
    text: 'Lighthouse gains, smaller bundles, and faster SSR — profiling and migrations that turn slow apps into measurable wins.',
    tools: ['Lighthouse', 'SSR', 'Profiling', 'Core Web Vitals']
  },
  {
    title: 'Real-time Systems',
    icon: Activity,
    text: 'Live dashboards and event-driven UIs with Socket.io and optimistic updates that stay snappy under load.',
    tools: ['Socket.io', 'WebSockets', 'RxJS', 'ECharts']
  },
  {
    title: 'Cloud & Deployment',
    icon: Cloud,
    text: 'CI/CD, containerized deploys, and edge hosting — from first commit to production, automated and observable.',
    tools: ['Vercel', 'Docker', 'CI/CD', 'Supabase']
  }
];

export default function Home() {
  const profileQuery = useProfile();
  const projectsQuery = useProjects({ featured: true });
  const profile = profileQuery.data || fallbackProfile;
  const stats = profile.stats?.length ? profile.stats : fallbackProfile.stats;
  const featured = (projectsQuery.data?.length ? projectsQuery.data : fallbackProjects)
    .filter((project) => project.featured)
    .slice(0, 3);

  // Gentle pointer depth: the ambient glow trails the cursor, the headline drifts
  // the opposite way at a smaller magnitude — two planes, kept subtle and calm.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glowX = useSpring(px, { stiffness: 50, damping: 20 });
  const glowY = useSpring(py, { stiffness: 50, damping: 20 });

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width - 0.5) * 60);
    py.set(((event.clientY - rect.top) / rect.height - 0.5) * 60);
  };
  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  // Scroll-scrubbed hero exit — Apple ties motion to scroll position rather than
  // firing it once. As the hero scrolls away, its content drifts up, recedes,
  // and fades. Disabled under reduced-motion (style falls back to static).
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const heroScrub = reduceMotion ? undefined : { opacity: heroOpacity, y: heroY, scale: heroScale };

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        className="relative overflow-hidden"
      >
        {/* Ambient wash — kept faint and single-focal so the drama comes from the
            type, not the glow. Apple's heroes are near-bare canvases. */}
        <motion.div
          aria-hidden="true"
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[120px]"
        />
        <Container className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center py-24 text-center">
          <motion.div style={heroScrub} className="flex flex-col items-center">
          <RevealScope immediate deps={[profile.headline]} className="flex flex-col items-center">
            {/* Role eyebrow — answers "what kind of engineer" before the headline. */}
            <Eyebrow data-fade className="mb-4 sm:mb-5">
              {profile.role}
            </Eyebrow>
            {/* Static anchor headline — no reveal or pointer drift, so it reads as
                a solid, confident statement while the surrounding lines animate. */}
            <h1 className="font-display text-fluid-hero font-semibold text-ink">
              I build software that <span className="text-accent">scales.</span>
            </h1>

            <p data-split className="mt-7 max-w-2xl text-body-lg text-muted sm:text-xl">{profile.headline}</p>

            <div data-fade className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button as={Link} to="/projects">
                View work
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-body font-medium text-accent hover:underline underline-offset-4"
              >
                Get in touch <span aria-hidden="true">›</span>
              </Link>
            </div>

            <div data-fade className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-caption text-muted">
              {trustPoints.map((item, i) => (
                <span key={item} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="text-border">·</span>}
                  {item}
                </span>
              ))}
            </div>
          </RevealScope>
          </motion.div>
        </Container>
      </section>

      {/* ── By the numbers ─────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <RevealScope className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow data-fade>By the numbers</Eyebrow>
            <h2 data-split className="mt-3 font-display text-fluid-h2 font-semibold text-ink">
              Three years, measured in outcomes.
            </h2>
          </RevealScope>
          {/* Number bar — a rounded panel holding the figures, with hairline rules
              separating them: vertical between columns, horizontal between the
              stacked rows, all collapsing to a single row on large screens. */}
          <RevealStagger className="grid grid-cols-2 overflow-hidden rounded-card border border-border bg-panel shadow-soft lg:grid-cols-4">
            {stats.slice(0, 4).map((stat, i) => {
              const numeric = Number(stat.value);
              // Per-cell divider borders, recomputed at the lg breakpoint where the
              // 2×2 grid becomes a single 1×4 row.
              const dividers = [
                '',
                'border-l border-border',
                'border-t border-border lg:border-t-0 lg:border-l',
                'border-l border-t border-border lg:border-t-0'
              ][i];
              return (
                <RevealItem key={stat.label} className={`flex flex-col items-center px-6 py-8 text-center ${dividers}`}>
                  {stat.eyebrow && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">{stat.eyebrow}</p>
                  )}
                  <p className="mt-3 flex items-start justify-center font-display text-fluid-stat font-semibold text-ink">
                    {Number.isFinite(numeric) ? <CountUp value={numeric} /> : stat.value}
                    {stat.suffix && <span className="ml-0.5 mt-1 text-2xl font-semibold text-accent">{stat.suffix}</span>}
                  </p>
                  <p className="mt-4 text-body-sm font-semibold text-ink">{stat.label}</p>
                  <p className="mt-1 text-caption text-muted">{stat.description}</p>
                  {stat.spark && <Sparkline points={stat.spark} className="mx-auto mt-4 text-accent/80" />}
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>

      {/* ── Selected work ──────────────────────────────────────────────── */}
      <section className="py-24 sm:py-28">
        <Container>
          <RevealScope className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow data-fade>Selected work</Eyebrow>
              <h2 data-split className="mt-3 max-w-xl font-display text-fluid-h2 font-semibold text-ink">
                Designed, shipped, and measured.
              </h2>
            </div>
            <Link
              data-fade
              to="/projects"
              className="inline-flex items-center gap-1 text-body font-medium text-accent hover:underline underline-offset-4"
            >
              All projects <span aria-hidden="true">›</span>
            </Link>
          </RevealScope>
          {projectsQuery.isLoading && !projectsQuery.data ? (
            <Spinner label="Loading projects" />
          ) : (
            <ProjectGrid projects={featured} />
          )}
        </Container>
      </section>

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <RevealScope className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow data-fade>Services</Eyebrow>
            <h2 data-split className="mt-3 font-display text-fluid-h2 font-semibold text-ink">
              What I can build for you.
            </h2>
            <p data-split className="mt-4 text-body-lg text-muted">
              End-to-end product engineering — from the frontend and APIs to performance, real-time, and AI.
            </p>
          </RevealScope>
          <RevealStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <RevealItem
                  key={item.title}
                  className={`group flex flex-col rounded-card bg-panel p-8 shadow-soft transition duration-500 ease-apple hover:-translate-y-1.5 hover:shadow-lift ${
                    item.featured ? 'ring-2 ring-accent/40' : 'ring-1 ring-border/70'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.5}
                    className="text-accent transition-transform duration-500 ease-apple group-hover:scale-110"
                  />
                  <div className="mt-6 flex items-center gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                    {item.featured && (
                      <Badge tone="accent" size="xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-body-sm text-muted">{item.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2 pt-1">
                    {item.tools.map((tool) => (
                      <Badge key={tool}>{tool}</Badge>
                    ))}
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-36">
        <Container>
          <RevealScope className="mx-auto max-w-3xl text-center">
            <h2 data-split className="font-display text-fluid-cta font-semibold text-ink">
              Let&apos;s build something
              <br className="hidden sm:block" /> <span className="text-accent">great together.</span>
            </h2>
            <p data-split className="mx-auto mt-6 max-w-xl text-body-lg text-muted">
              Tell me what you&apos;re building and where it stands today. I reply within a day.
            </p>
            <div data-fade className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button as={Link} to="/contact">
                Start a conversation
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
              <Link
                to="/about"
                className="inline-flex items-center gap-1 text-body font-medium text-accent hover:underline underline-offset-4"
              >
                More about me <span aria-hidden="true">›</span>
              </Link>
            </div>
          </RevealScope>
        </Container>
      </section>
    </>
  );
}
