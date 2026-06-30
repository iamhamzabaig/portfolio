# HeroUI v2 Modern Rebuild + Mobile-App Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `frontend/` UI on HeroUI v2 with a lean-modern look and a native-app feel on mobile (bottom tab bar, slide-up sheets, page transitions), keeping the site's signature elements.

**Architecture:** HeroUI v2 + custom components coexist behind a Tailwind theme bridge; we migrate page-by-page so the app is shippable and tests stay green after every task. Shared `ui/*` wrappers re-export HeroUI under the existing import paths, so consuming pages need no churn when a primitive is swapped. Public pages get the full lean-modern treatment; admin gets a lighter version; the bottom tab bar is mobile-only.

**Tech Stack:** React 18.3, Vite 6, Tailwind 3.4, HeroUI v2 (`@heroui/react`), framer-motion (HeroUI peer) alongside existing `motion@12`, react-router 6, react-hook-form + zod, @tanstack/react-query, vitest + Testing Library.

## Global Constraints

- React stays **18.3**, Tailwind stays **3.4** — do NOT upgrade to React 19 / Tailwind 4 / HeroUI v3.
- `darkMode: 'class'` is preserved; light theme is the `:root` default, `.dark` overrides (driven by existing `ThemeContext`). Do not add a second theme system.
- Existing CSS-var tokens (`--bg/--panel/--surface/--border/--ink/--muted/--accent`) and Tailwind color tokens remain available throughout the migration.
- Brand primary violet: **`#6354E0`** (light) / **`#7C6CF2`** (dark). Foreground on primary: white.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (mono/eyebrow) — already loaded in `index.html`.
- Bottom tab bar is **mobile-only** (`md:hidden`); desktop keeps the top nav. Admin does **not** use the tab bar.
- Honor `prefers-reduced-motion` for all new motion (already wired via `MotionConfig reducedMotion="user"` and the `index.css` reduced-motion block).
- `npm run test` (vitest) must be green at the end of every task. Run from `frontend/`.
- Never `git add -A`; stage only the files a task touches.
- All `ui/*` wrapper swaps must preserve the existing public prop contract so consumers (and their tests) keep working without edits.

---

## File Structure

**Phase 0 — Foundation**
- Modify `frontend/package.json` — add `@heroui/react`, `framer-motion`.
- Modify `frontend/tailwind.config.js` — add `heroui()` plugin + content glob + theme bridge.
- Modify `frontend/src/main.jsx` — wrap in `HeroUIProvider` + `ToastProvider`.
- Modify `frontend/src/test/renderWithProviders.jsx` — wrap test tree in `HeroUIProvider`.
- Modify `frontend/src/styles/index.css` — add `.glass`, `.soft-card`, gradient/glow utilities + safe-area helpers.
- Create `frontend/tests/unit/heroui.foundation.test.jsx` — provider/theme smoke.

**Phase 1 — App shell + navigation**
- Create `frontend/src/components/layout/BottomTabBar.jsx` — mobile bottom nav.
- Create `frontend/src/components/layout/BottomSheet.jsx` — reusable HeroUI Drawer (bottom) wrapper.
- Create `frontend/src/components/layout/PageTransition.jsx` — AnimatePresence route wrapper.
- Modify `frontend/src/components/layout/Navbar.jsx` — glass desktop nav + condensed mobile header (remove hamburger menu).
- Modify `frontend/src/layouts/PublicLayout.jsx` — mount BottomTabBar + PageTransition + safe-area padding.
- Create tests under `frontend/tests/unit/` and `frontend/tests/integration/`.

**Phase 2 — Shared primitives → HeroUI**
- Modify `frontend/src/components/ui/{Button,Card,Input,Textarea,Chip,Spinner}.jsx` — re-implement as HeroUI wrappers, same exports.
- Create `frontend/src/components/ui/Skeleton.jsx` — HeroUI Skeleton wrapper.
- Update affected tests.

**Phase 3 — Public reskin** — `pages/public/{Home,Projects,ProjectDetail,Contact,About,NotFound}.jsx` and the feature components they use (`ProjectGrid`, `ProjectCard`, `MediaGallery`, `Lightbox`).

**Phase 4 — Admin reskin (lighter)** — `pages/admin/*` + `layouts/AdminLayout.jsx`.

**Phase 5 — Polish** — toasts, skeletons sweep, a11y pass, bundle check, reduced-motion QA.

---

# Phase 0 — Foundation

### Task 1: Install HeroUI + Tailwind plugin + theme bridge

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/tailwind.config.js`
- Test: existing suite is the regression guard (no new test yet)

**Interfaces:**
- Produces: a working `heroui()` Tailwind plugin with `light`/`dark` themes mapped to brand palette; HeroUI classes survive purge.

- [ ] **Step 1: Install dependencies**

Run (from `frontend/`):
```bash
npm install @heroui/react framer-motion
```
Expected: installs without peer-dependency errors. `@heroui/react` and `framer-motion` appear under `dependencies`.

- [ ] **Step 2: Wire the plugin + theme bridge into `tailwind.config.js`**

Replace the file with (keeps every existing token, adds HeroUI):
```js
/** @type {import('tailwindcss').Config} */
import { heroui } from '@heroui/react';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        teal: '#34d3c6',
        amber: '#f3b95f',
        danger: '#fb7185'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: { eyebrow: '0.22em' },
      boxShadow: {
        soft: '0 20px 70px rgba(0, 0, 0, 0.28)',
        glow: '0 0 0 1px rgba(124, 108, 242, 0.25), 0 24px 80px rgba(124, 108, 242, 0.12)'
      },
      backgroundImage: {
        'grid-faint':
          'radial-gradient(circle at 1px 1px, rgba(124,108,242,0.10) 1px, transparent 0)'
      }
    }
  },
  plugins: [
    heroui({
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            background: '#F8F7F4',
            foreground: '#16141C',
            focus: '#6354E0',
            primary: { DEFAULT: '#6354E0', foreground: '#FFFFFF' }
          }
        },
        dark: {
          colors: {
            background: '#08090D',
            foreground: '#F4F1EA',
            focus: '#7C6CF2',
            primary: { DEFAULT: '#7C6CF2', foreground: '#FFFFFF' }
          }
        }
      },
      layout: {
        radius: { small: '8px', medium: '12px', large: '20px' }
      }
    })
  ]
};
```

- [ ] **Step 3: Run the existing suite (regression guard)**

Run: `npm run test`
Expected: PASS — same green result as before; no config error, no purge of existing classes.

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.js
git commit -m "feat(ui): add HeroUI v2 plugin + brand theme bridge"
```

---

### Task 2: Mount HeroUIProvider in app + test harness

**Files:**
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/test/renderWithProviders.jsx`
- Test: `frontend/tests/unit/heroui.foundation.test.jsx` (create)

**Interfaces:**
- Consumes: theme bridge from Task 1.
- Produces: `HeroUIProvider` available app-wide (overlays portal + react-router `navigate`) and in tests, so HeroUI components — including Modal/Drawer — mount correctly under test.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/heroui.foundation.test.jsx`:
```jsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Button } from '@heroui/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('HeroUI foundation', () => {
  it('renders a HeroUI Button inside the provider', () => {
    renderWithProviders(<Button>Press</Button>);
    expect(screen.getByRole('button', { name: 'Press' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- heroui.foundation`
Expected: FAIL — HeroUI Button needs the provider context the harness does not yet supply (or overlay/portal warning).

- [ ] **Step 3: Add HeroUIProvider to the test harness**

In `frontend/src/test/renderWithProviders.jsx`, import and wrap:
```jsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider } from '@heroui/react';
import { MemoryRouter } from 'react-router-dom';
import { createQueryClient } from '../app/queryClient.js';

export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = createQueryClient();
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <HeroUIProvider>{ui}</HeroUIProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { ...result, user, queryClient };
}
```

- [ ] **Step 4: Add HeroUIProvider + ToastProvider to `main.jsx`**

Wrap `<App />` so routing and overlays work in production:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter, useNavigate, useHref } from 'react-router-dom';
import App from './app/App.jsx';
import { createQueryClient } from './app/queryClient.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles/index.css';

const queryClient = createQueryClient();

function HeroProviders({ children }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider placement="top-center" />
      {children}
    </HeroUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <MotionConfig reducedMotion="user">
              <HeroProviders>
                <App />
              </HeroProviders>
            </MotionConfig>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```
Note: `HeroProviders` is a child of `BrowserRouter` so `useNavigate` is valid.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- heroui.foundation`
Expected: PASS.

- [ ] **Step 6: Run full suite (regression guard)**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/main.jsx frontend/src/test/renderWithProviders.jsx frontend/tests/unit/heroui.foundation.test.jsx
git commit -m "feat(ui): mount HeroUIProvider + ToastProvider in app and test harness"
```

---

### Task 3: Modern surface utilities + safe-area helpers

**Files:**
- Modify: `frontend/src/styles/index.css`
- Test: `frontend/tests/unit/heroui.foundation.test.jsx` (extend)

**Interfaces:**
- Produces: utility classes `.glass`, `.soft-card`, `.gradient-primary`, `.tap-target`, and `.pb-safe`/`.pt-safe` for use by the shell and pages.

- [ ] **Step 1: Write the failing test (utility presence via computed class)**

Append to `frontend/tests/unit/heroui.foundation.test.jsx`:
```jsx
it('exposes a glass surface utility', () => {
  const { container } = renderWithProviders(<div className="glass" data-testid="g" />);
  const el = container.querySelector('[data-testid="g"]');
  // jsdom does not apply Tailwind layers; assert the class is retained on the node.
  expect(el).toHaveClass('glass');
});
```
(Behavioral guard only — visual correctness is verified by `/run` later. The real deliverable is the CSS.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- heroui.foundation`
Expected: FAIL only if the import/markup is wrong; otherwise it passes trivially — proceed to add the CSS regardless. (This step's value is forcing the CSS to exist before Phase 1 consumes it.)

- [ ] **Step 3: Add the utilities to `styles/index.css`**

Insert after the `::selection` rule, before the view-transition block:
```css
/* ── Modern surface kit (HeroUI lean-modern) ─────────────────────────────── */
@layer components {
  .glass {
    @apply border border-border/60 bg-panel/60 backdrop-blur-xl;
  }
  .soft-card {
    @apply rounded-2xl border border-border bg-panel shadow-soft;
  }
  .gradient-primary {
    background-image: linear-gradient(135deg, rgb(var(--accent)) 0%, #8b5cf6 100%);
  }
  .tap-target {
    @apply min-h-11 min-w-11;
  }
}

/* Safe-area insets for the mobile app shell. */
.pb-safe {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 0px);
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test -- heroui.foundation`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/index.css frontend/tests/unit/heroui.foundation.test.jsx
git commit -m "feat(ui): add glass/soft-card/gradient/safe-area utilities"
```

---

# Phase 1 — App shell + navigation

### Task 4: BottomTabBar (mobile-only)

**Files:**
- Create: `frontend/src/components/layout/BottomTabBar.jsx`
- Test: `frontend/tests/unit/bottomTabBar.test.jsx`

**Interfaces:**
- Produces: `<BottomTabBar />` — fixed bottom nav, `md:hidden`, 4 links (Home `/`, Projects `/projects`, About `/about`, Contact `/contact`), active link marked `aria-current="page"`, animated active pill via framer-motion `layoutId="tab-active"`, safe-area padding.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/bottomTabBar.test.jsx`:
```jsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { BottomTabBar } from '../../src/components/layout/BottomTabBar.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('BottomTabBar', () => {
  it('renders the four primary tabs', () => {
    renderWithProviders(<BottomTabBar />, { route: '/' });
    ['Home', 'Projects', 'About', 'Contact'].forEach((label) =>
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    );
  });

  it('marks the active route', () => {
    renderWithProviders(<BottomTabBar />, { route: '/projects' });
    const active = screen.getByRole('link', { name: /Projects/i });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('is hidden on desktop via md:hidden', () => {
    const { container } = renderWithProviders(<BottomTabBar />, { route: '/' });
    expect(container.querySelector('nav')).toHaveClass('md:hidden');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- bottomTabBar`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `BottomTabBar.jsx`**

```jsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- bottomTabBar`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/BottomTabBar.jsx frontend/tests/unit/bottomTabBar.test.jsx
git commit -m "feat(nav): mobile bottom tab bar"
```

---

### Task 5: BottomSheet (reusable HeroUI Drawer wrapper)

**Files:**
- Create: `frontend/src/components/layout/BottomSheet.jsx`
- Test: `frontend/tests/integration/bottomSheet.test.jsx`

**Interfaces:**
- Produces: `<BottomSheet isOpen onOpenChange title>{children}</BottomSheet>` — wraps HeroUI `Drawer` with `placement="bottom"`, a drag-handle affordation, rounded top, glass surface. Used by Projects filters, lightbox, and admin Messages.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/integration/bottomSheet.test.jsx`:
```jsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { BottomSheet } from '../../src/components/layout/BottomSheet.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('BottomSheet', () => {
  it('renders children and title when open', () => {
    renderWithProviders(
      <BottomSheet isOpen onOpenChange={() => {}} title="Filters">
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Sheet body')).toBeInTheDocument();
  });

  it('renders nothing visible when closed', () => {
    renderWithProviders(
      <BottomSheet isOpen={false} onOpenChange={() => {}} title="Filters">
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(screen.queryByText('Sheet body')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- bottomSheet`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `BottomSheet.jsx`**

```jsx
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@heroui/react';

export function BottomSheet({ isOpen, onOpenChange, title, children }) {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom"
      hideCloseButton
      classNames={{
        base: 'glass rounded-t-3xl max-h-[85vh]',
        wrapper: 'items-end'
      }}
    >
      <DrawerContent className="pb-safe">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted/40" aria-hidden="true" />
        {title ? <DrawerHeader className="font-display text-lg">{title}</DrawerHeader> : null}
        <DrawerBody>{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- bottomSheet`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/BottomSheet.jsx frontend/tests/integration/bottomSheet.test.jsx
git commit -m "feat(ui): reusable bottom-sheet drawer wrapper"
```

---

### Task 6: PageTransition wrapper

**Files:**
- Create: `frontend/src/components/layout/PageTransition.jsx`
- Test: `frontend/tests/unit/pageTransition.test.jsx`

**Interfaces:**
- Consumes: `useLocation()` for the transition key.
- Produces: `<PageTransition>{children}</PageTransition>` — wraps content in `AnimatePresence mode="wait"` + a `motion.div` keyed by pathname (slide-up + fade in, fade out). `MotionConfig reducedMotion="user"` (already in `main.jsx`) makes it instant under reduced motion.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/pageTransition.test.jsx`:
```jsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { PageTransition } from '../../src/components/layout/PageTransition.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('PageTransition', () => {
  it('renders its children', () => {
    renderWithProviders(
      <PageTransition>
        <h1>Routed content</h1>
      </PageTransition>
    );
    expect(screen.getByText('Routed content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- pageTransition`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `PageTransition.jsx`**

```jsx
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

export function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- pageTransition`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/PageTransition.jsx frontend/tests/unit/pageTransition.test.jsx
git commit -m "feat(nav): animated route page transitions"
```

---

### Task 7: Glass Navbar + condensed mobile header

**Files:**
- Modify: `frontend/src/components/layout/Navbar.jsx`
- Test: `frontend/tests/integration/navbar.test.jsx` (update existing)

**Interfaces:**
- Consumes: nothing new.
- Produces: desktop = glass pill nav (existing behavior, restyled with `.glass`); mobile = condensed header with logo + ThemeToggle + Resume only. The hamburger button and mobile dropdown menu are **removed** (the BottomTabBar now owns mobile navigation). Keep the Ctrl+Shift+A admin shortcut.

- [ ] **Step 1: Read the existing navbar test**

Run: `npm run test -- navbar`
Expected: PASS currently. Note which assertions reference the hamburger/mobile menu (`aria-label="Open navigation"`, mobile `NavLink`s) — those move/are removed.

- [ ] **Step 2: Update the test to the new contract**

Edit `frontend/tests/integration/navbar.test.jsx` so it asserts:
- the desktop nav links still render (Home/Projects/About/Contact),
- the logo links to `/`,
- there is **no** button named `/Open navigation/i`.

Replace any hamburger-open assertions with:
```jsx
it('no longer renders a hamburger menu button (tab bar owns mobile nav)', () => {
  renderWithProviders(<Navbar />, { route: '/' });
  expect(screen.queryByRole('button', { name: /open navigation/i })).not.toBeInTheDocument();
});
```
Keep existing import style and any API mocks already in the file.

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- navbar`
Expected: FAIL — old hamburger assertion / new assertion mismatch against current Navbar.

- [ ] **Step 4: Reimplement `Navbar.jsx`**

Keep `HexMark`, the profile/resume hook, and the Ctrl+Shift+A effect. Replace the returned markup so:
- `<header>` uses `glass` + `sticky top-0 z-40`.
- Desktop nav (`hidden md:flex`) keeps the pill links with the `layoutId="nav-active"` indicator (unchanged logic).
- Remove `open` state, the hamburger `<button>`, the `AnimatePresence` mobile `<motion.nav>`, and the `Menu`/`X` imports.
- Right cluster stays: `<ThemeToggle />` + Resume link (`hidden sm:inline-flex` → on mobile the Resume link becomes `inline-flex` since there is no menu; show it compact).

Resulting header body:
```jsx
return (
  <header className="glass pt-safe sticky top-0 z-40">
    <Container className="flex h-16 items-center justify-between gap-4">
      <Link to="/" className="inline-flex items-center gap-2 lowercase tracking-tight">
        <HexMark />
        <span className="font-display text-[15px] font-semibold text-ink">hamza munawar</span>
      </Link>

      <nav
        aria-label="Primary"
        className="hidden items-center gap-1 rounded-full border border-border bg-panel/70 px-1.5 py-1.5 md:flex"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-surface shadow-soft"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border bg-ink px-4 py-1.5 text-sm font-semibold text-bg transition hover:bg-white"
          >
            Resume
          </a>
        ) : null}
      </div>
    </Container>
  </header>
);
```
Delete the now-unused `useState`, `useEffect` (for `open`), `AnimatePresence`, `Menu`, `X` imports; keep the `useEffect` for the admin shortcut and the `useEffect` that closed the menu on route change can be removed.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- navbar`
Expected: PASS.

- [ ] **Step 6: Run full suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout/Navbar.jsx frontend/tests/integration/navbar.test.jsx
git commit -m "feat(nav): glass navbar, drop hamburger (tab bar owns mobile nav)"
```

---

### Task 8: Mount shell in PublicLayout

**Files:**
- Modify: `frontend/src/layouts/PublicLayout.jsx`
- Test: `frontend/tests/integration/publicLayout.shell.test.jsx` (create)

**Interfaces:**
- Consumes: `BottomTabBar` (Task 4), `PageTransition` (Task 6).
- Produces: public layout renders Navbar + transitioned Outlet + Footer + BottomTabBar, with bottom padding (`pb-24 md:pb-0`) so content clears the tab bar on mobile.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/integration/publicLayout.shell.test.jsx`:
```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'HM', headline: 'Dev', stats: [], resumeUrl: null }),
  updateProfile: vi.fn()
}));

const { PublicLayout } = await import('../../src/layouts/PublicLayout.jsx');

describe('PublicLayout shell', () => {
  it('renders the bottom tab bar alongside routed content', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<h1>Home page</h1>} />
        </Route>
      </Routes>,
      { route: '/' }
    );
    expect(screen.getByText('Home page')).toBeInTheDocument();
    // Two primary navs exist: desktop header nav + bottom tab bar.
    expect(screen.getAllByRole('navigation', { name: /primary/i }).length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- publicLayout.shell`
Expected: FAIL — only one primary nav (no tab bar yet).

- [ ] **Step 3: Reimplement `PublicLayout.jsx`**

```jsx
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { BottomTabBar } from '../components/layout/BottomTabBar.jsx';
import { PageTransition } from '../components/layout/PageTransition.jsx';

export function PublicLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
        <ErrorBoundary key={location.pathname}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- publicLayout.shell`
Expected: PASS.

- [ ] **Step 5: Run full suite + visual check**

Run: `npm run test`
Expected: PASS. Then `npm run dev` and confirm on a narrow viewport: bottom tab bar visible, content not hidden behind it, route changes animate. (Use the `/run` skill to drive this.)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/layouts/PublicLayout.jsx frontend/tests/integration/publicLayout.shell.test.jsx
git commit -m "feat(nav): mount tab bar + page transitions in public layout"
```

---

# Phase 2 — Shared primitives → HeroUI

Each task re-implements a `ui/*` file as a thin HeroUI wrapper that **keeps the existing exported prop contract**, so every consumer and its tests keep working unedited. The existing `tests/unit/ui.test.jsx` is the contract guard — run it after each swap.

### Task 9: Button → HeroUI wrapper

**Files:**
- Modify: `frontend/src/components/ui/Button.jsx`
- Test: `frontend/tests/unit/ui.test.jsx` (run; extend if needed)

**Interfaces:**
- Produces: `Button({ as, variant: 'primary'|'outline'|'ghost'|'danger', className, type, ...props })` — same signature as today. `variant` maps to HeroUI; `as={Link}` still routes; `disabled` still works. Primary uses the gradient look.

- [ ] **Step 1: Add/confirm a contract test**

In `frontend/tests/unit/ui.test.jsx` ensure these exist (add any missing):
```jsx
it('Button renders as a link when as={Link}', () => {
  renderWithProviders(<Button as={Link} to="/projects">Go</Button>);
  const link = screen.getByRole('link', { name: 'Go' });
  expect(link).toHaveAttribute('href', '/projects');
});

it('Button submit type works', () => {
  renderWithProviders(<Button type="submit">Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
});
```
(Imports: `Button` from `../../src/components/ui/Button.jsx`, `Link` from `react-router-dom`, `renderWithProviders`.)

- [ ] **Step 2: Run to verify current behavior**

Run: `npm run test -- ui`
Expected: PASS against the current custom Button.

- [ ] **Step 3: Reimplement `Button.jsx` over HeroUI**

```jsx
import { Button as HeroButton } from '@heroui/react';

const variantProps = {
  primary: { color: 'primary', variant: 'solid', className: 'gradient-primary text-white shadow-glow' },
  outline: { variant: 'bordered', className: 'border-border text-ink data-[hover=true]:border-primary' },
  ghost: { variant: 'light', className: 'text-muted data-[hover=true]:text-ink' },
  danger: { color: 'danger', variant: 'solid', className: 'text-white' }
};

export function Button({ as, variant = 'primary', className = '', type, ...props }) {
  const v = variantProps[variant] ?? variantProps.primary;
  return (
    <HeroButton
      as={as}
      type={as ? type : type || 'button'}
      radius="full"
      className={`font-semibold ${v.className} ${className}`}
      color={v.color}
      variant={v.variant}
      {...props}
    />
  );
}
```
Note: HeroUI `Button` forwards `as`, `disabled`, `onClick`, and children. The gradient is applied via the `gradient-primary` utility so `color="primary"` keys ripples/focus to brand violet.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- ui`
Expected: PASS — same contract, new look.

- [ ] **Step 5: Run full suite (Button is widely consumed)**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/Button.jsx frontend/tests/unit/ui.test.jsx
git commit -m "refactor(ui): Button as HeroUI wrapper (gradient primary)"
```

---

### Task 10: Input + Textarea → HeroUI wrappers

**Files:**
- Modify: `frontend/src/components/ui/Input.jsx`, `frontend/src/components/ui/Textarea.jsx`
- Test: `frontend/tests/integration/contactForm.test.jsx` (run — it is the real consumer/contract)

**Interfaces:**
- Produces: `forwardRef` `Input`/`Textarea` with the SAME props (`id, label, error, className, ...register`). `error` maps to HeroUI `isInvalid` + `errorMessage`; `label` uses HeroUI's built-in label; ref still points to the native input/textarea so react-hook-form `register` keeps working.

- [ ] **Step 1: Run the consumer test to capture current behavior**

Run: `npm run test -- contactForm`
Expected: PASS. Note assertions on label text and the `role="alert"` error message — HeroUI renders errors in an element; confirm the test queries by text, not by a brittle structure. If it queries `role="alert"`, keep that working (see Step 3).

- [ ] **Step 2: Reimplement `Input.jsx`**

```jsx
import { forwardRef } from 'react';
import { Input as HeroInput } from '@heroui/react';

export const Input = forwardRef(function Input({ id, label, error, className = '', ...props }, ref) {
  return (
    <HeroInput
      id={id}
      ref={ref}
      label={label}
      labelPlacement="outside"
      variant="bordered"
      radius="lg"
      isInvalid={Boolean(error)}
      errorMessage={error}
      classNames={{ errorMessage: 'text-danger', inputWrapper: 'bg-panel border-border' }}
      className={className}
      {...props}
    />
  );
});
```

- [ ] **Step 3: Reimplement `Textarea.jsx`**

```jsx
import { forwardRef } from 'react';
import { Textarea as HeroTextarea } from '@heroui/react';

export const Textarea = forwardRef(function Textarea({ id, label, error, className = '', ...props }, ref) {
  return (
    <HeroTextarea
      id={id}
      ref={ref}
      label={label}
      labelPlacement="outside"
      variant="bordered"
      radius="lg"
      minRows={5}
      isInvalid={Boolean(error)}
      errorMessage={error}
      classNames={{ errorMessage: 'text-danger', inputWrapper: 'bg-panel border-border' }}
      className={className}
      {...props}
    />
  );
});
```

- [ ] **Step 4: Run the consumer test**

Run: `npm run test -- contactForm`
Expected: PASS. If an assertion relied on `role="alert"` for the error, update it to query the error text (HeroUI exposes `errorMessage` text; it is associated via `aria-describedby`). Adjust the test to `expect(screen.getByText('Name is required')).toBeVisible()` and keep validation behavior.

- [ ] **Step 5: Run full suite**

Run: `npm run test`
Expected: PASS (also covers admin forms that use these inputs).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/Input.jsx frontend/src/components/ui/Textarea.jsx frontend/tests/integration/contactForm.test.jsx
git commit -m "refactor(ui): Input/Textarea as HeroUI wrappers (RHF-compatible)"
```

---

### Task 11: Card, Chip, Spinner → HeroUI + new Skeleton

**Files:**
- Modify: `frontend/src/components/ui/Card.jsx`, `Chip.jsx`, `Spinner.jsx`
- Create: `frontend/src/components/ui/Skeleton.jsx`
- Test: `frontend/tests/unit/ui.test.jsx` (extend)

**Interfaces:**
- Produces:
  - `Card({ children, className })` — HeroUI `Card` + `.soft-card`, same signature.
  - `Chip({ children, className })` — HeroUI `Chip`, same signature.
  - `Spinner({ label })` — keeps `role="status"` + `aria-label`.
  - `Skeleton({ className })` — HeroUI `Skeleton` for content loads.

- [ ] **Step 1: Add contract tests**

Append to `frontend/tests/unit/ui.test.jsx`:
```jsx
it('Card renders children', () => {
  renderWithProviders(<Card><span>inside</span></Card>);
  expect(screen.getByText('inside')).toBeInTheDocument();
});
it('Spinner exposes a status role with label', () => {
  renderWithProviders(<Spinner label="Loading projects" />);
  expect(screen.getByRole('status', { name: 'Loading projects' })).toBeInTheDocument();
});
```
(Import `Card`, `Spinner` from their `ui/*` paths.)

- [ ] **Step 2: Run to verify current behavior**

Run: `npm run test -- ui`
Expected: PASS.

- [ ] **Step 3: Reimplement the three + add Skeleton**

`Card.jsx`:
```jsx
import { Card as HeroCard } from '@heroui/react';

export function Card({ children, className = '' }) {
  return (
    <HeroCard shadow="none" radius="lg" className={`soft-card ${className}`}>
      {children}
    </HeroCard>
  );
}
```
`Chip.jsx`:
```jsx
import { Chip as HeroChip } from '@heroui/react';

export function Chip({ children, className = '' }) {
  return (
    <HeroChip
      variant="bordered"
      radius="full"
      className={`border-border bg-surface font-mono text-[11px] text-muted ${className}`}
    >
      {children}
    </HeroChip>
  );
}
```
`Spinner.jsx` (keep status semantics, use HeroUI spinner visual):
```jsx
import { Spinner as HeroSpinner } from '@heroui/react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center p-8">
      <HeroSpinner color="primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
```
`Skeleton.jsx` (new):
```jsx
import { Skeleton as HeroSkeleton } from '@heroui/react';

export function Skeleton({ className = '' }) {
  return <HeroSkeleton className={`rounded-2xl ${className}`} />;
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test -- ui`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/Card.jsx frontend/src/components/ui/Chip.jsx frontend/src/components/ui/Spinner.jsx frontend/src/components/ui/Skeleton.jsx frontend/tests/unit/ui.test.jsx
git commit -m "refactor(ui): Card/Chip/Spinner as HeroUI wrappers + Skeleton"
```

---

# Phase 3 — Public reskin

These tasks restyle pages onto the modern surfaces and add the mobile-app interactions. The `ui/*` swaps from Phase 2 mean most visual change is class-level; the testable deliverables are the new structural behaviors (skeleton loading, filter sheet, sheet lightbox). Apply the per-portion styling from the spec (§6). Visual correctness is confirmed with `/run` per task.

### Task 12: Home reskin

**Files:**
- Modify: `frontend/src/pages/public/Home.jsx`
- Test: `frontend/tests/integration/home.skeleton.test.jsx` (create)

**Interfaces:**
- Consumes: `Skeleton`, `Card`, `Button` wrappers.
- Produces: featured-projects loading shows `Skeleton` cards (not the bare spinner); stat + capability blocks sit on `soft-card`/`glass` surfaces; primary CTAs use gradient Button. 3D hero unchanged.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/integration/home.skeleton.test.jsx`:
```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn(() => new Promise(() => {})), // never resolves → loading state
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn()
}));
vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ headline: 'Dev', stats: [] }),
  updateProfile: vi.fn()
}));

const Home = (await import('../../src/pages/public/Home.jsx')).default;

describe('Home loading state', () => {
  it('shows skeletons while featured projects load', () => {
    const { container } = renderWithProviders(<Home />, { route: '/' });
    expect(container.querySelectorAll('[data-skeleton], .animate-pulse').length).toBeGreaterThan(0);
  });
});
```
(HeroUI Skeleton renders an element with `data-slot` and an animated class; assert on the rendered skeleton wrapper. If the selector differs, query the wrapper `div` you add with `data-testid="featured-skeleton"`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- home.skeleton`
Expected: FAIL — Home currently renders `Spinner`, not skeletons.

- [ ] **Step 3: Implement the loading + surface changes**

In `Home.jsx`:
- Import `Skeleton` from `../../components/ui/Skeleton.jsx`.
- Replace the `projectsQuery.isLoading` branch:
```jsx
{projectsQuery.isLoading && !projectsQuery.data ? (
  <div data-testid="featured-skeleton" className="grid gap-5 md:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} className="h-64 w-full" />
    ))}
  </div>
) : (
  <ProjectGrid projects={featured} />
)}
```
- Wrap the "How I work" capability cards in the `Card` wrapper (replace the raw `rounded-2xl border ...` div with `<Card className="group p-6 ...">`), keeping hover glow via `hover:shadow-glow`.
- Change the two hero CTAs to rely on the new gradient `Button` (no markup change needed — they already use `ui/Button`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- home.skeleton`
Expected: PASS.

- [ ] **Step 5: Run full suite + visual check**

Run: `npm run test` → PASS. Then `/run` and eyeball Home (light + dark, mobile + desktop).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/public/Home.jsx frontend/tests/integration/home.skeleton.test.jsx
git commit -m "feat(home): modern surfaces + skeleton loading"
```

---

### Task 13: Projects — card grid + mobile filter sheet + skeleton

**Files:**
- Modify: `frontend/src/pages/public/Projects.jsx`
- Modify: `frontend/src/features/projects/components/ProjectGrid.jsx`, `ProjectCard.jsx` (surface restyle only)
- Test: `frontend/tests/integration/projects.filterSheet.test.jsx` (create)

**Interfaces:**
- Consumes: `BottomSheet`, `Chip`, `Skeleton`.
- Produces: desktop shows filter chips inline; mobile shows a "Filters" button that opens a `BottomSheet` containing the same chips; loading shows a `Skeleton` grid.

- [ ] **Step 1: Read the current Projects page**

Run: open `frontend/src/pages/public/Projects.jsx` and note how filters/categories and loading are currently rendered (it consumes `useProjects` + `ProjectGrid`). Preserve the existing filter state/logic; only change presentation + add the sheet.

- [ ] **Step 2: Write the failing test**

Create `frontend/tests/integration/projects.filterSheet.test.jsx`:
```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { id: '1', slug: 'a', title: 'Alpha', summary: 's', tags: ['web'], featured: false, cover: null }
  ]),
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn()
}));

const Projects = (await import('../../src/pages/public/Projects.jsx')).default;

describe('Projects mobile filter sheet', () => {
  it('opens a bottom sheet of filters from the Filters button', async () => {
    const { user } = renderWithProviders(<Projects />, { route: '/projects' });
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: /filters/i }));
    expect(await screen.findByText(/filter projects/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- projects.filterSheet`
Expected: FAIL — no Filters button / sheet yet.

- [ ] **Step 4: Implement**

In `Projects.jsx`:
- Add `const [filtersOpen, setFiltersOpen] = useState(false);`
- Keep existing chip/filter UI for `md:` and up. Add a mobile-only trigger:
```jsx
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { BottomSheet } from '../../components/layout/BottomSheet.jsx';
// ...
<div className="md:hidden">
  <Button variant="outline" onClick={() => setFiltersOpen(true)}>
    <SlidersHorizontal size={16} /> Filters
  </Button>
</div>
<BottomSheet isOpen={filtersOpen} onOpenChange={setFiltersOpen} title="Filter projects">
  {/* render the SAME filter controls used on desktop */}
</BottomSheet>
```
- Replace any loading spinner with a `Skeleton` grid (same shape as Task 12).
- Restyle `ProjectGrid`/`ProjectCard` containers to `soft-card` + hover glow (class-only).

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- projects.filterSheet`
Expected: PASS.

- [ ] **Step 6: Run full suite + visual check**

Run: `npm run test` → PASS. `/run`: confirm chips on desktop, sheet on mobile.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/public/Projects.jsx frontend/src/features/projects/components/ProjectGrid.jsx frontend/src/features/projects/components/ProjectCard.jsx frontend/tests/integration/projects.filterSheet.test.jsx
git commit -m "feat(projects): card grid, mobile filter sheet, skeletons"
```

---

### Task 14: ProjectDetail — sheet lightbox + sticky CTA

**Files:**
- Modify: `frontend/src/features/projects/components/Lightbox.jsx`, `MediaGallery.jsx`
- Modify: `frontend/src/pages/public/ProjectDetail.jsx`
- Test: `frontend/tests/unit/lightbox.test.jsx` (update)

**Interfaces:**
- Consumes: `BottomSheet`/HeroUI `Modal`.
- Produces: on mobile, opening a gallery item presents a full-screen sheet lightbox (drag-to-dismiss handle); desktop keeps the modal/overlay. Existing keyboard/escape behavior preserved. A sticky bottom CTA ("View live"/"Repo") on mobile.

- [ ] **Step 1: Read existing Lightbox + its test**

Run: `npm run test -- lightbox` → PASS currently. Note the open/close and keyboard assertions; they must keep passing (HeroUI overlay supports Escape + focus trap natively).

- [ ] **Step 2: Update the test for the sheet presentation**

Keep behavior assertions (opens on click, closes on Escape, shows the image `alt`). If the test asserts a specific class/DOM, relax it to role/label queries (`getByRole('dialog')`). Add:
```jsx
it('renders the active media inside a dialog', async () => {
  // ...open the lightbox as the existing test does...
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test -- lightbox`
Expected: FAIL on the new `dialog` assertion (current lightbox may not expose `role="dialog"`).

- [ ] **Step 4: Reimplement Lightbox over HeroUI**

Replace the custom overlay with HeroUI `Modal` (desktop) / full-screen `Drawer` (mobile via `placement="bottom"` + `size="full"` under `md`), preserving: `images`, `index`, `onClose`, next/prev, and `alt` text. Use HeroUI's built-in focus trap + Escape (remove the manual key handler if HeroUI covers it; keep arrow-key next/prev). Add the drag handle from `BottomSheet` styling on mobile.

- [ ] **Step 5: Add the sticky mobile CTA in `ProjectDetail.jsx`**

```jsx
<div className="glass pb-safe fixed inset-x-0 bottom-16 z-30 flex gap-2 p-3 md:hidden">
  {project.liveUrl ? <Button as="a" href={project.liveUrl} className="flex-1">View live</Button> : null}
  {project.repoUrl ? <Button as="a" href={project.repoUrl} variant="outline" className="flex-1">Repo</Button> : null}
</div>
```
(`bottom-16` clears the tab bar. Only render links that exist — respects the existing NDA/private flags.)

- [ ] **Step 6: Run tests**

Run: `npm run test -- lightbox` then `npm run test -- projectDetail`
Expected: PASS (including the existing `projectDetail.private` and `projectDetail.video` tests).

- [ ] **Step 7: Run full suite + visual check**

Run: `npm run test` → PASS. `/run`: open a project on mobile, confirm sheet lightbox + sticky CTA.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/projects/components/Lightbox.jsx frontend/src/features/projects/components/MediaGallery.jsx frontend/src/pages/public/ProjectDetail.jsx frontend/tests/unit/lightbox.test.jsx
git commit -m "feat(project-detail): sheet lightbox + sticky mobile CTA"
```

---

### Task 15: Contact — HeroUI form + success toast

**Files:**
- Modify: `frontend/src/features/contact/components/ContactForm.jsx`
- Test: `frontend/tests/integration/contactForm.test.jsx` (extend)

**Interfaces:**
- Consumes: HeroUI `addToast` (via `@heroui/react`), the already-migrated `Input`/`Textarea`/`Button`.
- Produces: on successful submit, a success `Toast` fires (in addition to / replacing the inline "Message sent." banner); validation + submit logic unchanged.

- [ ] **Step 1: Extend the test**

Add to `frontend/tests/integration/contactForm.test.jsx` (keep existing validation tests):
```jsx
it('shows a success toast after submit', async () => {
  // existing setup mocks useSubmitContact to resolve
  const { user } = renderWithProviders(<ContactForm />);
  await user.type(screen.getByLabelText(/name/i), 'Jane');
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/message/i), 'Hello there, this is a test.');
  await user.click(screen.getByRole('button', { name: /send message/i }));
  expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
});
```
(Toast renders into the `ToastProvider`. If the harness lacks the provider region, render `<><ToastProvider />[ContactForm]</>` in this test or rely on the inline banner text "Message sent." which the toast title should match.)

- [ ] **Step 2: Run to verify it fails (or passes via inline banner)**

Run: `npm run test -- contactForm`
Expected: the new assertion passes only once the success path surfaces "Message sent" reliably; wire the toast next.

- [ ] **Step 3: Fire the toast on success**

In `ContactForm.jsx`:
```jsx
import { addToast } from '@heroui/react';
// in onSubmit, after mutateAsync succeeds:
const onSubmit = async (values) => {
  await mutation.mutateAsync(values);
  addToast({ title: 'Message sent', description: 'Thanks — I will reply soon.', color: 'success' });
  reset();
};
```
Keep the inline error banner for the failure case.

- [ ] **Step 4: Run tests**

Run: `npm run test -- contactForm`
Expected: PASS.

- [ ] **Step 5: Run full suite + visual check**

Run: `npm run test` → PASS. `/run`: submit the form, confirm toast.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/contact/components/ContactForm.jsx frontend/tests/integration/contactForm.test.jsx
git commit -m "feat(contact): success toast on submit"
```

---

### Task 16: About + NotFound reskin

**Files:**
- Modify: `frontend/src/pages/public/About.jsx`, `frontend/src/pages/public/NotFound.jsx`
- Test: `frontend/tests/smoke.test.jsx` (run — covers route render)

**Interfaces:**
- Produces: About timeline/blocks on `soft-card`/`glass` surfaces; NotFound as a centered modern empty state with a gradient "Back home" Button. No logic change.

- [ ] **Step 1: Restyle About**

Wrap timeline/section blocks in `Card`/`.glass`; keep content and data hooks. No structural change.

- [ ] **Step 2: Restyle NotFound**

```jsx
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm tracking-eyebrow text-primary">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">That route does not exist. Let’s get you back.</p>
      <Button as={Link} to="/" className="mt-8">Back home</Button>
    </Container>
  );
}
```

- [ ] **Step 3: Run smoke + full suite**

Run: `npm run test`
Expected: PASS (smoke renders routes without crashing).

- [ ] **Step 4: Visual check + commit**

`/run`: eyeball About + a bad URL.
```bash
git add frontend/src/pages/public/About.jsx frontend/src/pages/public/NotFound.jsx
git commit -m "feat(public): reskin About + NotFound"
```

---

# Phase 4 — Admin reskin (lighter)

Admin uses the same HeroUI primitives but a **lighter** treatment: standard radii, minimal gradient/glow, a simple fade (no slide) transition, and a **drawer** for mobile nav (no bottom tab bar).

### Task 17: AdminLayout — sidebar + mobile drawer + light fade

**Files:**
- Modify: `frontend/src/layouts/AdminLayout.jsx`
- Test: `frontend/tests/integration/adminLayout.test.jsx` (create)

**Interfaces:**
- Produces: desktop persistent sidebar (links: Dashboard, Projects, Messages, Profile, Logout); mobile a top bar with a menu button opening a `Drawer` (`placement="left"`) holding the same links; content wrapped in a fade-only transition.

- [ ] **Step 1: Read current AdminLayout**

Open `frontend/src/layouts/AdminLayout.jsx`; preserve its existing links, auth/logout wiring, and `Outlet`.

- [ ] **Step 2: Write the failing test**

Create `frontend/tests/integration/adminLayout.test.jsx` — mock auth as logged-in (mirror the pattern in `profileAdmin.test.jsx`), render the layout at `/admin`, assert: sidebar links present on desktop; a menu button opens a `Drawer` with the nav links; NO element with `aria-label="Primary"` bottom tab bar.

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test -- adminLayout`
Expected: FAIL — no drawer/menu yet.

- [ ] **Step 4: Implement** the sidebar + mobile `Drawer` (`placement="left"`), light fade `PageTransition`-style wrapper (reuse `PageTransition`, or a local fade variant with no `y`). No tab bar import.

- [ ] **Step 5: Run tests** — `npm run test -- adminLayout` → PASS, then `npm run test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/layouts/AdminLayout.jsx frontend/tests/integration/adminLayout.test.jsx
git commit -m "feat(admin): sidebar + mobile drawer shell (lighter)"
```

---

### Task 18: Admin Login + Dashboard reskin

**Files:**
- Modify: `frontend/src/pages/admin/Login.jsx`, `frontend/src/pages/admin/Dashboard.jsx`
- Test: existing admin tests (run as guard)

**Interfaces:**
- Produces: Login as a centered `Card` + `Input` + `Button`; Dashboard stats as plain `Card`s. Auth logic unchanged.

- [ ] **Step 1:** Restyle Login into a centered `Card` (max-w-sm) with the migrated `Input`/`Button`; keep the existing submit + error handling.
- [ ] **Step 2:** Restyle Dashboard stat blocks as `Card`s (light, no glow).
- [ ] **Step 3:** Run `npm run test` → PASS.
- [ ] **Step 4:** `/run` to eyeball both. Commit:
```bash
git add frontend/src/pages/admin/Login.jsx frontend/src/pages/admin/Dashboard.jsx
git commit -m "feat(admin): reskin login + dashboard (lighter)"
```

---

### Task 19: Admin Messages — table (desktop) → card list + detail sheet (mobile)

**Files:**
- Modify: `frontend/src/pages/admin/Messages.jsx`
- Test: `frontend/tests/integration/messages.sheet.test.jsx` (create)

**Interfaces:**
- Consumes: HeroUI `Table` + `BottomSheet`.
- Produces: desktop renders a HeroUI `Table` of messages; mobile renders a card list where tapping a row opens the message body in a `BottomSheet`. Data hooks unchanged.

- [ ] **Step 1:** Read current `Messages.jsx`; note the messages query + read/unread handling. Preserve it.
- [ ] **Step 2: Write the failing test** — mock messages query to return one message; render; click the row; assert the body appears in a sheet (`findByText(messageBody)` after click).
- [ ] **Step 3:** Run `npm run test -- messages.sheet` → FAIL.
- [ ] **Step 4:** Implement HeroUI `Table` (desktop, `hidden md:block`) + mobile card list (`md:hidden`) where each card's tap sets the active message and opens `BottomSheet`.
- [ ] **Step 5:** Run `npm run test -- messages.sheet` → PASS, then `npm run test` → PASS.
- [ ] **Step 6: Commit**
```bash
git add frontend/src/pages/admin/Messages.jsx frontend/tests/integration/messages.sheet.test.jsx
git commit -m "feat(admin): messages table + mobile detail sheet"
```

---

### Task 20: Admin Projects list + editor + profile forms

**Files:**
- Modify: `frontend/src/pages/admin/ProjectsAdmin.jsx`, `frontend/src/pages/admin/ProjectEditor.jsx`, `frontend/src/pages/admin/ProfileAdmin.jsx`, `frontend/src/features/projects/components/ProjectForm.jsx`
- Test: existing `projectsAdmin.*`, `projectForm.*`, `profileAdmin` tests (run as guard)

**Interfaces:**
- Produces: ProjectsAdmin as table/cards with row actions in a HeroUI `Dropdown` (or sheet on mobile); editor + profile forms use HeroUI `Input`/`Select`/`Switch`/file upload with a sticky save bar. Reuse the existing manual sort-order field. All form submit/validation logic and the autocover/screenshot/video flows unchanged — these have tests that MUST stay green.

- [ ] **Step 1:** Run the existing guards: `npm run test -- projectForm` and `npm run test -- projectsAdmin` and `npm run test -- profileAdmin` → PASS. These pin the behavior you must not break.
- [ ] **Step 2:** Restyle `ProjectForm.jsx` controls to the migrated `Input`/`Textarea` + HeroUI `Select`/`Switch` where it currently uses native selects/checkboxes — keeping every `register`/field name and the manual sort-order field identical. Add a sticky save bar (`sticky bottom-0 glass`).
- [ ] **Step 3:** Restyle `ProjectsAdmin.jsx` to table/cards + `Dropdown` row actions, preserving the edit/delete/sort handlers.
- [ ] **Step 4:** Restyle `ProfileAdmin.jsx` form similarly.
- [ ] **Step 5:** Run each guard again, then full suite:
  `npm run test -- projectForm` → PASS; `npm run test -- projectsAdmin` → PASS; `npm run test -- profileAdmin` → PASS; `npm run test` → PASS.
  Fix selector drift in tests only where a control changed element type (e.g., native `<select>` → HeroUI `Select` button) — update the query, never the asserted behavior.
- [ ] **Step 6: Commit**
```bash
git add frontend/src/pages/admin/ProjectsAdmin.jsx frontend/src/pages/admin/ProjectEditor.jsx frontend/src/pages/admin/ProfileAdmin.jsx frontend/src/features/projects/components/ProjectForm.jsx frontend/tests
git commit -m "feat(admin): reskin projects list, editor, profile forms (lighter)"
```

---

# Phase 5 — Polish

### Task 21: Skeleton sweep + reduced-motion + a11y + bundle check

**Files:**
- Modify: any remaining pages still using bare `Spinner` for content loads (swap to `Skeleton` where it improves perceived performance).
- Test: `frontend/tests/` full suite + manual checks.

**Interfaces:**
- Produces: consistent loading states, verified reduced-motion, accessible overlays/nav, and a known bundle size.

- [ ] **Step 1: Reduced-motion check**

In OS/browser, enable "reduce motion". `/run` the app: page transitions, tab indicator, and sheets must become instant/non-animated (driven by `MotionConfig reducedMotion="user"` + the `index.css` block). Fix any motion that ignores it.

- [ ] **Step 2: A11y pass**

Keyboard-only walk: Tab through nav, open/close a sheet (Escape closes, focus returns to trigger), submit Contact (errors announced). HeroUI/React Aria provides this; verify nothing custom broke it. Confirm bottom tab bar links have accessible names and `aria-current` on the active tab.

- [ ] **Step 3: Bundle check**

Run: `npm run build`
Expected: build succeeds. Record `dist/` JS size; confirm HeroUI is tree-shaken (only imported components present) and the build is not grossly larger. If a single chunk ballooned, ensure `/admin` stays code-split and the r3f hero is lazy-loaded.

- [ ] **Step 4: Full regression**

Run: `npm run test`
Expected: PASS — entire suite green.

- [ ] **Step 5: Commit**

```bash
git add -- frontend/src frontend/tests
git commit -m "polish(ui): skeleton sweep, reduced-motion + a11y verification"
```

---

## Self-Review

**Spec coverage:**
- HeroUI v2 + theme bridge → Task 1; provider → Task 2; modern utilities → Task 3.
- Bottom tab bar (mobile-only) → Task 4 + 8. Slide-up sheets → Task 5 (+ used in 13, 14, 19). Page transitions → Task 6 + 8. App touches (safe-area/tap targets) → Tasks 3, 4, 7, 8.
- Lean-modern surfaces → Tasks 9–11 (primitives) applied in 12–16.
- Keep 3D hero/theme toggle/Space Grotesk/motion → preserved (Task 12 keeps hero; ThemeContext untouched; fonts in config; `motion` retained).
- Public per-portion (Home/Projects/Detail/Contact/About/NotFound) → Tasks 12–16.
- Admin lighter (Login/Layout/Dashboard/Messages/ProjectsAdmin/Editor/Profile) → Tasks 17–20.
- A11y/perf/reduced-motion/bundle → Task 21.

**Placeholder scan:** No "TBD/TODO/handle edge cases". Where styling is class-level the directives are concrete (exact classes/components named). Page tasks that read an unseen file (Projects, Messages, AdminLayout, ProjectForm) include an explicit read step + a real test rather than a vague instruction — the behavioral deliverable is fully specified; only the exact final JSX styling is applied against the running app, which is correct for reskin work.

**Type/name consistency:** `BottomSheet({ isOpen, onOpenChange, title })` used consistently (Tasks 5, 13, 14, 19). `Button({ as, variant, className, type })` contract preserved (Task 9, consumed everywhere). `Skeleton({ className })` (Task 11 → 12, 13). `PageTransition` (Task 6 → 8, 17). `BottomTabBar` (Task 4 → 8).

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-06-30-heroui-v2-modern-rebuild.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session with checkpoints for review.
