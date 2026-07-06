import { useMemo, useState } from 'react';
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

      {/* Tag filter pills — replace free-text search. Single-select; "All" resets. */}
      <div
        role="group"
        aria-label="Filter projects by technology"
        className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2"
      >
        {filters.map((tag) => {
          const isActive = tag === active;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              aria-pressed={isActive}
              className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-caption font-medium transition duration-300 ease-apple active:scale-[0.97] ${
                isActive
                  ? 'bg-ink text-bg'
                  : 'bg-surface text-muted ring-1 ring-border/60 hover:text-ink'
              }`}
            >
              {tag}
            </button>
          );
        })}
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
