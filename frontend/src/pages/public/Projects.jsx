import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { RevealScope } from '../../components/ui/RevealScope.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
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
      <RevealScope immediate className="mx-auto max-w-2xl text-center">
        <Eyebrow data-fade>Projects</Eyebrow>
        <h1 data-split className="mt-3 font-display text-fluid-h1 font-semibold text-ink">
          Selected work
        </h1>
        <p data-split className="mt-5 text-body-lg text-muted">
          Real-time platforms, enterprise ERP, and high-performance frontends across React, Angular, Vue, and Node.
        </p>
      </RevealScope>

      {/* Tag filter — a single dropdown menu. Scales to any number of tags,
          no horizontal scroll. Single-select; "All" resets. */}
      <div className="mt-10 flex justify-center">
        <div ref={menuRef} className="relative">
          <span className="mr-2 text-caption text-muted">Filter</span>
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
                className="absolute left-1/2 z-30 mt-2 max-h-56 w-44 -translate-x-1/2 overflow-y-auto overscroll-contain rounded-card bg-panel p-1 shadow-overlay ring-1 ring-border/70"
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

      <div className="mt-12">
        {projectsQuery.isLoading && !projectsQuery.data ? (
          <Spinner label="Loading projects" />
        ) : (
          <ProjectGrid projects={filtered} />
        )}
      </div>
    </Container>
  );
}
