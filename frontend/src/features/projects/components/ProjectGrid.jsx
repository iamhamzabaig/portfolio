import { ProjectCard } from './ProjectCard.jsx';

export function ProjectGrid({ projects }) {
  if (!projects?.length) return <p className="text-muted">No projects are published yet.</p>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project._id || project.slug} project={project} />
      ))}
    </div>
  );
}
