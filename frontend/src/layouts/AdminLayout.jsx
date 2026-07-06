import { FolderKanban, Inbox, LayoutDashboard, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Container } from '../components/layout/Container.jsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/profile', label: 'Profile', icon: UserRound }
];

export function AdminLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-panel">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/admin" className="font-display font-semibold tracking-tight text-ink">Admin</Link>
          <Link to="/" className="rounded-control px-3 py-2 text-body-sm text-muted transition-colors hover:bg-surface hover:text-ink">
            View site
          </Link>
        </Container>
      </header>
      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="grid gap-1 rounded-card border border-border bg-panel p-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-control px-3 py-2 text-body-sm transition-colors ${isActive ? 'bg-accent text-on-accent' : 'text-muted hover:bg-surface hover:text-ink'}`
                  }
                >
                  <Icon aria-hidden="true" size={17} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </Container>
    </div>
  );
}
