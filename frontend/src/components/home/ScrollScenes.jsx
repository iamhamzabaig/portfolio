import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { engineeringApproach } from '../../utils/fallbackData.js';

// The visual describes the actual retrieval architecture, rather than inventing a product screenshot.
export function SystemVisual() {
  return (
    <div className="system-visual" data-hero-visual>
      <div className="system-orbit" data-depth="back" aria-hidden="true" />
      <div className="system-caption" data-depth="front"><span>From private data to grounded answers</span><ArrowDown size={18} aria-hidden="true" /></div>
      <div className="system-nodes" data-depth="mid">
        {engineeringApproach.pipeline.map((node, i) => (
          <div className="system-node" key={node.id}>
            <span className="font-mono text-caption text-accent">{String(i + 1).padStart(2, '0')}</span>
            <strong>{node.label}</strong><span>{node.sub}</span>
          </div>
        ))}
      </div>
      <p className="system-footnote" data-depth="front">AI Knowledge Assistant / System architecture</p>
    </div>
  );
}

export function EngineeringStatement() {
  const lines = ['Systems,', 'not scripts.'];
  return (
    <section className="engineering-statement" data-scene="statement" aria-labelledby="engineering-statement">
      <div className="statement-stage">
        <h2 id="engineering-statement" aria-label="Systems, not scripts.">
          {lines.map((line) => <span className="statement-line" aria-hidden="true" key={line}>
            <span>{line}</span><span className="statement-ink" data-statement-ink>{line}</span>
          </span>)}
        </h2>
        <p className="max-w-lg text-body-lg text-muted">A production retrieval pipeline — every stage typed, measured, and grounded.</p>
      </div>
    </section>
  );
}

export function ProjectShowcase({ projects }) {
  return (
    <section className="project-showcase" data-scene="projects" data-scene-key={projects.map(p => p.slug).join(',')} aria-labelledby="selected-work">
      <div className="project-stage">
        <div className="project-stage-heading"><h2 id="selected-work">Selected work</h2><Link to="/projects">All projects <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <div className="project-deck">
          {projects.map((project, index) => (
            <article className="scene-project" data-project key={project.slug}>
              <div className="scene-project-art" data-project-art>
                {project.coverImage?.url ? <img src={project.coverImage.url} alt="" loading="lazy" /> : (
                  <div className="project-type-art" aria-hidden="true">
                    <span className="project-art-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="project-art-title">{project.title}</span>
                    <div className="project-art-tags">{project.tags?.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div>
                  </div>
                )}
              </div>
              <div className="scene-project-copy">
                <span className="text-caption text-muted">{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                <h3>{project.title}</h3><p>{project.description}</p>
                <Link to={`/projects/${project.slug}`}>Explore project <ArrowUpRight size={18} aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
        </div>
        <div className="scene-progress" aria-hidden="true"><span data-project-progress /></div>
      </div>
    </section>
  );
}
