import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectCase } from '../../features/projects/components/ProjectCase.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { getFleetMeta, withShowcase } from '../../features/projects/fleet.js';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../../components/ide/CodeBlock.jsx';

const ALL = 'All';

export default function Projects() {
  const [active, setActive] = useState(ALL);
  const projectsQuery = useProjects();
  const projects = withShowcase(projectsQuery.data);

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
        <SectionTitle as="h1" file="ls -la ~/projects">Projects</SectionTitle>
        <p className="mt-6 max-w-[58ch] text-body-lg text-muted">
          Everything I have built, from live products to earlier work. Filter by technology.
        </p>
      </div>

      {/* Tag filter — a single dropdown menu. Scales to any number of tags,
          no horizontal scroll. Single-select; "All" resets. */}
      <div className="mt-10 flex">
        <div ref={menuRef} className="relative">
          <span className="mono mr-3 text-caption text-muted"><span className="syn-keyword">grep</span> --stack=</span>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-1.5 rounded-control bg-panel px-3 py-1.5 text-caption font-medium text-ink ring-1 ring-border/70 hover:ring-border spring-press"
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
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 32 } }}
                exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] } }}
                style={{ transformOrigin: 'top left' }}
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

      {filtered.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-card bg-panel ring-1 ring-border">
          <table className="w-full font-mono text-caption">
            <caption className="sr-only">Project listing</caption>
            <thead className="text-left text-muted">
              <tr className="border-b border-border">
                <th scope="col" className="hidden px-4 py-2.5 font-normal md:table-cell">mode</th>
                <th scope="col" className="hidden px-4 py-2.5 font-normal sm:table-cell">built</th>
                <th scope="col" className="px-4 py-2.5 font-normal">status</th>
                <th scope="col" className="px-4 py-2.5 font-normal">name</th>
                <th scope="col" className="hidden px-4 py-2.5 font-normal lg:table-cell">stack</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const meta = getFleetMeta(project);
                const live = meta.status === 'Live';
                return (
                  <tr key={project._id || project.slug} className="border-b border-border/60 last:border-b-0 hover:bg-surface">
                    <td className="hidden px-4 py-2.5 text-muted md:table-cell">drwxr-xr-x</td>
                    <td className="hidden px-4 py-2.5 syn-number sm:table-cell">{meta.built || '—'}</td>
                    <td className={`whitespace-nowrap px-4 py-2.5 ${live ? 'syn-string' : 'syn-keyword'}`}>{meta.status}</td>
                    <td className="px-4 py-2.5">
                      <Link to={`/projects/${project.slug}`} className="syn-fn hover:underline">{project.slug}/</Link>
                    </td>
                    <td className="hidden px-4 py-2.5 syn-type lg:table-cell">{(project.tags || []).slice(0, 4).join(' · ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-16">
        {projectsQuery.isLoading && !projectsQuery.data ? (
          <Spinner label="Loading projects" />
        ) : (
          filtered.length ? (
            <div className="flex flex-col gap-24 lg:gap-32">
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((project, i) => (
                  <motion.div key={project._id || project.slug} layout="position"
                    initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                    <ProjectCase project={project} headingLevel="h2" flip={i % 2 === 1} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-body text-muted">No projects use that technology yet.</p>
          )
        )}
      </div>
    </Container>
  );
}
