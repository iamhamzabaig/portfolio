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

// Minimal Apple-style mark: a clean "< >" code glyph inside a softly-rounded
// app-icon tile. Monochrome, scales crisply.
function Monogram() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-[7px] bg-ink text-bg">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
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
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: profile } = useProfile();
  const resumeUrl = profile?.resumeUrl;

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
      className={`sticky top-0 z-40 transition-colors duration-300 ease-apple ${
        scrolled
          ? 'border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-bg/60 backdrop-blur-xl backdrop-saturate-150'
      }`}
    >
      <Container className="flex h-12 items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <Monogram />
          <span className="font-display text-[14px] font-semibold tracking-tight text-ink">Hamza Munawar</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-[13px] transition-colors duration-200 ${
                  isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3.5 -bottom-px h-px rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
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
              className="hidden rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-white transition duration-300 ease-apple hover:brightness-110 sm:inline-flex"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition hover:bg-surface md:hidden"
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <Container className="flex flex-col gap-1 py-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-[15px] transition-colors ${
                      isActive ? 'bg-surface text-ink' : 'text-ink/70 hover:bg-surface hover:text-ink'
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
                  className="mt-1 rounded-full bg-accent px-4 py-3 text-center text-[15px] font-medium text-white transition hover:brightness-110 sm:hidden"
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
