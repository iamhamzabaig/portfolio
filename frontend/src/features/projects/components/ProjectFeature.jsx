import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RevealItem } from '../../../components/ui/Reveal.jsx';
import { coverGradient, monogram } from '../cover.js';

// Editorial feature row — large project media on one side, details on the other,
// alternating sides down the page (Apple product-showcase style). Replaces the
// former card grid. `index` drives the left/right alternation.
export function ProjectFeature({ project, index = 0 }) {
  const hasImage = Boolean(project.coverImage?.url);
  const cover = coverGradient(project);
  const to = `/projects/${project.slug}`;
  const reversed = index % 2 === 1;

  return (
    <RevealItem className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      {/* Media — the hero of the row. */}
      <Link
        to={to}
        aria-label={project.title}
        className={`group relative order-1 block overflow-hidden rounded-xl bg-surface shadow-soft transition duration-500 ease-apple hover:shadow-lift ${
          reversed ? 'lg:order-2' : 'lg:order-1'
        } ${project.featured ? 'ring-2 ring-accent/40' : ''}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {hasImage ? (
            <img
              src={project.coverImage.url}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-apple group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center transition duration-700 ease-apple group-hover:scale-[1.04]"
              style={{ backgroundImage: cover }}
            >
              <span className="font-display text-7xl font-semibold text-white/90">{monogram(project.title)}</span>
            </div>
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            {project.featured && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm">
                Featured
              </span>
            )}
            {project.video?.url && (
              <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-ink backdrop-blur">
                ▶ DEMO
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className={`order-2 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
        <Link to={to} className="group/title inline-block">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ink transition-colors duration-300 group-hover/title:text-accent sm:text-4xl">
            {project.title}
          </h3>
        </Link>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">{project.description}</p>
        {project.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-medium text-muted ring-1 ring-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link
          to={to}
          className="group/link mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent"
        >
          Learn more
          <ArrowRight
            aria-hidden="true"
            size={16}
            strokeWidth={1.75}
            className="transition-transform duration-300 ease-apple group-hover/link:translate-x-1"
          />
        </Link>
      </div>
    </RevealItem>
  );
}
