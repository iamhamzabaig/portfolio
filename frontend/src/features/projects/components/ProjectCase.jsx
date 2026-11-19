import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFleetMeta } from '../fleet.js';
import { ProjectArt } from './ProjectArt.jsx';

// A case-study row: a typographic cover lit by the project's hue (spotlight
// follows the pointer), and the facts beside it.
export function ProjectCase({ project, headingLevel = 'h3', flip = false }) {
  const meta = getFleetMeta(project);
  const Heading = headingLevel;
  const live = meta.status === 'Live';
  // Real uploads win over the drawn illustration: video first, then cover image.
  const image = project.coverImage?.url || project.screenshots?.[0]?.url || '';
  const video = project.video?.url || '';
  const media = video || image ? { video, image } : null;

  const spotlight = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <article className={`case tint-${meta.paint} grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14`}>
      <Link
        to={`/projects/${project.slug}`}
        onPointerMove={spotlight}
        aria-label={`${project.title} case study`}
        className={`cover flex aspect-[16/11] flex-col justify-between p-7 sm:p-10 lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}
      >
        <div className="relative z-10 flex items-center justify-between gap-4">
          <span className="chip">
            <span aria-hidden="true" className={`dot ${live ? 'dot-live' : ''}`} />
            {meta.status}
          </span>
          {meta.plate && (
            <span className="mono text-caption text-muted">
              <span className="text-body font-medium text-ink">{meta.plate}</span> {meta.plateNote}
            </span>
          )}
        </div>
        <div className="art-stage" aria-hidden="true">
          {media ? (
            <div className="art-window w-[min(30rem,62vw)]">
              <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
              </div>
              {media.video ? (
                <video
                  src={media.video}
                  poster={media.image || undefined}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <img src={media.image} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              )}
            </div>
          ) : (
            <ProjectArt slug={project.slug} />
          )}
        </div>
        <div className="cover-title relative z-10 max-w-[52%]">
          <p className="display text-[clamp(2rem,4.2vw,3.75rem)] text-ink">{project.title}</p>
        </div>
      </Link>

      <div className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
        <Heading className="sr-only">{project.title}</Heading>
        {meta.slogan && <p className="display text-fluid-h3 text-ink">{meta.slogan}</p>}
        <p className="mt-4 max-w-[52ch] text-body text-muted">{project.description}</p>

        <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 border-t border-border pt-6 text-body-sm">
          {meta.route && (
            <>
              <dt className="mono text-caption uppercase text-muted">Where</dt>
              <dd className="text-ink">{meta.route}</dd>
            </>
          )}
          {meta.built && (
            <>
              <dt className="mono text-caption uppercase text-muted">Built</dt>
              <dd className="text-ink">{meta.built}</dd>
            </>
          )}
          {project.tags?.length > 0 && (
            <>
              <dt className="mono text-caption uppercase text-muted">Stack</dt>
              <dd className="text-ink">{project.tags.join(' · ')}</dd>
            </>
          )}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to={`/projects/${project.slug}`} className="btn btn-primary btn-sm">
            View case study
            <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Visit {meta.route || 'live site'}
              <span className="btn-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
