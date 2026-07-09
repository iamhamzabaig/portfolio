import { ProjectFeature } from './ProjectFeature.jsx';

export function ProjectGrid({ projects }) {
  if (!projects?.length) return <p className="text-muted">No projects are published yet.</p>;

  return (
    <div className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
      {projects.map((project, i) => (
        <ProjectFeature key={project._id || project.slug} project={project} index={i} />
      ))}
    </div>
  );
}
