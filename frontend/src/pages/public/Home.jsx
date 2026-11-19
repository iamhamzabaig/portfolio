import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { TechMarquee } from '../../components/ui/TechMarquee.jsx';
import { CircuitField } from '../../components/ui/CircuitField.jsx';
import { ProjectCase } from '../../features/projects/components/ProjectCase.jsx';
import { AssistantArt, DukaanArt, PulseArt } from '../../features/projects/components/ProjectArt.jsx';
import { getFleetMeta, withShowcase } from '../../features/projects/fleet.js';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { usePosts } from '../../features/blog/api/blog.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  engineeringApproach,
  fallbackPosts,
  fallbackProfile,
  fallbackSkills
} from '../../utils/fallbackData.js';

// Build rules: each one is something a real build here enforces.
const rules = [
  { rule: 'Money is counted in paisa, never in floats.', from: 'Asaan Dukaan' },
  { rule: 'The shop keeps selling when the internet drops.', from: 'Asaan Dukaan' },
  { rule: 'Two patients can’t book one slot. A test keeps trying.', from: 'Drop In' },
  { rule: 'Every tenant wall has a test standing behind it.', from: 'Agrius Pulse' },
  { rule: '“Supported” means it ran on real equipment first.', from: 'Agrius Pulse' },
  { rule: 'Done means deployed.', from: 'Every build' }
];

// Services: what a client can hire for.
const routes = [
  { title: 'Products, end to end', text: 'From the first schema to the deploy script: web apps, desktop apps that work offline, and the admin that runs them.', tools: 'React · Angular · Electron · Node · Go' },
  { title: 'LLM features that ship', text: 'Retrieval over your own documents, assistants that cite or refuse, tool-calling agents wired to the Claude and OpenAI APIs.', tools: 'RAG · Embeddings · pgvector · Agents', ai: true },
  { title: 'Payments & bookings', text: 'Card holds, refunds and slot booking that survive two people clicking at once.', tools: 'Stripe · PostgreSQL · Prisma' },
  { title: 'Monitoring & real-time', text: 'Live dashboards, incidents, on-call escalation, and data that streams instead of refreshing.', tools: 'WebSockets · VictoriaMetrics · Socket.IO' },
  { title: 'Speed work', text: 'Profiling and migrations that turn slow apps into measured wins: Lighthouse 65 → 88, PDF invoices 8s → 1.2s.', tools: 'Lighthouse · SSR · Bundles' }
];

// ~1,190 commits across these repos carry a Claude co-author trailer.
const AGENT_COMMITS = '1,190';

function useIslamabadTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// Splits a line into words that rise out of their own clipped boxes.
function Reveal({ text, start = 0 }) {
  return text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`} className="reveal">
      <span style={{ '--i': start + i }}>{word}&nbsp;</span>
    </span>
  ));
}

// Hero illustration: three slices of shipped products, layered and floating.
// Pointer movement tilts the stack slightly (--px/--py).
function HeroArt() {
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  return (
    <div
      aria-hidden="true"
      onPointerMove={tilt}
      className="hero-art fade-up relative hidden h-[34rem] lg:col-span-5 lg:block"
      style={{ '--d': '0.35s' }}
    >
      <div className="hero-glow" />
      <div className="hero-card tint-red right-0 top-2" style={{ '--depth': 10, '--float': '0s' }}>
        <PulseArt />
      </div>
      <div className="hero-card tint-yellow -left-10 top-[40%]" style={{ '--depth': 22, '--float': '-2.4s' }}>
        <AssistantArt />
      </div>
      <div className="hero-card tint-green -bottom-6 -right-8" style={{ '--depth': 34, '--float': '-4.1s', zIndex: 2 }}>
        <DukaanArt />
      </div>
    </div>
  );
}

export default function Home() {
  const profileQuery = useProfile();
  const projectsQuery = useProjects({ featured: true });
  const profile = profileQuery.data || fallbackProfile;
  const time = useIslamabadTime();
  const fleet = withShowcase(projectsQuery.data)
    .filter((project) => project.featured)
    // Projects still in progress go to the end.
    .sort((a, b) => (getFleetMeta(a).status === 'In progress') - (getFleetMeta(b).status === 'In progress'))
    .slice(0, 8);

  const postsQuery = usePosts();
  const latestPosts = (postsQuery.data?.length ? postsQuery.data : fallbackPosts)
    .filter((post) => post.published !== false)
    .slice(0, 3);

  const aiSkills = fallbackSkills.find((s) => s.group === 'AI Engineering')?.items || [];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <CircuitField />
        <Container className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-12 pb-10 pt-12 sm:pt-16">
          <div className="fade-up flex flex-wrap items-center gap-3" style={{ '--d': '0s' }}>
            <span className="chip">
              <span aria-hidden="true" className="dot dot-live" />
              Open to client builds and full-stack + AI roles
            </span>
            <span className="mono text-caption text-muted">Islamabad · {time} PKT</span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="mono fade-up mb-6 text-body-sm text-muted" style={{ '--d': '0.05s' }}>
                <span>{profile.role || 'Full-Stack & AI Engineer'}</span> · {profile.name || 'Hamza Munawar'}
              </p>
              <h1 className="display text-[clamp(3.25rem,8.2vw,8rem)] text-ink">
                <Reveal text="I build products" />
                <br />
                <span className="text-accent">
                  <Reveal text="that run." start={3} />
                </span>
              </h1>
            </div>
            <HeroArt />
          </div>

          <div className="grid gap-10 border-t border-border pt-8 md:grid-cols-12">
            <p className="fade-up max-w-[56ch] text-body-lg text-muted md:col-span-7" style={{ '--d': '0.5s' }}>
              {profile.headline}
            </p>
            <div className="fade-up flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end" style={{ '--d': '0.7s' }}>
              <a href="#fleet" className="btn btn-primary">
                See my work
                <span className="btn-arrow" aria-hidden="true"><ArrowDown size={16} /></span>
              </a>
              <Link to="/contact" className="btn btn-ghost btn-plain">
                Start a conversation
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Toolbox ────────────────────────────────────────────────────── */}
      <section className="border-y border-border py-10">
        <h2 className="sr-only">Technologies</h2>
        <TechMarquee />
      </section>

      {/* ── Selected work ──────────────────────────────────────────────── */}
      <section id="fleet" className="scroll-mt-20 py-24 sm:py-32">
        <Container>
          <div className="mb-16 flex flex-col gap-6 sm:mb-24 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display text-[clamp(2.75rem,7vw,5.5rem)] text-ink">Selected work</h2>
              <p className="mt-5 max-w-[52ch] text-body-lg text-muted">
                Products in production, and one still in progress. The numbers are real commit counts.
              </p>
            </div>
            <Link to="/projects" className="btn btn-ghost btn-sm self-start sm:self-auto">
              All projects
              <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
            </Link>
          </div>
          <div className="flex flex-col gap-24 lg:gap-32">
            {fleet.map((project, i) => (
              <ProjectCase key={project._id || project.slug} project={project} flip={i % 2 === 1} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── AI ─────────────────────────────────────────────────────────── */}
      <section className="ai-band relative overflow-hidden py-24 sm:py-32">
        <CircuitField fade="edges" density={0.06} seed={21} />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 className="display text-[clamp(2.75rem,7vw,5.5rem)] lg:col-span-7">AI engineering</h2>
            <p className="max-w-[52ch] text-body-lg text-muted lg:col-span-5">
              LLM features built like the rest of my work: grounded in your own data, measured, and shipped. This is
              the path a question takes through the retrieval systems I build.
            </p>
          </div>

          <ol className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {engineeringApproach.pipeline.map((stop, i) => (
              <li key={stop.id} className="flex flex-col gap-3">
                <span className="mono text-caption text-muted">Step {i + 1}</span>
                <div className="pipeline-line" aria-hidden="true" />
                <strong className="text-title font-medium">{stop.label}</strong>
                <span className="text-body-sm text-muted">{stop.sub}</span>
              </li>
            ))}
          </ol>

          <div className="mt-20 grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl p-8 ring-1 ring-border sm:p-10 lg:col-span-7">
              <h3 className="text-title font-medium">What I bring to an AI build</h3>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {aiSkills.map((skill) => (
                  <li key={skill} className="rounded-full px-4 py-2 text-body-sm ring-1 ring-border">
                    {skill}
                  </li>
                ))}
              </ul>
              <Link to="/projects/ai-knowledge-assistant" className="btn btn-accent mt-10">
                Try the retrieval demo
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
            </div>
            <div className="flex flex-col justify-between gap-10 rounded-3xl bg-surface p-8 sm:p-10 lg:col-span-5">
              <p className="display text-[clamp(3.5rem,8vw,6rem)] text-accent">{AGENT_COMMITS}</p>
              <div>
                <h3 className="text-title font-medium">commits co-written with Claude</h3>
                <p className="mt-3 text-body text-muted">
                  Every build here is spec-first and agent-assisted: written plans, custom Claude skills and review
                  agents, parallel worktrees, and a human signing off each change. It is how one engineer ships a
                  monitoring platform and a POS in the same season.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Rules ──────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-[clamp(2.75rem,7vw,5.5rem)] text-ink">How I build</h2>
            <p className="mt-5 max-w-[42ch] text-body-lg text-muted">
              Rules every project here follows. Each one came from a real build.
            </p>
          </div>
          <ul className="lg:col-span-7">
            {rules.map((item) => (
              <li
                key={item.rule}
                className="group flex flex-col gap-1 border-b border-border py-6 first:border-t sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-display text-fluid-h3 font-medium text-ink transition-colors duration-300 group-hover:text-accent">
                  {item.rule}
                </span>
                <span className="mono shrink-0 text-caption text-muted">{item.from}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-32">
        <Container>
          <h2 className="display text-[clamp(2.75rem,7vw,5.5rem)] text-ink">Services</h2>
          <p className="mt-5 max-w-[52ch] text-body-lg text-muted">
            What you can hire me to build, from the first schema to the deploy.
          </p>
          <dl className="mt-14">
            {routes.map((route) => (
              <div key={route.title} className="grid gap-2 border-b border-border py-8 first:border-t md:grid-cols-12 md:gap-8">
                <dt className="flex items-center gap-3 text-title font-medium text-ink md:col-span-4">
                  {route.title}
                  {route.ai && <span className="chip text-accent">AI</span>}
                </dt>
                <dd className="text-body text-muted md:col-span-5">{route.text}</dd>
                <dd className="mono text-caption text-muted md:col-span-3 md:text-right">{route.tools}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Writing ────────────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-24 sm:py-32">
          <Container>
            <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="display text-[clamp(2.75rem,7vw,5.5rem)] text-ink">Writing</h2>
              <Link to="/blog" className="btn btn-ghost btn-sm self-start sm:self-auto">
                All writing
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-3">
              {latestPosts.map((post) => (
                <li key={post._id || post.slug}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex h-full flex-col rounded-3xl bg-panel p-8 ring-1 ring-border transition duration-500 ease-apple hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="mono text-caption text-muted">{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span className="mt-4 font-display text-fluid-h3 font-medium text-ink">{post.title}</span>
                    {post.excerpt && <span className="mt-3 text-body-sm text-muted">{post.excerpt}</span>}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-body-sm font-medium text-ink">
                      Read
                      <ArrowUpRight
                        aria-hidden="true"
                        size={16}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ── Closing ────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-24 sm:py-36">
        <Container>
          <h2 className="display text-[clamp(3.25rem,11vw,9rem)] text-ink">
            Let’s build <span className="text-accent">something.</span>
          </h2>
          <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-12">
            <p className="max-w-[44ch] text-body-lg text-muted md:col-span-6">
              Tell me what you’re building and where it stands today. I reply within a day.
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
              <Link to="/contact" className="btn btn-primary">
                Start a conversation
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
              <a href={`mailto:${profile.email || fallbackProfile.email}`} className="btn btn-ghost btn-plain">
                <Mail aria-hidden="true" size={16} />
                Email me
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
