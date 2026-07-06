import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext.jsx';

const spring = { type: 'spring', stiffness: 420, damping: 26 };

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      whileTap={{ scale: 0.88 }}
      transition={spring}
      className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-ink/70 transition-colors hover:bg-surface hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 10, rotate: -75, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, rotate: 75, opacity: 0, scale: 0.5 }}
          transition={spring}
          className="inline-flex"
        >
          {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
