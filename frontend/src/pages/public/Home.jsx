import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { TechMarquee } from '../../components/ui/TechMarquee.jsx';
import { CountUp } from '../../components/ui/CountUp.jsx';
import { CodeBlock, SectionTitle } from '../../components/ide/CodeBlock.jsx';
import { Terminal } from '../../components/ide/Terminal.jsx';
import { GitLog } from '../../components/ide/GitLog.jsx';
import { ProjectTimeline, TimelineItem } from '../../features/projects/components/ProjectTimeline.jsx';
import { PipelineBeam } from '../../components/ui/PipelineBeam.jsx';
import { ProjectCase } from '../../features/projects/components/ProjectCase.jsx';
import { getFleetMeta, withShowcase } from '../../features/projects/fleet.js';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { usePosts } from '../../features/blog/api/blog.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
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
const AGENT_COMMITS = 1190;

// rules.ts, rendered as code. Strings are quoted, sources sit in comments.
const rulesCode = [
  [['comment', '// Each rule came from a real build.']],
  [['keyword', 'export const '], ['fn', 'rules'], ['plain', ' = [']],
  ...rules.map(({ rule, from }) => [
    ['plain', '  '], ['string', JSON.stringify(rule)], ['plain', ','], ['comment', `  // ${from}`]
  ]),
  [['plain', '] '], ['keyword', 'as const'], ['plain', ';']]
];



export default function Home() {
  const profileQuery = useProfile();
  const projectsQuery = useProjects({ featured: true });
  const profile = profileQuery.data || fallbackProfile;
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
      <section className="relative">
        <Container className="grid min-h-[calc(100svh-7rem)] items-center gap-12 py-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="fade-up font-mono text-caption syn-comment" style={{ '--d': '0s' }}>
              {`// ${profile.name || 'Hamza Munawar'} · ${profile.role || 'Full-Stack & AI Engineer'}`}
            </p>
            <h1 className="display fade-up mt-5 text-[clamp(2.5rem,5.6vw,5rem)] text-ink" style={{ '--d': '0.1s' }}>
              <span aria-hidden="true" className="block text-fluid-h3 tracking-normal">
                <span className="syn-keyword">const</span> <span className="syn-fn">hamza</span>{' '}
                <span className="text-muted">=</span>
              </span>
              <span aria-hidden="true" className="syn-string">"</span>I build products{' '}
              <span className="syn-string">that run.</span>
              <span aria-hidden="true" className="syn-string">"</span>
            </h1>
            <p className="fade-up mt-8 max-w-[56ch] border-l-2 border-border pl-4 text-body-lg text-muted" style={{ '--d': '0.3s' }}>
              {profile.headline}
            </p>
            <div className="fade-up mt-10 flex flex-wrap gap-3" style={{ '--d': '0.45s' }}>
              <a href="#fleet" className="btn btn-primary">
                ./see-my-work
                <span className="btn-arrow" aria-hidden="true"><ArrowDown size={16} /></span>
              </a>
              <Link to="/contact" className="btn btn-ghost btn-plain">
                ./contact.sh
              </Link>
            </div>
          </div>
          <div className="fade-up lg:col-span-6" style={{ '--d': '0.25s' }}>
            <Terminal profile={profile} projects={fleet} resumeUrl={profile.resumeUrl} />
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
          <div data-scene="reveal" className="mb-16 flex flex-col gap-6 sm:mb-24 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionTitle file="src/projects/index.json">Selected work</SectionTitle>
              <p className="mt-5 max-w-[52ch] text-body-lg text-muted">
                Products in production, and one still in progress. The numbers are real commit counts.
              </p>
            </div>
            <Link to="/projects" className="btn btn-ghost btn-sm self-start sm:self-auto">
              All projects
              <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
            </Link>
          </div>
          {/* Timeline rail: a beam fills beside the projects as you scroll. */}
          <ProjectTimeline>
            <div data-scene="reveal" className="flex flex-col gap-24 lg:gap-32">
              {fleet.map((project, i) => (
                <TimelineItem key={project._id || project.slug} index={i} title={project.title}>
                  <ProjectCase project={project} flip={i % 2 === 1} />
                </TimelineItem>
              ))}
            </div>
          </ProjectTimeline>
        </Container>
      </section>

      {/* ── AI ─────────────────────────────────────────────────────────── */}
      <section className="ai-band relative overflow-hidden py-24 sm:py-32">
        <Container className="relative">
          <div data-scene="reveal" className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <SectionTitle file="src/ai/pipeline.ts" className="lg:col-span-7">AI engineering</SectionTitle>
            <p className="max-w-[52ch] text-body-lg text-muted lg:col-span-5">
              LLM features built like the rest of my work: grounded in your own data, measured, and shipped. This is
              the path a question takes through the retrieval systems I build.
            </p>
          </div>

          <div className="mt-16">
            <PipelineBeam steps={engineeringApproach.pipeline} />
          </div>

          <div data-scene="reveal" className="mt-20 grid gap-6 lg:grid-cols-12">
            <div className="rounded-card p-8 ring-1 ring-border sm:p-10 lg:col-span-7">
              <h3 className="text-title font-medium">What I bring to an AI build</h3>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {aiSkills.map((skill) => (
                  <li key={skill} className="rounded-control px-3 py-1.5 font-mono text-body-sm syn-type ring-1 ring-border">
                    {skill}
                  </li>
                ))}
              </ul>
              <Link to="/projects/ai-knowledge-assistant" className="btn btn-accent mt-10">
                Try the retrieval demo
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
            </div>
            <div className="flex flex-col justify-between gap-10 rounded-card bg-surface p-8 sm:p-10 lg:col-span-5">
              <div>
                <p className="font-mono text-caption text-muted"><span className="syn-keyword">$</span> git log --grep="Co-Authored-By: Claude" | wc -l</p>
                <p className="display mt-3 text-[clamp(3.5rem,8vw,6rem)] syn-number"><CountUp value={AGENT_COMMITS} /></p>
              </div>
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
          <div data-scene="reveal" className="lg:col-span-5">
            <SectionTitle file="src/rules.ts">How I build</SectionTitle>
            <p className="mt-5 max-w-[42ch] text-body-lg text-muted">
              Rules every project here follows. Each one came from a real build.
            </p>
          </div>
          <div data-scene="reveal" className="lg:col-span-7">
            <CodeBlock file="rules.ts" lines={rulesCode} />
          </div>
        </Container>
      </section>

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-24 sm:py-32">
        <Container>
          <div data-scene="reveal">
            <SectionTitle file="src/services.ts">Services</SectionTitle>
            <p className="mt-5 max-w-[52ch] text-body-lg text-muted">
              What you can hire me to build, from the first schema to the deploy.
            </p>
          </div>
          <dl data-scene="reveal" className="mt-14">
            {routes.map((route) => (
              <div key={route.title} className="grid gap-2 border-b border-border py-8 first:border-t md:grid-cols-12 md:gap-8">
                <dt className="flex items-center gap-3 font-mono text-title font-medium text-ink md:col-span-4">
                  <span><span aria-hidden="true" className="syn-keyword">fn </span>{route.title}</span>
                  {route.ai && <span className="chip syn-keyword">AI</span>}
                </dt>
                <dd className="text-body text-muted md:col-span-5">{route.text}</dd>
                <dd className="font-mono text-caption syn-type md:col-span-3 md:text-right">{route.tools}</dd>
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
              <SectionTitle file="git log --oneline blog/">Writing</SectionTitle>
              <Link to="/blog" className="btn btn-ghost btn-sm self-start sm:self-auto">
                All writing
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
            </div>
            <div data-scene="reveal"><GitLog posts={latestPosts} /></div>
          </Container>
        </section>
      )}

      {/* ── Closing ────────────────────────────────────────────────────── */}
      <section data-scene="closing" className="relative overflow-hidden border-t border-border py-24 sm:py-36">
        <Container className="relative">
          <p className="font-mono text-body-sm text-muted">
            <span className="syn-keyword">$</span> ./contact.sh <span className="caret" aria-hidden="true" />
          </p>
          <h2 className="display mt-6 text-[clamp(2.75rem,8vw,7rem)] text-ink">
            Let’s build <span className="syn-string">something.</span>
          </h2>
          <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-12">
            <p className="max-w-[44ch] text-body-lg text-muted md:col-span-6">
              Tell me what you’re building and where it stands today. I reply within a day.
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
              <Link to="/contact" className="btn btn-primary">
                ./start-a-conversation
                <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </Link>
              <a href={`mailto:${profile.email || fallbackProfile.email}`} className="btn btn-ghost btn-plain">
                <Mail aria-hidden="true" size={16} />
                mailto:me
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
