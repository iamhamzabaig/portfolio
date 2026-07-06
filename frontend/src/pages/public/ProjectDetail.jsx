import { ArrowLeft, ExternalLink, Github, Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProject } from '../../features/projects/api/projects.queries.js';
import { MediaGallery } from '../../features/projects/components/MediaGallery.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const projectQuery = useProject(slug);
  const project = projectQuery.data;

  if (projectQuery.isLoading && !project) return <Spinner />;
  if (!project) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Project not found</h1>
        <Link to="/projects" className="mt-5 inline-block text-[17px] font-medium text-accent hover:underline underline-offset-4">
          Back to projects ›
        </Link>
      </Container>
    );
  }

  return (
    <article>
      {/* Centered product-intro header. */}
      <Container className="py-16 text-center sm:py-20">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={15} /> All projects
        </Link>

        {(project.tags || []).length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(project.tags || []).map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          {project.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">{project.description}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {project.isLivePrivate ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-[15px] text-muted">
              <Lock aria-hidden="true" size={15} /> Live demo under NDA
            </p>
          ) : project.liveUrl ? (
            <Button as="a" href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" size={16} />
              Live
            </Button>
          ) : null}
          {project.isRepoPrivate ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-[15px] text-muted">
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
        <div className="mx-auto max-w-2xl text-lg leading-8 text-muted">
          <p>{project.content || project.description}</p>
        </div>
      </Container>
    </article>
  );
}
