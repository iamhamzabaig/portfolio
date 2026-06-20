import { FolderKanban, Inbox, LayoutDashboard } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Container } from '../components/layout/Container.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/messages', label: 'Messages', icon: Inbox }
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-panel">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/admin" className="font-semibold">Admin</Link>
          <Link to="/" className="rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink">
            View site
          </Link>
        </Container>
      </header>
      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="grid gap-1 rounded-lg border border-border bg-panel p-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface hover:text-ink'}`
                  }
                >
                  <Icon aria-hidden="true" size={17} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <Outlet />
      </Container>
    </div>
  );
}
