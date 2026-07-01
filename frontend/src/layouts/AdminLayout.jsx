import { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody
} from '@heroui/react';
import { FolderKanban, Inbox, LayoutDashboard, Menu, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Container } from '../components/layout/Container.jsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/profile', label: 'Profile', icon: UserRound }
];

function NavLinks({ onNavigate }) {
  return links.map((link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface hover:text-ink'
          }`
        }
      >
        <Icon aria-hidden="true" size={17} />
        {link.label}
      </NavLink>
    );
  });
}

export function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg">
      <header className="glass border-b border-border">
        <Container className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open admin menu"
              onClick={() => setMenuOpen(true)}
              className="tap-target inline-flex items-center justify-center rounded-md border border-border text-muted lg:hidden"
            >
              <Menu aria-hidden="true" size={18} />
            </button>
            <Link to="/admin" className="font-semibold">Admin</Link>
          </div>
          <Link to="/" className="rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink">
            View site
          </Link>
        </Container>
      </header>

      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="Admin" className="grid gap-1 rounded-lg border border-border bg-panel p-2">
            <NavLinks />
          </nav>
        </aside>

        <ErrorBoundary key={location.pathname}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </ErrorBoundary>
      </Container>

      <Drawer isOpen={menuOpen} onOpenChange={setMenuOpen} placement="left" size="xs">
        <DrawerContent>
          <DrawerHeader className="font-display">Admin</DrawerHeader>
          <DrawerBody>
            <nav aria-label="Admin mobile" className="grid gap-1">
              <NavLinks onNavigate={() => setMenuOpen(false)} />
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
