import { useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCommandPalette } from '../ui/CommandPalette.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';

// IDE title bar: window dots, the current path as a shell prompt, ⌘K search
// and the résumé. On phones a menu button opens the explorer drawer.
export function Navbar({ onToggleExplorer, explorerOpen = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: profile } = useProfile();
  const { open: openPalette } = useCommandPalette();
  const resumeUrl = profile?.resumeUrl;

  // Secret admin gateway: Ctrl+Shift+A (the Admin link is intentionally not shown
  // in the public nav). Auth still gates /admin regardless.
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 flex h-11 items-center gap-3 border-b border-border bg-panel px-3 font-mono text-caption">
      {onToggleExplorer && (
        <button
          type="button"
          onClick={onToggleExplorer}
          aria-label="Toggle file explorer"
          aria-expanded={explorerOpen}
          aria-controls="explorer"
          className="-ml-1 inline-flex h-11 w-11 items-center justify-center text-muted hover:text-ink md:hidden"
        >
          <Menu aria-hidden="true" size={18} />
        </button>
      )}
      <span aria-hidden="true" className="hidden gap-2 md:flex">
        <span className="h-3 w-3 rounded-full bg-[#f7768e]" />
        <span className="h-3 w-3 rounded-full bg-[#e0af68]" />
        <span className="h-3 w-3 rounded-full bg-[#9ece6a]" />
      </span>
      <Link to="/" className="min-w-0 truncate md:ml-3">
        <span className="syn-string">hamza</span>
        <span className="text-muted">@</span>
        <span className="syn-fn">portfolio</span>
        <span className="text-muted">:</span>
        <span className="syn-keyword">~{pathname === '/' ? '' : pathname}</span>
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+K Control+K"
          className="inline-flex h-8 items-center gap-2 rounded-control px-2.5 text-muted ring-1 ring-border transition-colors hover:text-ink sm:w-56"
        >
          <Search aria-hidden="true" size={14} />
          <span className="hidden sm:inline">Search files…</span>
          <kbd className="ml-auto hidden text-micro sm:inline">⌘K</kbd>
        </button>
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Résumé (PDF)"
            className="inline-flex h-8 items-center rounded-control bg-accent px-3 font-medium text-on-accent transition hover:brightness-110"
          >
            resume.pdf
          </a>
        ) : null}
      </div>
    </header>
  );
}
