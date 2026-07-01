import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectForm } from '../../features/projects/components/ProjectForm.jsx';
import { useCreateProject, useProjects, useUpdateProject } from '../../features/projects/api/projects.queries.js';

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectsQuery = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = Boolean(id);
  const project = projectsQuery.data?.find((item) => item._id === id);
  const mutation = isEditing ? updateProject : createProject;

  if (isEditing && projectsQuery.isLoading && !project) return <Spinner />;

  const handleSubmit = (payload) => {
    const args = isEditing ? { id, ...payload } : payload;
    mutation.mutate(args, { onSuccess: () => navigate('/admin/projects') });
  };

  return (
    <section className="max-w-3xl">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">{isEditing ? 'Edit project' : 'New project'}</h1>
      <Card className="p-5">
        <ProjectForm project={project} onSubmit={handleSubmit} isPending={mutation.isPending} />
      </Card>
    </section>
  );
}
