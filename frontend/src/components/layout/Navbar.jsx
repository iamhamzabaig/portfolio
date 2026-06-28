import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Container } from './Container.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

function HexMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
        <path
          d="M12 2.2 20.5 7v10L12 21.8 3.5 17V7L12 2.2Z"
          fill="rgba(124,108,242,0.18)"
          stroke="#7c6cf2"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M9 15.5 12 8l3 7.5M10 13.4h4" stroke="#f4f1ea" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: profile } = useProfile();
  const resumeUrl = profile?.resumeUrl;

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 lowercase tracking-tight">
          <HexMark />
          <span className="font-display text-[15px] font-semibold text-ink">hamza munawar</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-border bg-panel/70 px-1.5 py-1.5 md:flex"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-surface shadow-soft"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-border bg-ink px-4 py-1.5 text-sm font-semibold text-bg transition hover:bg-white sm:inline-flex"
            >
              Resume
            </a>
          ) : null}
          <button
            type="button"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted md:hidden"
          >
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur md:hidden"
          >
            <Container className="flex flex-col gap-1 py-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-xl border border-border bg-ink px-4 py-2.5 text-center text-sm font-semibold text-bg transition hover:bg-white sm:hidden"
                >
                  Resume
                </a>
              ) : null}
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
