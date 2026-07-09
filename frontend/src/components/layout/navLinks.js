import { Home, FolderGit2, PenLine, User, Mail } from 'lucide-react';

// Single source of truth for the primary public navigation. Consumed by the
// desktop Navbar, the mobile BottomTabBar, and the Footer so all three stay in
// sync. `icon` is used by the bottom tab bar; the others ignore it.
// `end` marks exact-match routes (only Home). Non-end links stay active on
// child routes (e.g. /projects highlights on /projects/:slug).
export const navLinks = [
  { to: '/', label: 'Home', end: true, icon: Home },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/blog', label: 'Blog', icon: PenLine },
  { to: '/about', label: 'About', icon: User },
  { to: '/contact', label: 'Contact', icon: Mail }
];
