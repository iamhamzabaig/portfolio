import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { fallbackProjects } from '../../utils/fallbackData.js';

export default function Projects() {
  const [query, setQuery] = useState('');
  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.length ? projectsQuery.data : fallbackProjects;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) =>
      [project.title, project.description, ...(project.tags || [])].join(' ').toLowerCase().includes(needle)
    );
  }, [projects, query]);

  return (
    <Container className="py-14">
      <div className="mb-8 grid gap-5 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <p className="font-mono text-xs tracking-eyebrow text-accent">PROJECTS</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">Selected work</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Real-time platforms, enterprise ERP, and high-performance frontends across React, Angular, Vue, and Node.
          </p>
        </div>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-muted" size={17} />
          <Input
            id="project-search"
            aria-label="Search projects"
            placeholder="Search projects"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      {projectsQuery.isLoading && !projectsQuery.data ? <Spinner /> : <ProjectGrid projects={filtered} />}
    </Container>
  );
}
