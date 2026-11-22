import { Home, FolderGit2, PenLine, User, Mail } from 'lucide-react';

// Single source of truth for the primary public navigation. Consumed by the
// desktop Navbar, the mobile BottomTabBar, and the Footer so all three stay in
// sync. `icon` is used by the bottom tab bar; the others ignore it.
// `end` marks exact-match routes (only Home). Non-end links stay active on
// child routes (e.g. /projects highlights on /projects/:slug).
export const navLinks = [
  { to: '/', label: 'Home', end: true, icon: Home, file: 'home.tsx' },
  { to: '/projects', label: 'Projects', icon: FolderGit2, file: 'projects.json' },
  { to: '/blog', label: 'Blog', icon: PenLine, file: 'blog.md' },
  { to: '/about', label: 'About', icon: User, file: 'about.md' },
  { to: '/contact', label: 'Contact', icon: Mail, file: 'contact.sh' }
];

// The IDE chrome names every route as a file: /projects/x → x.md.
export function fileForPath(path) {
  const [section, slug] = path.split('/').filter(Boolean);
  if (slug) return `${slug}.md`;
  return navLinks.find((link) => link.to === `/${section || ''}`)?.file || `${section}.txt`;
}
