import { Activity, ArrowRight, Cloud, Code2, Gauge, Server, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { ArchitectureDiagram } from '../../components/home/ArchitectureDiagram.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { Sparkline } from '../../components/ui/Sparkline.jsx';
import { TechMarquee } from '../../components/ui/TechMarquee.jsx';
import { EngineeringStatement, ProjectShowcase, SystemVisual } from '../../components/home/ScrollScenes.jsx';
import { PostCard } from '../../features/blog/components/PostCard.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { usePosts } from '../../features/blog/api/blog.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { fallbackProjects, fallbackPosts, fallbackProfile } from '../../utils/fallbackData.js';

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

  const postsQuery = usePosts();
  const latestPosts = (postsQuery.data?.length ? postsQuery.data : fallbackPosts)
    .filter((post) => post.published !== false)
    .slice(0, 3);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        data-scene="hero"
        className="hero-scene relative"
      >
        <Container className="hero-stage relative flex flex-col items-center justify-center text-center">
          <div data-hero-content className="hero-copy flex flex-col items-center">
            {/* Role eyebrow — answers "what kind of engineer" before the headline. */}
            <Eyebrow className="mb-4 sm:mb-5">
              {profile.role}
            </Eyebrow>
            <h1 className="font-display text-fluid-hero font-semibold text-ink">
              I build software that <span className="text-accent">scales.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-body-lg text-muted">{profile.headline}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-caption text-muted">
              {trustPoints.map((item, i) => (
                <span key={item} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="text-border">·</span>}
                  {item}
                </span>
              ))}
            </div>
          </div>
          <SystemVisual />
        </Container>
      </section>

      {/* ── Tech stack marquee ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <p className="mb-10 text-center text-micro font-semibold uppercase tracking-[0.14em] text-muted/70">
          Technologies I work with
        </p>
        <TechMarquee />
      </section>

      {/* ── By the numbers ─────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>By the numbers</Eyebrow>
            <h2 data-motion="heading" className="mt-3 font-display text-fluid-h2 font-semibold text-ink">
              Three years, measured in outcomes.
            </h2>
          </div>
          {/* Number row — figures separated by hairline rules only, no card. */}
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.slice(0, 4).map((stat, i) => {
              // Per-cell divider borders, recomputed at the lg breakpoint where the
              // 2×2 grid becomes a single 1×4 row.
              const dividers = [
                '',
                'border-l border-border',
                'border-t border-border lg:border-t-0 lg:border-l',
                'border-l border-t border-border lg:border-t-0'
              ][i];
              return (
                <div key={stat.label} className={`flex flex-col items-center px-6 py-8 text-center ${dividers}`}>
                  {stat.eyebrow && (
                    <p className="text-micro font-semibold uppercase text-muted">{stat.eyebrow}</p>
                  )}
                  <p className="mt-3 flex items-start justify-center font-display text-fluid-stat font-semibold text-ink">
                    {stat.value}
                    {/* type-exempt: suffix glyph optically sized to the stat numeral */}
                    {stat.suffix && <span className="ml-0.5 mt-1 text-2xl font-semibold text-accent">{stat.suffix}</span>}
                  </p>
                  <p className="mt-4 text-body-sm font-semibold text-ink">{stat.label}</p>
                  <p className="mt-1 text-caption text-muted">{stat.description}</p>
                  {stat.spark && <Sparkline points={stat.spark} className="mx-auto mt-4 text-accent/80" />}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── How I engineer ─────────────────────────────────────────────── */}
      <EngineeringStatement />
      <ArchitectureDiagram />

      {/* ── Selected work ──────────────────────────────────────────────── */}
      <ProjectShowcase projects={featured} />

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section data-scene="services" className="services-scene bg-surface py-24 sm:py-28">
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>Services</Eyebrow>
            <h2 data-motion="heading" className="mt-3 font-display text-fluid-h2 font-semibold text-ink">
              What I can build for you.
            </h2>
            <p className="mt-4 text-body text-muted">
              End-to-end product engineering — from the frontend and APIs to performance, real-time, and AI.
            </p>
          </div>
          <div data-services-track className="services-track grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  data-service-card
                  className={`group flex flex-col rounded-card bg-panel p-8 shadow-soft transition-shadow duration-500 ease-apple hover:shadow-lift ${
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
                    <h3 className="font-display text-fluid-h3 font-semibold text-ink">{item.title}</h3>
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
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Latest writing ─────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="bg-surface py-24 sm:py-28">
          <Container>
            <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>Writing</Eyebrow>
                <h2 data-motion="heading" className="mt-3 max-w-xl font-display text-fluid-h2 font-semibold text-ink">
                  Notes from the work.
                </h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1 text-body font-medium text-accent hover:underline underline-offset-4"
              >
                All writing <span aria-hidden="true">›</span>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <PostCard key={post._id || post.slug} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-36">
        <Container>
          <div data-motion="closing" className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-fluid-cta font-semibold text-ink">
              Let&apos;s build something
              <br className="hidden sm:block" /> <span className="text-accent">great together.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-body text-muted">
              Tell me what you&apos;re building and where it stands today. I reply within a day.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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
          </div>
        </Container>
      </section>
    </>
  );
}
