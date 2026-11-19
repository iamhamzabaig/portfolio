import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectCase } from '../../features/projects/components/ProjectCase.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { fallbackProjects } from '../../utils/fallbackData.js';

const ALL = 'All';

export default function Projects() {
  const [active, setActive] = useState(ALL);
  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.length ? projectsQuery.data : fallbackProjects;

  // Filter pills, derived from the projects' own tags (most-used first) so they
  // stay in sync as work is added from the admin — no hardcoded categories.
  const filters = useMemo(() => {
    const counts = new Map();
    projects.forEach((project) => (project.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    const ordered = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
    return [ALL, ...ordered];
  }, [projects]);

  // Filter dropdown — a single compact menu that scales to any number of tags.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const filtered = useMemo(() => {
    if (active === ALL) return projects;
    return projects.filter((project) => (project.tags || []).includes(active));
  }, [projects, active]);

  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-3xl">
        <h1 className="display text-[clamp(3.25rem,9vw,7rem)] text-ink">
          Projects
        </h1>
        <p className="mt-6 max-w-[58ch] text-body-lg text-muted">
          Everything I have built, from live products to earlier work. Filter by technology.
        </p>
      </div>

      {/* Tag filter — a single dropdown menu. Scales to any number of tags,
          no horizontal scroll. Single-select; "All" resets. */}
      <div className="mt-10 flex">
        <div ref={menuRef} className="relative">
          <span className="mono mr-3 text-caption uppercase text-muted">Stack</span>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-1.5 rounded-control bg-panel px-3 py-1.5 text-caption font-medium text-ink ring-1 ring-border/70 transition duration-300 ease-apple hover:ring-border active:scale-[0.98]"
          >
            {active}
            <ChevronDown
              aria-hidden="true"
              size={14}
              className={`text-muted transition-transform duration-300 ease-apple ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.ul
                role="listbox"
                aria-label="Filter projects by technology"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 z-30 mt-2 max-h-56 w-48 overflow-y-auto overscroll-contain rounded-card bg-panel p-1 shadow-overlay ring-1 ring-border/70"
              >
                {filters.map((tag) => {
                  const isActive = tag === active;
                  return (
                    <li key={tag} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(tag);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-control px-2.5 py-1.5 text-left text-caption transition-colors ${
                          isActive ? 'bg-surface font-semibold text-ink' : 'text-muted hover:bg-surface hover:text-ink'
                        }`}
                      >
                        {tag}
                        {isActive && <Check aria-hidden="true" size={14} className="shrink-0 text-accent" />}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-16">
        {projectsQuery.isLoading && !projectsQuery.data ? (
          <Spinner label="Loading projects" />
        ) : (
          filtered.length ? (
            <div className="flex flex-col gap-24 lg:gap-32">
              {filtered.map((project, i) => (
                <ProjectCase key={project._id || project.slug} project={project} headingLevel="h2" flip={i % 2 === 1} />
              ))}
            </div>
          ) : (
            <p className="text-body text-muted">No projects use that technology yet.</p>
          )
        )}
      </div>
    </Container>
  );
}
