import { ChevronRight, FileCode2, FileJson, FileText, Folder, SquareTerminal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navLinks } from '../layout/navLinks.js';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { usePosts } from '../../features/blog/api/blog.queries.js';
import { withShowcase } from '../../features/projects/fleet.js';
import { fallbackPosts } from '../../utils/fallbackData.js';

const icons = { tsx: [FileCode2, 'syn-fn'], json: [FileJson, 'syn-number'], md: [FileText, 'syn-type'], sh: [SquareTerminal, 'syn-string'] };

function FileLink({ to, name, depth = 0, end, onNavigate }) {
  const [Icon, color] = icons[name.split('.').pop()] || icons.md;
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className="ide-tree-item" style={{ '--depth': depth }}>
      <Icon aria-hidden="true" size={14} className={`shrink-0 ${color}`} />
      <span className="truncate">{name}</span>
    </NavLink>
  );
}

function Dir({ name, depth = 0, children }) {
  return (
    <details open className="group">
      <summary className="ide-tree-item cursor-pointer list-none [&::-webkit-details-marker]:hidden" style={{ '--depth': depth }}>
        <ChevronRight aria-hidden="true" size={14} className="shrink-0 transition-transform group-open:rotate-90" />
        <Folder aria-hidden="true" size={14} className="shrink-0 syn-keyword" />
        {name}
      </summary>
      {children}
    </details>
  );
}

// VS Code–style file tree. Every route is a file; projects and posts list
// their slugs. On phones it slides over the page as a drawer.
export function Explorer({ open = false, onNavigate }) {
  const { data: projects } = useProjects();
  const { data: posts } = usePosts();
  const projectFiles = withShowcase(projects);
  const postFiles = (posts?.length ? posts : fallbackPosts).filter((post) => post.published !== false);
  const [home, projectsLink, blogLink, ...rest] = navLinks;

  return (
    <aside
      id="explorer"
      aria-label="File explorer"
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-panel pb-8 font-mono text-caption transition-transform duration-300 md:sticky md:top-11 md:z-auto md:h-[calc(100dvh-2.75rem-1.75rem)] md:w-60 md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full max-md:invisible'
      }`}
    >
      <p className="px-3 pb-2 pt-3 text-micro uppercase tracking-[0.12em] text-muted">Explorer</p>
      <nav aria-label="Files">
        <Dir name="portfolio">
          <Dir name="src" depth={1}>
            <FileLink to={home.to} end name={home.file} depth={2} onNavigate={onNavigate} />
            <Dir name="projects" depth={2}>
              <FileLink to={projectsLink.to} end name="index.json" depth={3} onNavigate={onNavigate} />
              {projectFiles.map((project) => (
                <FileLink key={project.slug} to={`/projects/${project.slug}`} name={`${project.slug}.md`} depth={3} onNavigate={onNavigate} />
              ))}
            </Dir>
            <Dir name="blog" depth={2}>
              <FileLink to={blogLink.to} end name="index.md" depth={3} onNavigate={onNavigate} />
              {postFiles.map((post) => (
                <FileLink key={post.slug} to={`/blog/${post.slug}`} name={`${post.slug}.md`} depth={3} onNavigate={onNavigate} />
              ))}
            </Dir>
            {rest.map((link) => (
              <FileLink key={link.to} to={link.to} name={link.file} depth={2} onNavigate={onNavigate} />
            ))}
          </Dir>
        </Dir>
      </nav>
    </aside>
  );
}
