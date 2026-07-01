import { Edit3, Plus, Trash2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useDeleteProject, useProjects } from '../../features/projects/api/projects.queries.js';

export default function ProjectsAdmin() {
  const projectsQuery = useProjects();
  const deleteProject = useDeleteProject();
  const projects = projectsQuery.data || [];

  if (projectsQuery.isLoading && !projectsQuery.data) return <Spinner />;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-ink">Projects</h1>
        <Button as={Link} to="/admin/projects/new">
          <Plus aria-hidden="true" size={17} />
          New
        </Button>
      </div>
      <div className="soft-card overflow-hidden">
        {projects.length ? (
          <ul className="divide-y divide-border">
            {projects.map((project) => (
              <li key={project._id || project.slug} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {project.title}
                    {project.video?.url ? (
                      <span className="text-accent" title="Has demo video">
                        <Video aria-hidden="true" size={15} />
                        <span className="sr-only">Has demo video</span>
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted">{project.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button as={Link} to={`/admin/projects/${project._id}`} variant="ghost" aria-label={`Edit ${project.title}`}>
                    <Edit3 aria-hidden="true" size={17} />
                  </Button>
                  <Button variant="ghost" aria-label={`Delete ${project.title}`} onClick={() => deleteProject.mutate(project._id)}>
                    <Trash2 aria-hidden="true" size={17} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-muted">No projects yet.</p>
        )}
      </div>
    </section>
  );
}
