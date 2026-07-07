import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { navLinks } from './navLinks.js';

// Native-style mobile tab bar. Fixed to the bottom, frosted like the top
// Navbar, hidden from md up (desktop keeps the header nav). Owns primary
// navigation on phones — the Navbar's hamburger menu is retired in its favor.
// Safe-area padding clears the iOS home indicator; each tab is a ≥44px target.
export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-bg/70 backdrop-blur-2xl backdrop-saturate-[180%] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navLinks.map(({ to, label, end, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className="group relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-active"
                      className="absolute top-1 h-1 w-6 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.span
                    whileTap={{ scale: 0.86 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                    className={`flex flex-col items-center gap-0.5 transition-colors duration-200 ${
                      isActive ? 'text-accent' : 'text-ink/55'
                    }`}
                  >
                    <Icon aria-hidden="true" size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={`text-micro leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {label}
                    </span>
                  </motion.span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
