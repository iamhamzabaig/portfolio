import { ArrowRight, Boxes, Gauge, Radio } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CountUp } from '../../components/ui/CountUp.jsx';
import { Reveal, RevealStagger, RevealItem } from '../../components/ui/Reveal.jsx';
import { Sparkline } from '../../components/ui/Sparkline.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { fallbackProjects, fallbackProfile } from '../../utils/fallbackData.js';

const credentials = ['Islamabad, PK', 'Angular · React · Node', 'Nx monorepo', 'Since 2022'];

const capabilities = [
  {
    title: 'Enterprise frontends',
    icon: Boxes,
    text: 'Angular & React systems in Nx monorepos — signals, standalone APIs, and typed component libraries built to scale.'
  },
  {
    title: 'Performance work',
    icon: Gauge,
    text: 'Migrations and profiling that move Lighthouse, shrink bundles, and cut server render times measurably.'
  },
  {
    title: 'Real-time & APIs',
    icon: Radio,
    text: 'Node/Express services, WebSockets, and GraphQL with JWT auth and role-based access control.'
  }
];

// Small blue section eyebrow, Apple's quiet colored label above a headline.
function Eyebrow({ children }) {
  return <p className="text-[15px] font-semibold text-accent">{children}</p>;
}

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
  const headX = useTransform(useSpring(px, { stiffness: 70, damping: 22 }), (v) => v * -0.18);
  const headY = useTransform(useSpring(py, { stiffness: 70, damping: 22 }), (v) => v * -0.18);

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width - 0.5) * 60);
    py.set(((event.clientY - rect.top) / rect.height - 0.5) * 60);
  };
  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        className="relative overflow-hidden"
      >
        {/* Ambient blue wash — Apple's soft, single-focal glow behind the type. */}
        <motion.div
          aria-hidden="true"
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[130px]"
        />
        <Container className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <motion.h1
              style={{ x: headX, y: headY }}
              className="font-display text-[3.25rem] font-semibold leading-[1.03] tracking-[-0.03em] text-ink sm:text-7xl lg:text-[5.5rem]"
            >
              Build. Ship. <span className="text-accent">Scale.</span>
            </motion.h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">{profile.headline}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button as={Link} to="/projects">
                View work
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-[17px] font-medium text-accent hover:underline underline-offset-4"
              >
                Get in touch <span aria-hidden="true">›</span>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-muted">
              {credentials.map((item, i) => (
                <span key={item} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="text-border">·</span>}
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── By the numbers ─────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>By the numbers</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Three years, measured in outcomes.
            </h2>
          </Reveal>
          <RevealStagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {stats.slice(0, 4).map((stat) => {
              const numeric = Number(stat.value);
              return (
                <RevealItem key={stat.label} className="text-center">
                  {stat.eyebrow && (
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">{stat.eyebrow}</p>
                  )}
                  <p className="mt-4 flex items-start justify-center font-display text-6xl font-semibold leading-none tracking-tight text-ink lg:text-7xl">
                    {Number.isFinite(numeric) ? <CountUp value={numeric} /> : stat.value}
                    {stat.suffix && <span className="ml-1 mt-1 text-3xl font-semibold text-accent">{stat.suffix}</span>}
                  </p>
                  <p className="mt-5 text-[15px] font-semibold text-ink">{stat.label}</p>
                  <p className="mt-1 text-[14px] leading-6 text-muted">{stat.description}</p>
                  {stat.spark && <Sparkline points={stat.spark} className="mx-auto mt-5 text-accent" />}
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>

      {/* ── Selected work ──────────────────────────────────────────────── */}
      <section className="py-24 sm:py-28">
        <Container>
          <Reveal className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Designed, shipped, and measured.
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-[17px] font-medium text-accent hover:underline underline-offset-4"
            >
              All projects <span aria-hidden="true">›</span>
            </Link>
          </Reveal>
          {projectsQuery.isLoading && !projectsQuery.data ? (
            <Spinner label="Loading projects" />
          ) : (
            <ProjectGrid projects={featured} />
          )}
        </Container>
      </section>

      {/* ── How I work ─────────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>How I work</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Built to scale, tuned for speed.
            </h2>
          </Reveal>
          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <RevealItem
                  key={item.title}
                  className="group rounded-3xl bg-panel p-8 shadow-soft ring-1 ring-border/70 transition duration-500 ease-apple hover:-translate-y-1.5 hover:shadow-lift"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform duration-500 ease-apple group-hover:scale-110">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-muted">{item.text}</p>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-36">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Let&apos;s build something
              <br className="hidden sm:block" /> <span className="text-accent">great together.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
              Tell me what you&apos;re building and where it stands today. I reply within a day.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button as={Link} to="/contact">
                Start a conversation
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
              <Link
                to="/about"
                className="inline-flex items-center gap-1 text-[17px] font-medium text-accent hover:underline underline-offset-4"
              >
                More about me <span aria-hidden="true">›</span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
