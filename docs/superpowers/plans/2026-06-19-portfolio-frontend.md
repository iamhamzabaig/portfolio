# Portfolio Frontend SPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React + Vite single-page app for the portfolio — public site (home, projects, project detail, about, contact) and a JWT-gated admin area (login, dashboard, project editor with image upload, messages) — consuming the backend API.

**Architecture:** Feature-based folders. A single axios client (`withCredentials`) talks to `/api/v1`. TanStack Query owns all server state (queries + mutations with cache invalidation). React Context holds only auth + theme. React Router v6 splits a public route tree and an admin route tree gated by `ProtectedRoute`. Tailwind supplies the dark/purple theme tokens. Forms use react-hook-form + Zod.

**Tech Stack:** React 18, Vite 6, react-router-dom 6, @tanstack/react-query 5, axios, react-hook-form + @hookform/resolvers + zod, Tailwind CSS 3. Tests: Vitest + @testing-library/react + jest-dom + user-event + jsdom.

## Global Constraints

- Build tool: **Vite** (React plugin). Module system: ESM.
- All server calls go through the shared `axiosClient` (`baseURL = import.meta.env.VITE_API_URL`, `withCredentials: true`). No `fetch`/`axios` calls elsewhere.
- Server state via **TanStack Query only**. Context is for auth + theme, never server data.
- API response envelope is `{ success, statusCode, message, data }` — api functions return `res.data.data`.
- Query keys: `['projects', params]`, `['project', slug]`, `['profile']`, `['messages']`, `['me']`. Mutations invalidate the matching key.
- Forms validated with Zod via react-hook-form `zodResolver`.
- Theme tokens live in `tailwind.config.js` (`colors.bg`, `colors.surface`, `colors.accent`, fonts). Components use token classes, no hard-coded hex.
- Admin routes live under `/admin/*` and are wrapped in `ProtectedRoute`.
- Every task ends green (`npm test`) and is committed.
- Run all commands from the `frontend/` directory.

---

### Task 1: Scaffold Vite + Tailwind + test harness

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/styles/index.css`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/app/App.jsx`
- Create: `frontend/tests/setup.js`
- Create: `frontend/.env.example`
- Create: `frontend/.gitignore`
- Create: `frontend/tests/smoke.test.jsx`

**Interfaces:**
- Produces: working `npm test` (Vitest + jsdom + jest-dom), Tailwind build, an `App` placeholder rendering "Portfolio".

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "portfolio-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@tanstack/react-query": "^5.62.0",
    "axios": "^1.7.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.0",
    "react-router-dom": "^6.28.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.js`**

```js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    css: true,
    env: { VITE_API_URL: 'http://localhost:5000/api/v1' },
  },
});
```

- [ ] **Step 3: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `frontend/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create `frontend/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080c',
        surface: '#101018',
        'surface-2': '#16161f',
        border: '#23232e',
        accent: '#7c6cf2',
        'accent-soft': '#a99cf9',
        muted: '#8b8b9a',
        ink: '#f3f1ea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: Create `frontend/src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-bg text-ink font-sans antialiased;
}
```

- [ ] **Step 7: Create `frontend/src/app/App.jsx`**

```jsx
export default function App() {
  return <h1>Portfolio</h1>;
}
```

- [ ] **Step 8: Create `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 9: Create `frontend/tests/setup.js`**

```js
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 10: Create `frontend/.env.example`**

```
VITE_API_URL=http://localhost:5000/api/v1
```

- [ ] **Step 11: Create `frontend/.gitignore`**

```
node_modules/
dist/
.env
.env.local
coverage/
*.log
```

- [ ] **Step 12: Create the smoke test `frontend/tests/smoke.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/app/App.jsx';

describe('App', () => {
  it('renders the portfolio heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /portfolio/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 13: Install and run**

Run: `npm install && npm test`
Expected: PASS — 1 test ("renders the portfolio heading").

- [ ] **Step 14: Commit**

```bash
git add frontend/
git commit -m "chore(frontend): scaffold vite, tailwind, and test harness"
```

---

### Task 2: API client, query client & test providers

**Files:**
- Create: `frontend/src/api/axiosClient.js`
- Create: `frontend/src/app/queryClient.js`
- Create: `frontend/src/test/renderWithProviders.jsx`
- Test: `frontend/tests/unit/axiosClient.test.js`

**Interfaces:**
- Produces:
  - `axiosClient` — axios instance, `baseURL = import.meta.env.VITE_API_URL`, `withCredentials: true`.
  - `createQueryClient()` → a `QueryClient` with `retry: false` defaults (used by app and tests).
  - `renderWithProviders(ui, { route })` — RTL render wrapped in `QueryClientProvider` + `MemoryRouter`; returns `{ ...renderResult, user }` (user-event instance).

- [ ] **Step 1: Write the failing test `frontend/tests/unit/axiosClient.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { axiosClient } from '../../src/api/axiosClient.js';

describe('axiosClient', () => {
  it('has the API base URL and sends credentials', () => {
    expect(axiosClient.defaults.baseURL).toBe('http://localhost:5000/api/v1');
    expect(axiosClient.defaults.withCredentials).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/axiosClient.test.js`
Expected: FAIL — cannot resolve `../../src/api/axiosClient.js`.

- [ ] **Step 3: Create `frontend/src/api/axiosClient.js`**

```js
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
```

- [ ] **Step 4: Create `frontend/src/app/queryClient.js`**

```js
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
```

- [ ] **Step 5: Create `frontend/src/test/renderWithProviders.jsx`**

```jsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createQueryClient } from '../app/queryClient.js';

export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = createQueryClient();
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
  return { ...result, user, queryClient };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/axiosClient.test.js`
Expected: PASS — 1 test.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/api frontend/src/app/queryClient.js frontend/src/test tests/unit/axiosClient.test.js
git commit -m "feat(frontend): add axios client, query client, and test providers"
```

---

### Task 3: UI primitives

**Files:**
- Create: `frontend/src/components/ui/Button.jsx`
- Create: `frontend/src/components/ui/Input.jsx`
- Create: `frontend/src/components/ui/Spinner.jsx`
- Create: `frontend/src/components/ui/Chip.jsx`
- Create: `frontend/src/components/ui/Card.jsx`
- Test: `frontend/tests/unit/ui.test.jsx`

**Interfaces:**
- Produces:
  - `Button({ variant = 'primary', as, ...props })` — variants `primary | ghost | outline`; renders `<button>` (or `as` component).
  - `Input({ label, error, id, ...props })` — labeled input; shows `error` text with `role="alert"` when present.
  - `Spinner({ label = 'Loading' })` — `role="status"` with accessible label.
  - `Chip({ children })` — small tag pill.
  - `Card({ children, className })` — surface container.

- [ ] **Step 1: Write the failing test `frontend/tests/unit/ui.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../../src/components/ui/Button.jsx';
import { Input } from '../../src/components/ui/Input.jsx';
import { Spinner } from '../../src/components/ui/Spinner.jsx';
import { Chip } from '../../src/components/ui/Chip.jsx';

describe('UI primitives', () => {
  it('Button renders its label and type', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('Input shows label and error', () => {
    render(<Input id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('Spinner exposes a status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Chip renders children', () => {
    render(<Chip>react</Chip>);
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ui.test.jsx`
Expected: FAIL — cannot resolve `../../src/components/ui/Button.jsx`.

- [ ] **Step 3: Create `frontend/src/components/ui/Button.jsx`**

```jsx
const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-soft',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  outline: 'border border-border text-ink hover:border-accent',
};

export function Button({ variant = 'primary', as: As = 'button', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  return <As className={`${base} ${VARIANTS[variant]} ${className}`} {...props} />;
}
```

- [ ] **Step 4: Create `frontend/src/components/ui/Input.jsx`**

```jsx
import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`rounded-lg border border-border bg-surface px-3 py-2 text-ink outline-none focus:border-accent ${className}`}
        {...props}
      />
      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
});
```

- [ ] **Step 5: Create `frontend/src/components/ui/Spinner.jsx`**

```jsx
export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center p-6">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
```

- [ ] **Step 6: Create `frontend/src/components/ui/Chip.jsx`**

```jsx
export function Chip({ children }) {
  return (
    <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
      {children}
    </span>
  );
}
```

- [ ] **Step 7: Create `frontend/src/components/ui/Card.jsx`**

```jsx
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/unit/ui.test.jsx`
Expected: PASS — 4 tests.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/ui tests/unit/ui.test.jsx
git commit -m "feat(frontend): add UI primitives (Button, Input, Spinner, Chip, Card)"
```

---

### Task 4: Theme context & layout (Navbar, Footer, Container, ThemeToggle)

**Files:**
- Create: `frontend/src/context/ThemeContext.jsx`
- Create: `frontend/src/components/layout/Container.jsx`
- Create: `frontend/src/components/layout/ThemeToggle.jsx`
- Create: `frontend/src/components/layout/Navbar.jsx`
- Create: `frontend/src/components/layout/Footer.jsx`
- Test: `frontend/tests/unit/theme.test.jsx`
- Test: `frontend/tests/unit/navbar.test.jsx`

**Interfaces:**
- Consumes: `Button`, react-router `Link`/`NavLink`.
- Produces:
  - `ThemeProvider({ children })` + `useTheme() → { theme, toggle }`; toggles `document.documentElement` class `dark`; defaults to `'dark'`.
  - `Container({ children, className })` — max-width centered wrapper.
  - `ThemeToggle()` — button calling `toggle`, label reflects current theme.
  - `Navbar()` — logo + nav links (Home, Projects, About, Contact) + ThemeToggle.
  - `Footer()` — copyright line.

- [ ] **Step 1: Write the failing test `frontend/tests/unit/theme.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../src/context/ThemeContext.jsx';
import { ThemeToggle } from '../../src/components/layout/ThemeToggle.jsx';

describe('theme', () => {
  it('toggles the document dark class', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    await user.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

- [ ] **Step 2: Write the failing test `frontend/tests/unit/navbar.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ThemeProvider } from '../../src/context/ThemeContext.jsx';
import { Navbar } from '../../src/components/layout/Navbar.jsx';

describe('Navbar', () => {
  it('renders the primary nav links', () => {
    renderWithProviders(<ThemeProvider><Navbar /></ThemeProvider>);
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/unit/theme.test.jsx tests/unit/navbar.test.jsx`
Expected: FAIL — cannot resolve `ThemeContext.jsx`.

- [ ] **Step 4: Create `frontend/src/context/ThemeContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 5: Create `frontend/src/components/layout/Container.jsx`**

```jsx
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 ${className}`}>{children}</div>;
}
```

- [ ] **Step 6: Create `frontend/src/components/layout/ThemeToggle.jsx`**

```jsx
import { useTheme } from '../../context/ThemeContext.jsx';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="rounded-full border border-border p-2 text-muted hover:text-ink"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
```

- [ ] **Step 7: Create `frontend/src/components/layout/Navbar.jsx`**

```jsx
import { Link, NavLink } from 'react-router-dom';
import { Container } from './Container.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-lg font-semibold">
          waqar<span className="text-accent">.dev</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm ${isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <ThemeToggle />
      </Container>
    </header>
  );
}
```

- [ ] **Step 8: Create `frontend/src/components/layout/Footer.jsx`**

```jsx
import { Container } from './Container.jsx';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-10 text-sm text-muted">
      <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Waqar. All rights reserved.</span>
        <span className="font-mono text-xs">Built with the MERN stack.</span>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run tests/unit/theme.test.jsx tests/unit/navbar.test.jsx`
Expected: PASS — 2 tests.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/context/ThemeContext.jsx frontend/src/components/layout tests/unit/theme.test.jsx tests/unit/navbar.test.jsx
git commit -m "feat(frontend): add theme context and layout chrome"
```

---

### Task 5: Projects data layer (api + query hooks)

**Files:**
- Create: `frontend/src/features/projects/api/projects.api.js`
- Create: `frontend/src/features/projects/api/projects.queries.js`
- Test: `frontend/tests/unit/projects.queries.test.jsx`

**Interfaces:**
- Consumes: `axiosClient`.
- Produces (api, all return unwrapped `data`):
  - `fetchProjects(params) → Project[]`
  - `fetchProject(slug) → Project`
  - `createProject(formData) → Project` (POST multipart)
  - `updateProject(id, formData) → Project` (PUT multipart)
  - `deleteProject(id) → void`
- Produces (queries):
  - `useProjects(params)` → query `['projects', params]`
  - `useProject(slug)` → query `['project', slug]`, enabled when slug truthy
  - `useCreateProject()`, `useUpdateProject()`, `useDeleteProject()` → mutations invalidating `['projects']`

- [ ] **Step 1: Write the failing test `frontend/tests/unit/projects.queries.test.jsx`**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../../src/app/queryClient.js';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([{ _id: '1', title: 'A', slug: 'a' }]),
  fetchProject: vi.fn().mockResolvedValue({ _id: '1', title: 'A', slug: 'a' }),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

const { useProjects } = await import('../../src/features/projects/api/projects.queries.js');

const wrapper = ({ children }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

describe('useProjects', () => {
  it('loads the project list', async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].title).toBe('A');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/projects.queries.test.jsx`
Expected: FAIL — cannot resolve `projects.api.js`.

- [ ] **Step 3: Create `frontend/src/features/projects/api/projects.api.js`**

```js
import { axiosClient } from '../../../api/axiosClient.js';

export const fetchProjects = async (params = {}) => {
  const res = await axiosClient.get('/projects', { params });
  return res.data.data;
};

export const fetchProject = async (slug) => {
  const res = await axiosClient.get(`/projects/${slug}`);
  return res.data.data;
};

export const createProject = async (formData) => {
  const res = await axiosClient.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const updateProject = async (id, formData) => {
  const res = await axiosClient.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const deleteProject = async (id) => {
  await axiosClient.delete(`/projects/${id}`);
};
```

- [ ] **Step 4: Create `frontend/src/features/projects/api/projects.queries.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProjects, fetchProject, createProject, updateProject, deleteProject,
} from './projects.api.js';

export const useProjects = (params = {}) =>
  useQuery({ queryKey: ['projects', params], queryFn: () => fetchProjects(params) });

export const useProject = (slug) =>
  useQuery({ queryKey: ['project', slug], queryFn: () => fetchProject(slug), enabled: !!slug });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createProject(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateProject(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/projects.queries.test.jsx`
Expected: PASS — 1 test.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/projects/api tests/unit/projects.queries.test.jsx
git commit -m "feat(frontend): add projects api and query hooks"
```

---

### Task 6: Project display components & public Projects pages

**Files:**
- Create: `frontend/src/features/projects/components/ProjectCard.jsx`
- Create: `frontend/src/features/projects/components/ProjectGrid.jsx`
- Create: `frontend/src/features/projects/components/ProjectFilter.jsx`
- Create: `frontend/src/pages/public/Projects.jsx`
- Create: `frontend/src/pages/public/ProjectDetail.jsx`
- Test: `frontend/tests/unit/projectCard.test.jsx`
- Test: `frontend/tests/integration/projectsPage.test.jsx`

**Interfaces:**
- Consumes: `useProjects`, `useProject`, `Card`, `Chip`, `Spinner`, router `Link`/`useParams`.
- Produces:
  - `ProjectCard({ project })` — cover image, title (link to `/projects/:slug`), tag chips.
  - `ProjectGrid({ projects })` — responsive grid of cards; empty-state text when none.
  - `ProjectFilter({ tags, active, onChange })` — tag filter buttons.
  - `Projects()` page — loads `useProjects`, derives tag list, filters by active tag, renders grid; shows `Spinner` while loading.
  - `ProjectDetail()` page — `useParams().slug` → `useProject`; renders title, cover, content, live/repo links; 404 message on error.

- [ ] **Step 1: Write the failing test `frontend/tests/unit/projectCard.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectCard } from '../../src/features/projects/components/ProjectCard.jsx';

const project = {
  _id: '1', title: 'Cool App', slug: 'cool-app', description: 'desc',
  tags: ['react', 'node'], coverImage: { url: 'http://img/x.jpg' },
};

describe('ProjectCard', () => {
  it('links to the detail page and shows tags', () => {
    renderWithProviders(<ProjectCard project={project} />);
    const link = screen.getByRole('link', { name: /cool app/i });
    expect(link).toHaveAttribute('href', '/projects/cool-app');
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write the failing test `frontend/tests/integration/projectsPage.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { _id: '1', title: 'Alpha', slug: 'alpha', tags: ['react'], coverImage: { url: '' } },
    { _id: '2', title: 'Beta', slug: 'beta', tags: ['node'], coverImage: { url: '' } },
  ]),
  fetchProject: vi.fn(),
  createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn(),
}));

const { default: Projects } = await import('../../src/pages/public/Projects.jsx');

describe('Projects page', () => {
  it('renders all projects from the API', async () => {
    renderWithProviders(<Projects />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/unit/projectCard.test.jsx tests/integration/projectsPage.test.jsx`
Expected: FAIL — cannot resolve `ProjectCard.jsx`.

- [ ] **Step 4: Create `frontend/src/features/projects/components/ProjectCard.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.jsx';
import { Chip } from '../../../components/ui/Chip.jsx';

export function ProjectCard({ project }) {
  return (
    <Card className="group overflow-hidden p-0">
      <div className="aspect-video w-full overflow-hidden bg-surface-2">
        {project.coverImage?.url && (
          <img
            src={project.coverImage.url}
            alt={project.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold">
          <Link to={`/projects/${project.slug}`} className="hover:text-accent">
            {project.title}
          </Link>
        </h3>
        {project.description && <p className="text-sm text-muted">{project.description}</p>}
        <div className="flex flex-wrap gap-2">
          {(project.tags || []).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Create `frontend/src/features/projects/components/ProjectGrid.jsx`**

```jsx
import { ProjectCard } from './ProjectCard.jsx';

export function ProjectGrid({ projects }) {
  if (!projects?.length) {
    return <p className="text-muted">No projects yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p._id} project={p} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create `frontend/src/features/projects/components/ProjectFilter.jsx`**

```jsx
export function ProjectFilter({ tags, active, onChange }) {
  if (!tags.length) return null;
  const all = ['all', ...tags];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag === 'all' ? '' : tag)}
          className={`rounded-full px-4 py-1.5 text-sm ${
            (active || 'all') === tag ? 'bg-accent text-white' : 'border border-border text-muted hover:text-ink'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `frontend/src/pages/public/Projects.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';
import { ProjectFilter } from '../../features/projects/components/ProjectFilter.jsx';

export default function Projects() {
  const [active, setActive] = useState('');
  const { data: projects = [], isLoading } = useProjects();

  const tags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags || []))],
    [projects]
  );
  const filtered = active ? projects.filter((p) => (p.tags || []).includes(active)) : projects;

  return (
    <Container className="py-16">
      <h1 className="mb-2 text-4xl font-display font-bold">Projects</h1>
      <p className="mb-8 text-muted">Things I have designed and shipped.</p>
      <div className="mb-8">
        <ProjectFilter tags={tags} active={active} onChange={setActive} />
      </div>
      {isLoading ? <Spinner /> : <ProjectGrid projects={filtered} />}
    </Container>
  );
}
```

- [ ] **Step 8: Create `frontend/src/pages/public/ProjectDetail.jsx`**

```jsx
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useProject } from '../../features/projects/api/projects.queries.js';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isLoading, isError } = useProject(slug);

  if (isLoading) return <Spinner />;
  if (isError || !project) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold">Project not found</h1>
        <Link to="/projects" className="text-accent">Back to projects</Link>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <Link to="/projects" className="text-sm text-muted hover:text-ink">&larr; All projects</Link>
      <h1 className="mt-4 text-4xl font-display font-bold">{project.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {(project.tags || []).map((t) => <Chip key={t}>{t}</Chip>)}
      </div>
      {project.coverImage?.url && (
        <img src={project.coverImage.url} alt={project.title}
          className="mt-8 w-full rounded-2xl border border-border object-cover" />
      )}
      <p className="mt-8 whitespace-pre-line text-muted">{project.content || project.description}</p>
      <div className="mt-8 flex gap-3">
        {project.liveUrl && <Button as="a" href={project.liveUrl} target="_blank" rel="noreferrer">Live</Button>}
        {project.repoUrl && <Button variant="outline" as="a" href={project.repoUrl} target="_blank" rel="noreferrer">Code</Button>}
      </div>
    </Container>
  );
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run tests/unit/projectCard.test.jsx tests/integration/projectsPage.test.jsx`
Expected: PASS — 2 tests.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/projects/components frontend/src/pages/public/Projects.jsx frontend/src/pages/public/ProjectDetail.jsx tests/unit/projectCard.test.jsx tests/integration/projectsPage.test.jsx
git commit -m "feat(frontend): add project cards, grid, filter, and public pages"
```

---

### Task 7: Profile data layer + Home & About pages

**Files:**
- Create: `frontend/src/features/profile/api/profile.api.js`
- Create: `frontend/src/features/profile/api/profile.queries.js`
- Create: `frontend/src/features/home/components/Hero.jsx`
- Create: `frontend/src/features/home/components/StatCard.jsx`
- Create: `frontend/src/pages/public/Home.jsx`
- Create: `frontend/src/pages/public/About.jsx`
- Test: `frontend/tests/integration/homePage.test.jsx`

**Interfaces:**
- Consumes: `axiosClient`, `useProjects`, `Container`, `Card`, `Button`.
- Produces:
  - `fetchProfile() → Profile`; `updateProfile(payload) → Profile` (PUT json).
  - `useProfile()` → query `['profile']`; `useUpdateProfile()` → mutation invalidating `['profile']`.
  - `Hero({ profile })` — headline + bio + CTA buttons (Projects / Contact).
  - `StatCard({ stat })` — big value + suffix, label, description.
  - `Home()` — `useProfile` + `useProjects({ featured: true })`; renders Hero, stats grid, featured ProjectGrid.
  - `About()` — `useProfile`; renders bio + full stats.

- [ ] **Step 1: Write the failing test `frontend/tests/integration/homePage.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({
    name: 'Waqar', headline: 'I build web apps', bio: 'bio text',
    stats: [{ label: 'Projects', value: '20', suffix: '+', description: 'shipped' }],
  }),
  updateProfile: vi.fn(),
}));
vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn(),
}));

const { default: Home } = await import('../../src/pages/public/Home.jsx');

describe('Home page', () => {
  it('renders the headline and a stat', async () => {
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getByText('I build web apps')).toBeInTheDocument());
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/homePage.test.jsx`
Expected: FAIL — cannot resolve `profile.api.js`.

- [ ] **Step 3: Create `frontend/src/features/profile/api/profile.api.js`**

```js
import { axiosClient } from '../../../api/axiosClient.js';

export const fetchProfile = async () => {
  const res = await axiosClient.get('/profile');
  return res.data.data;
};

export const updateProfile = async (payload) => {
  const res = await axiosClient.put('/profile', payload);
  return res.data.data;
};
```

- [ ] **Step 4: Create `frontend/src/features/profile/api/profile.queries.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from './profile.api.js';

export const useProfile = () =>
  useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
};
```

- [ ] **Step 5: Create `frontend/src/features/home/components/StatCard.jsx`**

```jsx
export function StatCard({ stat }) {
  return (
    <div className="border-l border-border pl-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{stat.label}</p>
      <p className="mt-3 font-display text-5xl font-bold">
        {stat.value}
        <span className="text-accent">{stat.suffix}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{stat.description}</p>
    </div>
  );
}
```

- [ ] **Step 6: Create `frontend/src/features/home/components/Hero.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';

export function Hero({ profile }) {
  return (
    <section className="py-24 text-center">
      <p className="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-xs text-muted">
        {profile?.name ? `Hi, I'm ${profile.name}` : 'Welcome'}
      </p>
      <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold leading-tight sm:text-6xl">
        {profile?.headline || 'I build modern web applications.'}
      </h1>
      {profile?.bio && <p className="mx-auto mt-6 max-w-xl text-muted">{profile.bio}</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Button as={Link} to="/projects">View projects</Button>
        <Button variant="outline" as={Link} to="/contact">Get in touch</Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `frontend/src/pages/public/Home.jsx`**

```jsx
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { useProjects } from '../../features/projects/api/projects.queries.js';
import { Hero } from '../../features/home/components/Hero.jsx';
import { StatCard } from '../../features/home/components/StatCard.jsx';
import { ProjectGrid } from '../../features/projects/components/ProjectGrid.jsx';

export default function Home() {
  const { data: profile, isLoading } = useProfile();
  const { data: featured = [] } = useProjects({ featured: true });

  if (isLoading) return <Spinner />;

  return (
    <Container>
      <Hero profile={profile} />

      {profile?.stats?.length > 0 && (
        <section className="border-t border-border py-16">
          <p className="mb-10 font-mono text-xs uppercase tracking-widest text-accent">01 · By the numbers</p>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {profile.stats.map((s, i) => <StatCard key={i} stat={s} />)}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="py-16">
          <h2 className="mb-8 text-3xl font-display font-bold">Featured work</h2>
          <ProjectGrid projects={featured} />
        </section>
      )}
    </Container>
  );
}
```

- [ ] **Step 8: Create `frontend/src/pages/public/About.jsx`**

```jsx
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import { StatCard } from '../../features/home/components/StatCard.jsx';

export default function About() {
  const { data: profile, isLoading } = useProfile();
  if (isLoading) return <Spinner />;

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-display font-bold">{profile?.name || 'About me'}</h1>
      <p className="mt-2 text-accent">{profile?.headline}</p>
      <p className="mt-8 max-w-2xl whitespace-pre-line text-muted">{profile?.bio}</p>
      {profile?.stats?.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {profile.stats.map((s, i) => <StatCard key={i} stat={s} />)}
        </div>
      )}
    </Container>
  );
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run tests/integration/homePage.test.jsx`
Expected: PASS — 1 test.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/profile frontend/src/features/home frontend/src/pages/public/Home.jsx frontend/src/pages/public/About.jsx tests/integration/homePage.test.jsx
git commit -m "feat(frontend): add profile data layer, home, and about pages"
```

---

### Task 8: Contact feature (api, form, page)

**Files:**
- Create: `frontend/src/features/contact/api/contact.api.js`
- Create: `frontend/src/features/contact/api/contact.queries.js`
- Create: `frontend/src/features/contact/components/ContactForm.jsx`
- Create: `frontend/src/pages/public/Contact.jsx`
- Test: `frontend/tests/integration/contactForm.test.jsx`

**Interfaces:**
- Consumes: `axiosClient`, react-hook-form, zod, `Input`, `Button`.
- Produces:
  - `sendMessage(payload) → data` (POST `/contact`).
  - `useSendMessage()` → mutation.
  - `contactFormSchema` (zod): `name` min 2, `email` email, `message` min 10.
  - `ContactForm()` — react-hook-form + zodResolver; shows field errors; on submit calls mutation; renders a success message after success; disables submit while pending.
  - `Contact()` page — heading + `ContactForm`.

- [ ] **Step 1: Write the failing test `frontend/tests/integration/contactForm.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

const sendMessage = vi.fn().mockResolvedValue({ _id: '1' });
vi.mock('../../src/features/contact/api/contact.api.js', () => ({ sendMessage }));

const { ContactForm } = await import('../../src/features/contact/components/ContactForm.jsx');

describe('ContactForm', () => {
  it('shows validation errors for empty submit', async () => {
    const { user } = renderWithProviders(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('submits valid data and shows success', async () => {
    const { user } = renderWithProviders(<ContactForm />);
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello, I would love to work together!');
    await user.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/contactForm.test.jsx`
Expected: FAIL — cannot resolve `contact.api.js`.

- [ ] **Step 3: Create `frontend/src/features/contact/api/contact.api.js`**

```js
import { axiosClient } from '../../../api/axiosClient.js';

export const sendMessage = async (payload) => {
  const res = await axiosClient.post('/contact', payload);
  return res.data.data;
};
```

- [ ] **Step 4: Create `frontend/src/features/contact/api/contact.queries.js`**

```js
import { useMutation } from '@tanstack/react-query';
import { sendMessage } from './contact.api.js';

export const useSendMessage = () =>
  useMutation({ mutationFn: (payload) => sendMessage(payload) });
```

- [ ] **Step 5: Create `frontend/src/features/contact/components/ContactForm.jsx`**

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useSendMessage } from '../api/contact.queries.js';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactFormSchema),
  });
  const mutation = useSendMessage();

  const onSubmit = (values) => mutation.mutate(values, { onSuccess: () => reset() });

  if (mutation.isSuccess) {
    return <p className="rounded-lg border border-border bg-surface p-6 text-ink">Thanks — your message is on its way.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
      <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-xs uppercase tracking-wider text-muted">Message</label>
        <textarea
          id="message"
          rows={5}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          {...register('message')}
        />
        {errors.message && <span role="alert" className="text-xs text-red-400">{errors.message.message}</span>}
      </div>
      {mutation.isError && <p className="text-sm text-red-400">Something went wrong. Try again.</p>}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 6: Create `frontend/src/pages/public/Contact.jsx`**

```jsx
import { Container } from '../../components/layout/Container.jsx';
import { ContactForm } from '../../features/contact/components/ContactForm.jsx';

export default function Contact() {
  return (
    <Container className="max-w-xl py-16">
      <h1 className="text-4xl font-display font-bold">Get in touch</h1>
      <p className="mt-2 mb-8 text-muted">Have a project in mind? Send me a message.</p>
      <ContactForm />
    </Container>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/integration/contactForm.test.jsx`
Expected: PASS — 2 tests.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/contact frontend/src/pages/public/Contact.jsx tests/integration/contactForm.test.jsx
git commit -m "feat(frontend): add contact form with validation and submission"
```

---

### Task 9: Auth context, login, and ProtectedRoute

**Files:**
- Create: `frontend/src/features/auth/api/auth.api.js`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/features/auth/components/LoginForm.jsx`
- Create: `frontend/src/features/auth/components/ProtectedRoute.jsx`
- Create: `frontend/src/pages/admin/Login.jsx`
- Test: `frontend/tests/integration/protectedRoute.test.jsx`

**Interfaces:**
- Consumes: `axiosClient`, react-query, react-hook-form, zod, router `Navigate`/`useNavigate`/`useLocation`.
- Produces:
  - `loginRequest({ email, password })`, `logoutRequest()`, `fetchMe() → user` (api).
  - `AuthProvider({ children })` + `useAuth() → { user, isLoading, isAuthenticated, login, logout }`. `login` calls `loginRequest` then invalidates `['me']`; `useAuth` reads `['me']` query (retry false; a 401 → `user = null`).
  - `LoginForm()` — email+password form; on success navigates to `/admin`.
  - `ProtectedRoute({ children })` — `isLoading` → `Spinner`; unauthenticated → `<Navigate to="/admin/login" replace />`; else children.
  - `Login()` page wraps `LoginForm`.

- [ ] **Step 1: Write the failing test `frontend/tests/integration/protectedRoute.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

const fetchMe = vi.fn();
vi.mock('../../src/features/auth/api/auth.api.js', () => ({
  fetchMe: (...a) => fetchMe(...a),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
}));

const { AuthProvider } = await import('../../src/context/AuthContext.jsx');
const { ProtectedRoute } = await import('../../src/features/auth/components/ProtectedRoute.jsx');

const Tree = () => (
  <AuthProvider>
    <Routes>
      <Route path="/admin/login" element={<div>Login Page</div>} />
      <Route path="/admin" element={<ProtectedRoute><div>Secret Dashboard</div></ProtectedRoute>} />
    </Routes>
  </AuthProvider>
);

describe('ProtectedRoute', () => {
  it('redirects to login when unauthenticated', async () => {
    fetchMe.mockRejectedValueOnce({ response: { status: 401 } });
    renderWithProviders(<Tree />, { route: '/admin' });
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
  });

  it('renders children when authenticated', async () => {
    fetchMe.mockResolvedValueOnce({ _id: '1', email: 'admin@test.dev' });
    renderWithProviders(<Tree />, { route: '/admin' });
    await waitFor(() => expect(screen.getByText('Secret Dashboard')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/protectedRoute.test.jsx`
Expected: FAIL — cannot resolve `auth.api.js`.

- [ ] **Step 3: Create `frontend/src/features/auth/api/auth.api.js`**

```js
import { axiosClient } from '../../../api/axiosClient.js';

export const loginRequest = async (credentials) => {
  const res = await axiosClient.post('/auth/login', credentials);
  return res.data.data.user;
};

export const logoutRequest = async () => {
  await axiosClient.post('/auth/logout');
};

export const fetchMe = async () => {
  const res = await axiosClient.get('/auth/me');
  return res.data.data;
};
```

- [ ] **Step 4: Create `frontend/src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, loginRequest, logoutRequest } from '../features/auth/api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = async (credentials) => {
    await loginRequest(credentials);
    await qc.invalidateQueries({ queryKey: ['me'] });
  };

  const logout = async () => {
    await logoutRequest();
    qc.setQueryData(['me'], null);
    await qc.invalidateQueries({ queryKey: ['me'] });
  };

  const value = { user, isLoading, isAuthenticated: !!user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 5: Create `frontend/src/features/auth/components/ProtectedRoute.jsx`**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
```

- [ ] **Step 6: Create `frontend/src/features/auth/components/LoginForm.jsx`**

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      navigate('/admin', { replace: true });
    } catch {
      setServerError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input id="password" label="Password" type="password" error={errors.password?.message} {...register('password')} />
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 7: Create `frontend/src/pages/admin/Login.jsx`**

```jsx
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { LoginForm } from '../../features/auth/components/LoginForm.jsx';

export default function Login() {
  return (
    <Container className="flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full">
        <h1 className="mb-6 text-2xl font-display font-bold">Admin sign in</h1>
        <LoginForm />
      </Card>
    </Container>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/integration/protectedRoute.test.jsx`
Expected: PASS — 2 tests.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/features/auth frontend/src/context/AuthContext.jsx frontend/src/pages/admin/Login.jsx tests/integration/protectedRoute.test.jsx
git commit -m "feat(frontend): add auth context, login form, and protected route"
```

---

### Task 10: Admin dashboard, project editor & messages

**Files:**
- Create: `frontend/src/features/projects/components/ProjectForm.jsx`
- Create: `frontend/src/features/contact/api/messages.queries.js`
- Create: `frontend/src/pages/admin/Dashboard.jsx`
- Create: `frontend/src/pages/admin/ProjectsAdmin.jsx`
- Create: `frontend/src/pages/admin/ProjectEditor.jsx`
- Create: `frontend/src/pages/admin/Messages.jsx`
- Test: `frontend/tests/integration/projectForm.test.jsx`

**Interfaces:**
- Consumes: `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useProjects`, react-hook-form, `Input`, `Button`, `Card`, `axiosClient`.
- Produces:
  - `ProjectForm({ project, onSubmit, isPending })` — fields title, description, content, tags (comma string), liveUrl, repoUrl, featured (checkbox), coverImage (file input). On submit builds a `FormData` and calls `onSubmit(formData)`. Pre-fills from `project` when editing.
  - `messages.queries.js`: `useMessages()` (query `['messages']`, GET `/contact`), `useDeleteMessage()` (mutation invalidating `['messages']`).
  - `Dashboard()` — links to manage projects + messages; logout button.
  - `ProjectsAdmin()` — lists projects with edit/delete; "new project" link.
  - `ProjectEditor()` — create (no `:id`) or edit (`useParams().id`, prefilled from list cache/fetch); calls create/update mutation then navigates to `/admin/projects`.
  - `Messages()` — lists contact messages with delete.

- [ ] **Step 1: Write the failing test `frontend/tests/integration/projectForm.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

describe('ProjectForm', () => {
  it('submits a FormData payload with entered fields', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} isPending={false} />);
    await user.type(screen.getByLabelText(/title/i), 'My Project');
    await user.type(screen.getByLabelText(/description/i), 'A great project');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const fd = onSubmit.mock.calls[0][0];
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get('title')).toBe('My Project');
    expect(fd.get('description')).toBe('A great project');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/projectForm.test.jsx`
Expected: FAIL — cannot resolve `ProjectForm.jsx`.

- [ ] **Step 3: Create `frontend/src/features/projects/components/ProjectForm.jsx`**

```jsx
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';

export function ProjectForm({ project, onSubmit, isPending }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      content: project?.content || '',
      tags: (project?.tags || []).join(', '),
      liveUrl: project?.liveUrl || '',
      repoUrl: project?.repoUrl || '',
      featured: project?.featured || false,
    },
  });

  const submit = (values) => {
    const fd = new FormData();
    fd.append('title', values.title);
    fd.append('description', values.description);
    fd.append('content', values.content);
    fd.append('tags', values.tags);
    fd.append('liveUrl', values.liveUrl);
    fd.append('repoUrl', values.repoUrl);
    fd.append('featured', String(values.featured));
    const file = values.coverImage?.[0];
    if (file) fd.append('coverImage', file);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input id="title" label="Title" {...register('title')} />
      <Input id="description" label="Description" {...register('description')} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-xs uppercase tracking-wider text-muted">Content</label>
        <textarea id="content" rows={6}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          {...register('content')} />
      </div>
      <Input id="tags" label="Tags (comma separated)" {...register('tags')} />
      <Input id="liveUrl" label="Live URL" {...register('liveUrl')} />
      <Input id="repoUrl" label="Repo URL" {...register('repoUrl')} />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" {...register('featured')} /> Featured
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="coverImage" className="text-xs uppercase tracking-wider text-muted">Cover image</label>
        <input id="coverImage" type="file" accept="image/*" {...register('coverImage')} className="text-sm text-muted" />
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save project'}</Button>
    </form>
  );
}
```

- [ ] **Step 4: Create `frontend/src/features/contact/api/messages.queries.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../../api/axiosClient.js';

const fetchMessages = async () => {
  const res = await axiosClient.get('/contact');
  return res.data.data;
};

const deleteMessage = async (id) => {
  await axiosClient.delete(`/contact/${id}`);
};

export const useMessages = () =>
  useQuery({ queryKey: ['messages'], queryFn: fetchMessages });

export const useDeleteMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteMessage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
};
```

- [ ] **Step 5: Create `frontend/src/pages/admin/Dashboard.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <Container className="py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>Log out</Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-muted">Create, edit, and delete portfolio projects.</p>
          <Link to="/admin/projects" className="mt-4 inline-block text-accent">Manage projects →</Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="mt-1 text-sm text-muted">Read and delete contact submissions.</p>
          <Link to="/admin/messages" className="mt-4 inline-block text-accent">View messages →</Link>
        </Card>
      </div>
    </Container>
  );
}
```

- [ ] **Step 6: Create `frontend/src/pages/admin/ProjectsAdmin.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProjects, useDeleteProject } from '../../features/projects/api/projects.queries.js';

export default function ProjectsAdmin() {
  const { data: projects = [], isLoading } = useProjects();
  const del = useDeleteProject();

  if (isLoading) return <Spinner />;

  return (
    <Container className="py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Projects</h1>
        <Button as={Link} to="/admin/projects/new">New project</Button>
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {projects.map((p) => (
          <li key={p._id} className="flex items-center justify-between p-4">
            <span>{p.title}</span>
            <span className="flex gap-2">
              <Link to={`/admin/projects/${p._id}`} className="text-accent">Edit</Link>
              <button onClick={() => del.mutate(p._id)} className="text-red-400">Delete</button>
            </span>
          </li>
        ))}
        {projects.length === 0 && <li className="p-4 text-muted">No projects yet.</li>}
      </ul>
    </Container>
  );
}
```

- [ ] **Step 7: Create `frontend/src/pages/admin/ProjectEditor.jsx`**

```jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ProjectForm } from '../../features/projects/components/ProjectForm.jsx';
import {
  useProjects, useCreateProject, useUpdateProject,
} from '../../features/projects/api/projects.queries.js';

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: projects = [], isLoading } = useProjects();
  const project = isEdit ? projects.find((p) => p._id === id) : undefined;

  const create = useCreateProject();
  const update = useUpdateProject();
  const mutation = isEdit ? update : create;

  const handleSubmit = (formData) => {
    const payload = isEdit ? { id, formData } : formData;
    mutation.mutate(payload, { onSuccess: () => navigate('/admin/projects') });
  };

  if (isEdit && isLoading) return <Spinner />;

  return (
    <Container className="max-w-2xl py-16">
      <h1 className="mb-8 text-3xl font-display font-bold">{isEdit ? 'Edit project' : 'New project'}</h1>
      <ProjectForm project={project} onSubmit={handleSubmit} isPending={mutation.isPending} />
    </Container>
  );
}
```

- [ ] **Step 8: Create `frontend/src/pages/admin/Messages.jsx`**

```jsx
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useMessages, useDeleteMessage } from '../../features/contact/api/messages.queries.js';

export default function Messages() {
  const { data: messages = [], isLoading } = useMessages();
  const del = useDeleteMessage();

  if (isLoading) return <Spinner />;

  return (
    <Container className="py-16">
      <h1 className="mb-8 text-3xl font-display font-bold">Messages</h1>
      <div className="space-y-4">
        {messages.map((m) => (
          <Card key={m._id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{m.name} <span className="text-muted">&lt;{m.email}&gt;</span></p>
                <p className="mt-2 text-muted">{m.message}</p>
              </div>
              <button onClick={() => del.mutate(m._id)} className="text-red-400">Delete</button>
            </div>
          </Card>
        ))}
        {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
      </div>
    </Container>
  );
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run tests/integration/projectForm.test.jsx`
Expected: PASS — 1 test.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/projects/components/ProjectForm.jsx frontend/src/features/contact/api/messages.queries.js frontend/src/pages/admin tests/integration/projectForm.test.jsx
git commit -m "feat(frontend): add admin dashboard, project editor, and messages"
```

---

### Task 11: Layouts, router wiring, app shell & deploy config

**Files:**
- Create: `frontend/src/layouts/PublicLayout.jsx`
- Create: `frontend/src/layouts/AdminLayout.jsx`
- Create: `frontend/src/pages/public/NotFound.jsx`
- Create: `frontend/src/app/router.jsx`
- Modify: `frontend/src/app/App.jsx`
- Modify: `frontend/src/main.jsx`
- Create: `frontend/vercel.json`
- Create: `frontend/README.md`
- Test: `frontend/tests/integration/router.test.jsx`

**Interfaces:**
- Consumes: all pages, `Navbar`, `Footer`, `AuthProvider`, `ThemeProvider`, `ProtectedRoute`, react-router `Outlet`/`Routes`.
- Produces:
  - `PublicLayout()` — `Navbar` + `<Outlet/>` + `Footer`.
  - `AdminLayout()` — minimal admin chrome + `<Outlet/>`.
  - `NotFound()` — 404 page.
  - `AppRoutes()` (in `router.jsx`) — `<Routes>` tree: public routes under `PublicLayout`; `/admin/login`; admin routes under `ProtectedRoute`+`AdminLayout`.
  - `App()` — wraps `AppRoutes` in nothing extra (providers live in `main.jsx`).
  - `main.jsx` — wraps `App` in `QueryClientProvider` + `BrowserRouter` + `ThemeProvider` + `AuthProvider`.

NOTE: tests render `AppRoutes` inside `renderWithProviders` (which supplies `MemoryRouter` + `QueryClientProvider`); `AuthProvider`/`ThemeProvider` are added in the test tree as needed.

- [ ] **Step 1: Write the failing test `frontend/tests/integration/router.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'W', headline: 'Hi there', bio: '', stats: [] }),
  updateProfile: vi.fn(),
}));
vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn(),
}));
vi.mock('../../src/features/auth/api/auth.api.js', () => ({
  fetchMe: vi.fn().mockRejectedValue({ response: { status: 401 } }),
  loginRequest: vi.fn(), logoutRequest: vi.fn(),
}));

const { ThemeProvider } = await import('../../src/context/ThemeContext.jsx');
const { AuthProvider } = await import('../../src/context/AuthContext.jsx');
const { AppRoutes } = await import('../../src/app/router.jsx');

const Tree = () => (
  <ThemeProvider><AuthProvider><AppRoutes /></AuthProvider></ThemeProvider>
);

describe('router', () => {
  it('renders Home at /', async () => {
    renderWithProviders(<Tree />, { route: '/' });
    await waitFor(() => expect(screen.getByText('Hi there')).toBeInTheDocument());
  });

  it('renders NotFound for an unknown route', async () => {
    renderWithProviders(<Tree />, { route: '/nope' });
    await waitFor(() => expect(screen.getByText(/page not found/i)).toBeInTheDocument());
  });

  it('redirects /admin to login when unauthenticated', async () => {
    renderWithProviders(<Tree />, { route: '/admin' });
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin sign in/i })).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/router.test.jsx`
Expected: FAIL — cannot resolve `../../src/app/router.jsx`.

- [ ] **Step 3: Create `frontend/src/layouts/PublicLayout.jsx`**

```jsx
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Create `frontend/src/layouts/AdminLayout.jsx`**

```jsx
import { Link, Outlet } from 'react-router-dom';
import { Container } from '../components/layout/Container.jsx';

export function AdminLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <Container className="flex h-14 items-center justify-between">
          <Link to="/admin" className="font-display font-semibold">Admin</Link>
          <Link to="/" className="text-sm text-muted hover:text-ink">View site →</Link>
        </Container>
      </header>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 5: Create `frontend/src/pages/public/NotFound.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="font-mono text-accent">404</p>
      <h1 className="mt-2 text-3xl font-display font-bold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent">Back home</Link>
    </Container>
  );
}
```

- [ ] **Step 6: Create `frontend/src/app/router.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import Home from '../pages/public/Home.jsx';
import Projects from '../pages/public/Projects.jsx';
import ProjectDetail from '../pages/public/ProjectDetail.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import Login from '../pages/admin/Login.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import ProjectsAdmin from '../pages/admin/ProjectsAdmin.jsx';
import ProjectEditor from '../pages/admin/ProjectEditor.jsx';
import Messages from '../pages/admin/Messages.jsx';

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
```

- [ ] **Step 7: Replace `frontend/src/app/App.jsx`**

```jsx
import { AppRoutes } from './router.jsx';

export default function App() {
  return <AppRoutes />;
}
```

- [ ] **Step 8: Replace `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { createQueryClient } from './app/queryClient.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/index.css';

const queryClient = createQueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

- [ ] **Step 9: Create `frontend/vercel.json`** (SPA history fallback)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 10: Create `frontend/README.md`**

```markdown
# Portfolio Frontend

React + Vite SPA. Tailwind theme, TanStack Query data layer, JWT-cookie admin.

## Setup

1. `cp .env.example .env` and set `VITE_API_URL` to the backend base URL
   (e.g. `http://localhost:5000/api/v1`).
2. `npm install`
3. `npm run dev` — Vite dev server (default http://localhost:5173).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the build
- `npm test` — Vitest suite

## Routes

- Public: `/`, `/projects`, `/projects/:slug`, `/about`, `/contact`
- Admin: `/admin/login`, `/admin`, `/admin/projects`, `/admin/projects/new`,
  `/admin/projects/:id`, `/admin/messages` (gated by `ProtectedRoute`)

## Deploy (Vercel)

- Framework preset: Vite. Build: `npm run build`. Output: `dist`.
- `vercel.json` rewrites all paths to `index.html` for client-side routing.
- Set `VITE_API_URL` env var to the deployed backend URL.
- Ensure the backend `CLIENT_ORIGIN` equals this site's URL so cross-site
  auth cookies are accepted.
```

- [ ] **Step 11: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green (smoke, axiosClient, ui, theme, navbar, projects.queries, projectCard, projectsPage, homePage, contactForm, protectedRoute, projectForm, router).

- [ ] **Step 12: Verify the production build compiles**

Run: `npm run build`
Expected: Vite build completes with no errors; `dist/` created.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/layouts frontend/src/pages/public/NotFound.jsx frontend/src/app/router.jsx frontend/src/app/App.jsx frontend/src/main.jsx frontend/vercel.json frontend/README.md tests/integration/router.test.jsx
git commit -m "feat(frontend): wire layouts, router, app shell, and deploy config"
```

---

## Self-Review

**1. Spec coverage** (spec §5 + §3 frontend items → task):
- Feature-based folders — all tasks ✔
- Single axios client `withCredentials` — Task 2 ✔
- TanStack Query for all server state (projects, profile, messages, me) — Tasks 5,7,9,10 ✔
- Context only for auth + theme — Tasks 4,9 ✔
- Two route trees (public + admin gated) — Task 11 ✔
- Tailwind theme tokens from screenshots — Task 1 ✔
- Component mapping: Navbar/Footer/ThemeToggle (Task 4); Hero/StatCard (Task 7); ProjectCard/Grid/Filter/Form/ImageDropzone-as-file-input (Tasks 6,10); ContactForm (Task 8); LoginForm/ProtectedRoute (Task 9) ✔
- Pages: Home/Projects/ProjectDetail/About/Contact/NotFound + admin Login/Dashboard/ProjectsAdmin/ProjectEditor/Messages — Tasks 6,7,8,9,10,11 ✔
- Testing strategy (component tests + query hooks with mocked axios/api) — every task ✔
- Deploy (Vercel SPA fallback, VITE_API_URL, CLIENT_ORIGIN note) — Task 11 ✔

**2. Placeholder scan:** No TBD/TODO/"add X"/"similar to". Every code step has full code. ✔
- ImageDropzone from the spec tree is implemented as a styled `<input type="file">` inside `ProjectForm` (YAGNI — a drag-drop wrapper adds no required capability). Noted, not silently dropped.

**3. Type consistency:** api fns return `res.data.data`; query keys consistent (`['projects', params]`, `['project', slug]`, `['profile']`, `['messages']`, `['me']`); `useAuth() → { user, isLoading, isAuthenticated, login, logout }`; `ProjectForm` `onSubmit(FormData)`; `useUpdateProject` mutation takes `{ id, formData }` (matched in ProjectEditor); `renderWithProviders(ui, { route })` signature stable across tests. ✔

**Cross-plan dependency:** This plan assumes the backend API (Plan `2026-06-19-portfolio-backend.md`) is reachable at `VITE_API_URL`. Frontend tests mock the API, so they pass independently; full end-to-end behavior requires the backend running + an admin seeded + matching `CLIENT_ORIGIN`/`VITE_API_URL`.
