import { Home, FolderGit2, User, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/about', label: 'About', icon: User },
  { to: '/contact', label: 'Contact', icon: Mail }
];

export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="glass pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 md:hidden"
    >
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            `tap-target relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon aria-hidden="true" size={20} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
