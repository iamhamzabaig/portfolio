import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { BottomSheet } from '../../components/layout/BottomSheet.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { fallbackProjects } from '../../utils/fallbackData.js';

function SearchField({ query, setQuery }) {
  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 z-10 text-muted" size={17} />
      <Input
        id="project-search"
        aria-label="Search projects"
        placeholder="Search projects"
        className="pl-9"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </div>
  );
}

export default function Projects() {
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      <Reveal className="mb-8 grid gap-5 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <p className="font-mono text-xs tracking-eyebrow text-accent">PROJECTS</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">Selected work</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Real-time platforms, enterprise ERP, and high-performance frontends across React, Angular, Vue, and Node.
          </p>
        </div>
        {/* Desktop: inline search. Mobile: a Filters button opens the sheet. */}
        <div className="hidden md:block">
          <SearchField query={query} setQuery={setQuery} />
        </div>
        <div className="md:hidden">
          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal aria-hidden="true" size={16} /> Filters
          </Button>
        </div>
      </Reveal>

      <BottomSheet isOpen={filtersOpen} onOpenChange={setFiltersOpen} title="Filter projects">
        <SearchField query={query} setQuery={setQuery} />
      </BottomSheet>

      {projectsQuery.isLoading && !projectsQuery.data ? (
        <div data-testid="projects-skeleton" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : (
        <ProjectGrid projects={filtered} />
      )}
    </Container>
  );
}
