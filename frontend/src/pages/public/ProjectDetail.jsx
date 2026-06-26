import { ArrowLeft, ExternalLink, Github, Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProject } from '../../features/projects/api/projects.queries.js';
import { coverGradient, monogram } from '../../features/projects/cover.js';

export default function ProjectDetail() {
  const { slug } = useParams();
  const projectQuery = useProject(slug);
  const project = projectQuery.data;

  if (projectQuery.isLoading && !project) return <Spinner />;
  if (!project) {
    return (
      <Container className="py-24">
        <h1 className="text-3xl font-semibold">Project not found</h1>
        <Link to="/projects" className="mt-4 inline-block text-accent">Back to projects</Link>
      </Container>
    );
  }

  return (
    <article>
      <Container className="py-14">
        <Link to="/projects" className="inline-flex items-center gap-2 font-mono text-xs tracking-eyebrow text-muted transition hover:text-ink">
          <ArrowLeft aria-hidden="true" size={14} /> ALL PROJECTS
        </Link>
        <div className="mb-8 mt-6 flex flex-wrap gap-2">
          {(project.tags || []).map((tag) => <Chip key={tag}>{tag}</Chip>)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">{project.title}</h1>
            <p className="mt-5 text-lg leading-8 text-muted">{project.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {project.isPrivate ? (
                <p className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm text-muted">
                  <Lock aria-hidden="true" size={15} /> Private — code &amp; demo under NDA
                </p>
              ) : (
                <>
                  {project.liveUrl ? (
                    <Button as="a" href={project.liveUrl} target="_blank" rel="noreferrer">
                      <ExternalLink aria-hidden="true" size={17} />
                      Live
                    </Button>
                  ) : null}
                  {project.repoUrl ? (
                    <Button as="a" href={project.repoUrl} target="_blank" rel="noreferrer" variant="outline">
                      <Github aria-hidden="true" size={17} />
                      Source
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>
          {project.video?.url ? (
            <video
              controls
              preload="none"
              src={project.video.url}
              poster={project.coverImage?.url || undefined}
              className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
            />
          ) : project.coverImage?.url ? (
            <img
              src={project.coverImage.url}
              alt=""
              className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
            />
          ) : (
            <div
              className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-border"
              style={{ backgroundImage: coverGradient(project) }}
            >
              <span className="font-display text-6xl font-bold text-white/90">{monogram(project.title)}</span>
            </div>
          )}
        </div>
        <div className="mt-12 max-w-3xl text-base leading-8 text-muted">
          <p>{project.content || project.description}</p>
        </div>
      </Container>
    </article>
  );
}
