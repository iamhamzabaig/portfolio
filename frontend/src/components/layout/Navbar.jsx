import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container } from './Container.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { navLinks } from './navLinks.js';
import { useCommandPalette } from '../ui/CommandPalette.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';

// Minimal Apple-style mark: a clean "< >" code glyph inside a softly-rounded
// app-icon tile. Monochrome, scales crisply.
function Monogram() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-[7px] bg-ink text-bg">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M9.5 8L6 12L9.5 16M14.5 8L18 12L14.5 16"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { data: profile } = useProfile();
  const { open: openPalette } = useCommandPalette();
  const resumeUrl = profile?.resumeUrl;

  // The nav hairline + frost deepen once the page scrolls, so it floats cleanly
  // over the hero at the top — Apple's global-nav behavior.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-40 backdrop-blur-2xl backdrop-saturate-[180%] transition-colors duration-300 ease-apple ${
        scrolled
          ? 'border-b border-border/70 bg-bg/70'
          : 'border-b border-transparent bg-bg/50'
      }`}
    >
      <Container className="flex h-12 items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <Monogram />
          <span className="font-display text-body-sm font-semibold tracking-tight text-ink">Hamza Munawar</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative rounded-full px-3 py-1.5 text-caption transition-colors duration-200 ${
                  isActive ? 'font-semibold text-ink' : 'text-ink/60 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-ink/[0.06] dark:bg-ink/[0.09]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* ⌘K command palette trigger — a search pill on desktop, an icon on
              mobile. The palette itself is bound to ⌘K/Ctrl+K globally. */}
          <motion.button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="hidden items-center gap-2 rounded-full border border-border/70 bg-surface/60 py-1 pl-2.5 pr-1.5 text-caption text-muted transition-colors duration-300 ease-apple hover:border-border hover:bg-surface hover:text-ink sm:inline-flex"
          >
            <Search aria-hidden="true" size={14} />
            <span>Search</span>
            <kbd className="rounded border border-border bg-panel px-1.5 py-0.5 font-mono text-micro leading-none text-muted">
              ⌘K
            </kbd>
          </motion.button>
          <motion.button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors duration-300 ease-apple hover:bg-surface sm:hidden"
          >
            <Search aria-hidden="true" size={18} />
          </motion.button>
          <ThemeToggle />
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-8 items-center rounded-full bg-accent px-3.5 py-1.5 text-caption font-medium text-white transition duration-300 ease-apple hover:brightness-110 active:scale-[0.97]"
            >
              Résumé
            </a>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
