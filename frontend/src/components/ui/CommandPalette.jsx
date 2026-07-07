import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  CornerDownLeft,
  FileText,
  FolderGit2,
  Github,
  Home as HomeIcon,
  Linkedin,
  Lock,
  Mail,
  Moon,
  Search,
  Send,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from './Toast.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { fallbackProfile, fallbackProjects } from '../../utils/fallbackData.js';

// ⌘K command palette. `CommandPaletteProvider` owns the open state, binds the
// global ⌘K / Ctrl+K shortcut, renders the overlay, and hands `open()` to
// consumers (e.g. the navbar hint button) via `useCommandPalette()`.

const noop = () => {};
const FALLBACK = { isOpen: false, open: noop, close: noop };

const PaletteContext = createContext(null);

// Degrades to a no-op outside a provider so a consumer (e.g. the navbar) can be
// rendered in isolation — in tests, or before the provider mounts — without
// crashing. Inside <CommandPaletteProvider> it returns the live controls.
export function useCommandPalette() {
  return useContext(PaletteContext) || FALLBACK;
}

// Subsequence + substring scorer. Returns -1 for no match, higher = better.
function fuzzy(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx; // contiguous match wins
  let ti = 0;
  let score = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    score += 1 / (found - ti + 1);
    ti = found + 1;
  }
  return score;
}

function scoreItem(query, item) {
  const haystacks = [item.label, item.section, ...(item.keywords || [])];
  return Math.max(...haystacks.map((h) => fuzzy(query, h || '')));
}

export function CommandPaletteProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global ⌘K / Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </PaletteContext.Provider>
  );
}

function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggle } = useTheme();
  const { data: projectsData } = useProjects();
  const { data: profileData } = useProfile();

  const profile = profileData || fallbackProfile;
  const projects = projectsData?.length ? projectsData : fallbackProjects;

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const go = useCallback(
    (to) => {
      onClose();
      navigate(to);
    },
    [navigate, onClose]
  );

  const external = useCallback(
    (url) => {
      onClose();
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [onClose]
  );

  // The full command set, rebuilt when data/theme changes.
  const items = useMemo(() => {
    const github = profile.socials?.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/iamhamzabaig';
    const linkedin =
      profile.socials?.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com/in/iamhamzabaig-in';
    const email = profile.email || fallbackProfile.email;

    const pages = [
      { id: 'home', label: 'Home', section: 'Go to', icon: HomeIcon, keywords: ['start'], run: () => go('/') },
      { id: 'projects', label: 'Projects', section: 'Go to', icon: FolderGit2, keywords: ['work', 'portfolio'], run: () => go('/projects') },
      { id: 'about', label: 'About', section: 'Go to', icon: User, keywords: ['experience', 'skills', 'resume'], run: () => go('/about') },
      { id: 'contact', label: 'Contact', section: 'Go to', icon: Send, keywords: ['hire', 'email', 'message'], run: () => go('/contact') }
    ];

    const projectItems = projects.map((p) => ({
      id: `project-${p.slug}`,
      label: p.title,
      section: 'Projects',
      icon: FolderGit2,
      keywords: [...(p.tags || []), p.description || ''],
      run: () => go(`/projects/${p.slug}`)
    }));

    const actions = [
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        section: 'Actions',
        icon: Moon,
        keywords: ['dark', 'light', 'appearance', 'mode'],
        keepOpen: true,
        run: () => toggle()
      },
      {
        id: 'copy-email',
        label: 'Copy email address',
        section: 'Actions',
        icon: Mail,
        keywords: ['contact', email],
        run: async () => {
          try {
            await navigator.clipboard.writeText(email);
            toast({ tone: 'success', message: 'Email copied to clipboard' });
          } catch {
            toast({ tone: 'info', message: email });
          }
          onClose();
        }
      },
      { id: 'github', label: 'Open GitHub', section: 'Actions', icon: Github, keywords: ['code', 'source'], run: () => external(github) },
      { id: 'linkedin', label: 'Open LinkedIn', section: 'Actions', icon: Linkedin, keywords: ['profile', 'connect'], run: () => external(linkedin) }
    ];

    if (profile.resumeUrl) {
      actions.push({
        id: 'resume',
        label: 'Download résumé',
        section: 'Actions',
        icon: FileText,
        keywords: ['cv', 'pdf'],
        run: () => external(profile.resumeUrl)
      });
    }

    actions.push({ id: 'admin', label: 'Admin sign-in', section: 'Actions', icon: Lock, keywords: ['login', 'dashboard'], run: () => go('/admin/login') });

    return [...pages, ...projectItems, ...actions];
  }, [projects, profile, theme, go, external, toggle, toast, onClose]);

  // Filter + rank. Empty query keeps the natural order.
  const results = useMemo(() => {
    if (!query.trim()) return items;
    return items
      .map((item) => ({ item, s: scoreItem(query.trim(), item) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.item);
  }, [items, query]);

  // Reset selection whenever the visible list changes.
  useEffect(() => {
    setActive(0);
  }, [query, isOpen]);

  // On open: remember focus, lock scroll, focus the input. Restore on close.
  useEffect(() => {
    if (!isOpen) return undefined;
    restoreFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      setQuery('');
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus();
    };
  }, [isOpen]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    const node = listRef.current?.querySelector('[data-active="true"]');
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[active]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      // Keep focus trapped on the input; navigation is arrow-driven.
      e.preventDefault();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close command palette"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/20 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-card border border-border bg-panel shadow-overlay"
          >
            {/* Search field */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search aria-hidden="true" size={18} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, projects, actions…"
                aria-label="Search commands"
                className="h-14 w-full bg-transparent text-body text-ink outline-none placeholder:text-muted/70"
              />
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-body-sm text-muted">No matches for “{query}”.</p>
              ) : (
                results.map((item, i) => {
                  const Icon = item.icon || ArrowUpRight;
                  const isActive = i === active;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={isActive}
                      onMouseMove={() => setActive(i)}
                      onClick={() => item.run()}
                      className={`flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-surface text-ink' : 'text-ink/80 hover:bg-surface/60'
                      }`}
                    >
                      <Icon aria-hidden="true" size={16} className={isActive ? 'text-accent' : 'text-muted'} />
                      <span className="flex-1 truncate text-body-sm">{item.label}</span>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted/70">
                        {item.section}
                      </span>
                      {isActive && <CornerDownLeft aria-hidden="true" size={14} className="shrink-0 text-muted" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer legend */}
            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1">↑</kbd>
                <kbd className="rounded border border-border px-1">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1">↵</kbd>
                open
              </span>
              <span className="ml-auto flex items-center gap-1">
                <kbd className="rounded border border-border px-1">⌘</kbd>
                <kbd className="rounded border border-border px-1">K</kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
