import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fileForPath } from '../layout/navLinks.js';

// One tab per route visited this session, like files opened in an editor.
// Closing the active tab moves to its neighbour (or home).
export function EditorTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([pathname]);

  useEffect(() => {
    setTabs((open) => (open.includes(pathname) ? open : [...open, pathname]));
  }, [pathname]);

  const close = (path) => {
    const i = tabs.indexOf(path);
    const next = tabs.filter((t) => t !== path);
    setTabs(next.length ? next : ['/']);
    if (path === pathname) navigate(next[Math.min(i, next.length - 1)] || '/');
  };

  const crumbs = ['portfolio', 'src', ...pathname.split('/').filter(Boolean).slice(0, -1), fileForPath(pathname)];

  return (
    <div className="sticky top-11 z-30 border-b border-border bg-panel font-mono text-caption">
      <div className="ide-scroll flex overflow-x-auto" role="tablist" aria-label="Open files">
        {tabs.map((path) => {
          const active = path === pathname;
          return (
            <div key={path} className="ide-tab" data-active={active || undefined}>
              <Link to={path} role="tab" aria-selected={active}>
                {fileForPath(path)}
              </Link>
              <button
                type="button"
                onClick={() => close(path)}
                aria-label={`Close ${fileForPath(path)}`}
                className="grid h-6 w-6 place-items-center rounded-control text-muted hover:bg-surface hover:text-ink"
              >
                <X aria-hidden="true" size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <p className="hidden truncate border-t border-border bg-bg px-4 py-1 text-micro text-muted sm:block">
        {crumbs.join(' › ')}
      </p>
    </div>
  );
}
