import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Login from '../pages/admin/Login.jsx';
import Messages from '../pages/admin/Messages.jsx';
import ProjectEditor from '../pages/admin/ProjectEditor.jsx';
import ProjectsAdmin from '../pages/admin/ProjectsAdmin.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Home from '../pages/public/Home.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import ProjectDetail from '../pages/public/ProjectDetail.jsx';
import Projects from '../pages/public/Projects.jsx';

export function AppRoutes() {
  return (
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
      </Route>
    </Routes>
  );
}
