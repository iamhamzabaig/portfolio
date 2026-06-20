import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import { Chip } from '../../../components/ui/Chip.jsx';
import { coverGradient, monogram } from '../cover.js';

const tiltSpring = { stiffness: 150, damping: 18 };

export function ProjectCard({ project }) {
  const hasImage = Boolean(project.coverImage?.url);
  const cover = coverGradient(project);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, tiltSpring);
  const rotateY = useSpring(tiltY, tiltSpring);

  const handleTilt = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ox = (event.clientX - rect.left) / rect.width - 0.5;
    const oy = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(oy * -8);
    tiltY.set(ox * 8);
  };
  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      onPointerMove={handleTilt}
      onPointerLeave={resetTilt}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      whileHover={{ y: -4 }}
      transition={tiltSpring}
    >
    <Link
      to={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-panel transition-colors hover:border-accent/50 hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {hasImage ? (
          <img
            src={project.coverImage.url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ backgroundImage: cover }}>
            <span className="font-display text-5xl font-bold text-white/90">{monogram(project.title)}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {project.featured && (
            <span className="rounded-full bg-bg/70 px-3 py-1 font-mono text-[10px] tracking-eyebrow text-ink backdrop-blur">
              FEATURED
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold leading-tight text-ink">{project.title}</h3>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 shrink-0 text-muted transition group-hover:text-accent"
            size={19}
          />
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {(project.tags || []).slice(0, 4).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </div>
    </Link>
    </motion.div>
  );
}
