import { ArrowLeft, ExternalLink, Github, Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { SectionTitle } from '../../components/ide/CodeBlock.jsx';
import { useProject } from '../../features/projects/api/projects.queries.js';
import { MediaGallery } from '../../features/projects/components/MediaGallery.jsx';
import { SemanticSearchDemo } from '../../features/projects/components/SemanticSearchDemo.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const projectQuery = useProject(slug);
  const project = projectQuery.data;

  if (projectQuery.isLoading && !project) return <Spinner />;
  if (!project) {
    return (
      <Container className="py-32 text-center">
        <h1 data-motion="heading" className="font-display text-fluid-h1 font-semibold text-ink">Project not found</h1>
        <Link to="/projects" className="mt-5 inline-block text-body font-medium text-accent hover:underline underline-offset-4">
          Back to projects ›
        </Link>
      </Container>
    );
  }

  return (
    <article>
      {/* Centered product-intro header. */}
      <Container className="py-16 sm:py-20">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-caption font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={15} /> cd ../projects
        </Link>

        <SectionTitle as="h1" file={`projects/${project.slug}/README.md`} className="mt-8 max-w-4xl">
          {project.title}
        </SectionTitle>

        {(project.tags || []).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(project.tags || []).map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        <p className="mt-6 max-w-2xl border-l-2 border-border pl-4 text-body-lg text-muted">{project.description}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {project.isLivePrivate ? (
            <p className="inline-flex items-center gap-2 rounded-control bg-surface px-4 py-2.5 font-mono text-body-sm syn-error">
              <Lock aria-hidden="true" size={15} /> Live demo under NDA
            </p>
          ) : project.liveUrl ? (
            <Button as="a" href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" size={16} />
              Live
            </Button>
          ) : null}
          {project.isRepoPrivate ? (
            <p className="inline-flex items-center gap-2 rounded-control bg-surface px-4 py-2.5 font-mono text-body-sm syn-error">
              <Lock aria-hidden="true" size={15} /> Source under NDA
            </p>
          ) : project.repoUrl ? (
            <Button as="a" href={project.repoUrl} target="_blank" rel="noreferrer" variant="secondary">
              <Github aria-hidden="true" size={16} />
              Source
            </Button>
          ) : null}
        </div>
      </Container>

      {/* Full-width media, framed on a soft gray band like an Apple gallery. */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <MediaGallery
            video={project.video}
            screenshots={project.screenshots}
            coverImage={project.coverImage}
            title={project.title}
          />
        </Container>
      </section>

      {/* Readable write-up column. */}
      <Container className="py-20 sm:py-24">
        <div className="max-w-2xl text-body-lg text-muted">
          <h2 className="mb-5 font-display text-fluid-h3 font-semibold text-ink"><span aria-hidden="true" className="syn-keyword">## </span>Overview</h2>
          <p>{project.content || project.description}</p>
        </div>
      </Container>

      {/* Live, client-side retrieval demo — only on the AI assistant project,
          where it makes the "semantic search" claim tangible. */}
      {project.slug === 'ai-knowledge-assistant' && <SemanticSearchDemo />}
    </article>
  );
}
