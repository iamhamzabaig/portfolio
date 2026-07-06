import { useState } from 'react';
import { Edit3, Plus, Trash2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Dialog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useDeleteProject, useProjects } from '../../features/projects/api/projects.queries.js';

export default function ProjectsAdmin() {
  const projectsQuery = useProjects();
  const deleteProject = useDeleteProject();
  const projects = projectsQuery.data || [];
  const [toDelete, setToDelete] = useState(null);

  if (projectsQuery.isLoading && !projectsQuery.data) return <Spinner />;

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteProject.mutate(toDelete._id, { onSuccess: () => setToDelete(null) });
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Projects</h1>
        <Button as={Link} to="/admin/projects/new">
          <Plus aria-hidden="true" size={17} />
          New
        </Button>
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-panel">
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
                  <p className="text-caption text-muted">{project.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    to={`/admin/projects/${project._id}`}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Edit ${project.title}`}
                  >
                    <Edit3 aria-hidden="true" size={17} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Delete ${project.title}`}
                    onClick={() => setToDelete(project)}
                  >
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteProject.isPending}
        title="Delete project?"
        description={toDelete ? `“${toDelete.title}” will be permanently removed. This can’t be undone.` : ''}
      />
    </section>
  );
}
