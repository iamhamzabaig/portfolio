import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import BlogAdmin from '../pages/admin/BlogAdmin.jsx';
import BlogEditor from '../pages/admin/BlogEditor.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Login from '../pages/admin/Login.jsx';
import Messages from '../pages/admin/Messages.jsx';
import ProfileAdmin from '../pages/admin/ProfileAdmin.jsx';
import ProjectEditor from '../pages/admin/ProjectEditor.jsx';
import ProjectsAdmin from '../pages/admin/ProjectsAdmin.jsx';
import About from '../pages/public/About.jsx';
import Blog from '../pages/public/Blog.jsx';
import BlogPost from '../pages/public/BlogPost.jsx';
import Contact from '../pages/public/Contact.jsx';
import Home from '../pages/public/Home.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import ProjectDetail from '../pages/public/ProjectDetail.jsx';
import Projects from '../pages/public/Projects.jsx';
import Styleguide from '../pages/public/Styleguide.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/styleguide" element={<Styleguide />} />
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
        <Route path="/admin/blog" element={<BlogAdmin />} />
        <Route path="/admin/blog/new" element={<BlogEditor />} />
        <Route path="/admin/blog/:id" element={<BlogEditor />} />
        <Route path="/admin/messages" element={<Messages />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
      </Route>
    </Routes>
  );
}
