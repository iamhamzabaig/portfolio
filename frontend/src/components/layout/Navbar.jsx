import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container } from './Container.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { navLinks } from './navLinks.js';
import { useCommandPalette } from '../ui/CommandPalette.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';

export function Navbar() {
  const navigate = useNavigate();
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
    <header className="sticky top-0 z-40 bg-bg/75 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-body-sm font-semibold text-bg">
            H
          </span>
          <span className="font-display text-body font-semibold tracking-tight text-ink">Hamza Munawar</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full bg-panel/80 p-1 ring-1 ring-border md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-body-sm transition-colors duration-200 ${
                  isActive ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-body-sm text-muted transition-colors hover:text-ink"
          >
            <Search aria-hidden="true" size={16} />
            <kbd className="mono hidden rounded-md px-1.5 py-0.5 text-micro ring-1 ring-border sm:inline">⌘K</kbd>
          </button>
          <ThemeToggle />
          {resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm btn-plain">
              Résumé
            </a>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
