import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Home from '../pages/public/Home.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import ProjectDetail from '../pages/public/ProjectDetail.jsx';
import Projects from '../pages/public/Projects.jsx';

// Admin is behind auth and rarely visited by public traffic — code-split it (and
// the heavy form/table deps it pulls in) out of the initial public bundle.
const Dashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const Login = lazy(() => import('../pages/admin/Login.jsx'));
const Messages = lazy(() => import('../pages/admin/Messages.jsx'));
const ProfileAdmin = lazy(() => import('../pages/admin/ProfileAdmin.jsx'));
const ProjectEditor = lazy(() => import('../pages/admin/ProjectEditor.jsx'));
const ProjectsAdmin = lazy(() => import('../pages/admin/ProjectsAdmin.jsx'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/projects" element={<ProjectsAdmin />} />
          <Route path="/admin/projects/new" element={<ProjectEditor />} />
          <Route path="/admin/projects/:id" element={<ProjectEditor />} />
          <Route path="/admin/messages" element={<Messages />} />
          <Route path="/admin/profile" element={<ProfileAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
