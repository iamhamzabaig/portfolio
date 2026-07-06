import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const toggle = useCallback(
    (event) => {
      const next = theme === 'dark' ? 'light' : 'dark';

      // Fallback: no View Transitions support or reduced motion → instant swap.
      if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
        flushSync(() => {
          applyTheme(next);
          setTheme(next);
        });
        return;
      }

      // Origin of the reveal = the toggle that was clicked (fallback: top-right).
      const x = event?.clientX ?? window.innerWidth - 40;
      const y = event?.clientY ?? 40;
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          applyTheme(next);
          setTheme(next);
        });
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
            { duration: 480, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(() => {
          /* a transition can be skipped mid-flight; the theme is already applied */
        });
    },
    [theme]
  );

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
