import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { revealRise } from '../../../components/ui/Reveal.jsx';
import { coverGradient, monogram } from '../cover.js';

// Apple product-tile: generous rounding, quiet gray surface, image lifts and the
// cover zooms softly on hover. No 3D tilt — Apple keeps its cards flat and calm.
export function ProjectCard({ project }) {
  const hasImage = Boolean(project.coverImage?.url);
  const cover = coverGradient(project);

  return (
    <motion.div variants={revealRise}>
      <Link
        to={`/projects/${project.slug}`}
        className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-panel shadow-soft transition duration-500 ease-apple hover:-translate-y-1.5 hover:shadow-lift ${
          project.featured ? 'ring-2 ring-accent/40' : 'ring-1 ring-border/70'
        }`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface">
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
              <span className="font-display text-6xl font-semibold text-white/90">{monogram(project.title)}</span>
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

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">
            {project.title}
          </h3>
          <p className="line-clamp-2 text-[15px] leading-6 text-muted">{project.description}</p>
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-[15px] font-medium text-accent">
            Learn more
            <ArrowRight
              aria-hidden="true"
              size={16}
              className="transition-transform duration-300 ease-apple group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
