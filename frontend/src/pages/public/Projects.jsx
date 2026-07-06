import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
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
    <Container className="py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[15px] font-semibold text-accent">Projects</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          Selected work
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Real-time platforms, enterprise ERP, and high-performance frontends across React, Angular, Vue, and Node.
        </p>
        <div className="relative mx-auto mt-8 max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <Input
            id="project-search"
            aria-label="Search projects"
            placeholder="Search projects"
            className="pl-11 text-center"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </Reveal>

      <div className="mt-16">
        {projectsQuery.isLoading && !projectsQuery.data ? (
          <Spinner label="Loading projects" />
        ) : (
          <ProjectGrid projects={filtered} />
        )}
      </div>
    </Container>
  );
}
