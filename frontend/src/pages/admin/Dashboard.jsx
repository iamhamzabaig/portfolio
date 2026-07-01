import { FolderKanban, Inbox, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{user?.email}</p>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut aria-hidden="true" size={17} />
          Log out
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <FolderKanban aria-hidden="true" className="text-accent" size={22} />
          <h2 className="mt-4 font-semibold">Projects</h2>
          <p className="mt-2 text-sm text-muted">Create, edit, and remove portfolio projects.</p>
          <Link to="/admin/projects" className="mt-4 inline-block text-sm text-accent">Manage projects</Link>
        </Card>
        <Card className="p-5">
          <Inbox aria-hidden="true" className="text-teal" size={22} />
          <h2 className="mt-4 font-semibold">Messages</h2>
          <p className="mt-2 text-sm text-muted">Review and delete contact submissions.</p>
          <Link to="/admin/messages" className="mt-4 inline-block text-sm text-accent">View messages</Link>
        </Card>
      </div>
    </section>
  );
}
