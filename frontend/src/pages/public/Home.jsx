import { ArrowRight, ArrowUpRight, Boxes, Gauge, Radio } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import HeroVisual from '../../components/three/HeroVisual.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CountUp } from '../../components/ui/CountUp.jsx';
import { Reveal, RevealStagger, RevealItem } from '../../components/ui/Reveal.jsx';
import { Sparkline } from '../../components/ui/Sparkline.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { fallbackProjects, fallbackProfile, heroThesis } from '../../utils/fallbackData.js';

const credentials = ['ISLAMABAD, PK', 'ANGULAR + REACT + NODE', 'NX MONOREPO', 'SINCE 2022'];

const capabilities = [
  { title: 'Enterprise frontends', icon: Boxes, text: 'Angular & React systems in Nx monorepos — signals, standalone APIs, typed component libraries.' },
  { title: 'Performance work', icon: Gauge, text: 'Migrations and profiling that move Lighthouse, shrink bundles, and cut server render times.' },
  { title: 'Real-time & APIs', icon: Radio, text: 'Node/Express services, WebSockets, and GraphQL with JWT auth and role-based access control.' }
];

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const heroItem = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 130, damping: 18 } }
};

function Eyebrow({ index, label, right }) {
  return (
    <div className="mb-10 flex items-center gap-5">
      <span className="font-mono text-xs tracking-eyebrow text-accent">
        {index} · {label}
      </span>
      <span className="h-px flex-1 bg-border" />
      {right && <span className="hidden font-mono text-xs tracking-eyebrow text-muted sm:block">{right}</span>}
    </div>
  );
}

export default function Home() {
  const profileQuery = useProfile();
  const projectsQuery = useProjects({ featured: true });
  const profile = profileQuery.data || fallbackProfile;
  const stats = profile.stats?.length ? profile.stats : fallbackProfile.stats;
  const featured = (projectsQuery.data?.length ? projectsQuery.data : fallbackProjects)
    .filter((project) => project.featured)
    .slice(0, 3);

  // Pointer-reactive depth: the glow trails the cursor, the headline drifts the
  // opposite way at a smaller magnitude — two planes, so the hero reads as space.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glowX = useSpring(px, { stiffness: 60, damping: 20 });
  const glowY = useSpring(py, { stiffness: 60, damping: 20 });
  const headX = useTransform(useSpring(px, { stiffness: 80, damping: 22 }), (v) => v * -0.3);
  const headY = useTransform(useSpring(py, { stiffness: 80, damping: 22 }), (v) => v * -0.3);

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
      {/* Hero */}
      <section
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        className="relative overflow-hidden border-b border-border"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:26px_26px] opacity-60" />
        <HeroVisual pointer={{ glowX, glowY }} />
        <Container className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
          <motion.div variants={heroStagger} initial="hidden" animate="show" className="flex flex-col items-center">
            <motion.span
              variants={heroItem}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-panel/70 px-4 py-1.5 text-sm text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Open to full-stack &amp; frontend roles
            </motion.span>

            <motion.h1
              variants={heroItem}
              style={{ x: headX, y: headY }}
              className="font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.6rem]"
            >
              {heroThesis.lead}{' '}
              <span className="text-accent">{heroThesis.accent}</span>
              <br className="hidden sm:block" /> {heroThesis.tail}
            </motion.h1>

            <motion.p variants={heroItem} className="mt-7 max-w-2xl text-lg leading-8 text-muted">
              {profile.headline}
            </motion.p>

            <motion.div variants={heroItem} className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button as={Link} to="/projects">
                View projects
                <ArrowRight aria-hidden="true" size={17} />
              </Button>
              <Button as={Link} to="/contact" variant="outline">
                Get in touch
              </Button>
            </motion.div>

            <motion.div
              variants={heroItem}
              className="mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-eyebrow text-muted"
            >
              {credentials.map((item, i) => (
                <span key={item} className="inline-flex items-center gap-3">
                  {i > 0 && <span className="text-accent/60">·</span>}
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Signature: by the numbers */}
      <section className="border-b border-border py-20">
        <Container>
          <Eyebrow index="01" label="BY THE NUMBERS" right="THREE YEARS, SHIPPED" />
          <RevealStagger className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {stats.slice(0, 4).map((stat) => {
              const numeric = Number(stat.value);
              return (
                <RevealItem key={stat.label} className="border-l border-border pl-5">
                  {stat.eyebrow && (
                    <p className="font-mono text-[11px] tracking-eyebrow text-muted">{stat.eyebrow}</p>
                  )}
                  <p className="mt-4 flex items-start font-display text-6xl font-bold leading-none text-ink lg:text-7xl">
                    {Number.isFinite(numeric) ? <CountUp value={numeric} /> : stat.value}
                    {stat.suffix && <span className="ml-1 mt-1 text-2xl font-semibold text-accent">{stat.suffix}</span>}
                  </p>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-ink">{stat.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{stat.description}</p>
                  {stat.spark && <Sparkline points={stat.spark} className="mt-5 text-accent" />}
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>

      {/* Selected work */}
      <section className="border-b border-border py-20">
        <Container>
          <Eyebrow index="02" label="SELECTED WORK" right="REAL-TIME · ERP · MARKETING" />
          <Reveal className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl font-display text-3xl font-semibold text-ink sm:text-4xl">
              Things I&apos;ve designed, shipped, and measured.
            </h2>
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-accent hover:text-ink">
              All projects <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </Reveal>
          {projectsQuery.isLoading && !projectsQuery.data ? (
            <Spinner label="Loading projects" />
          ) : (
            <ProjectGrid projects={featured} />
          )}
        </Container>
      </section>

      {/* How I work */}
      <section className="py-20">
        <Container>
          <Eyebrow index="03" label="HOW I WORK" />
          <RevealStagger className="grid gap-5 md:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <RevealItem
                  key={item.title}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-border bg-panel p-6 transition-colors duration-300 hover:border-accent/40 hover:shadow-glow"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </Container>
      </section>
    </>
  );
}
