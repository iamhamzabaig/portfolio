# Repository Guidelines

## Project Structure & Module Organization

This repository is a decoupled portfolio monorepo. `frontend/` contains the React + Vite SPA, with app wiring in `src/app`, route layouts in `src/layouts`, reusable UI in `src/components`, feature slices in `src/features`, pages in `src/pages`, and global styles in `src/styles/index.css`. Frontend tests live in `frontend/tests`; test helpers live in `frontend/src/test`.

`backend/` contains the Supabase project. SQL migrations live in `backend/supabase/migrations`, seed data in `backend/supabase/seed.sql`, local config in `backend/supabase/config.toml`, and RLS tests in `backend/tests`. Planning and design notes are under `docs/`.

## Build, Test, and Development Commands

Run frontend commands from `frontend/`:

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.

Run backend commands from `backend/`:

- `npm install` installs Supabase tooling.
- `npm run supabase` invokes the Supabase CLI.
- `npm run db:reset` rebuilds the local database from migrations and seed data.
- `npm run test:rls` runs Node's test runner against RLS behavior.

## Coding Style & Naming Conventions

Use modern ES modules, React function components, and JSX. Component files use PascalCase, such as `ProjectCard.jsx`; hooks and utilities use camelCase, such as `useShouldRender3D.js` and `captureVideoFrame.js`. Keep feature-specific API and query code inside the relevant `src/features/*/api` directory. Tailwind is the primary styling tool; prefer existing UI components from `src/components/ui` before adding new primitives.

## Testing Guidelines

Frontend tests use Vitest with Testing Library and jsdom. Place broad flows in `frontend/tests/integration`, focused component or utility tests in `frontend/tests/unit`, and name files with `.test.jsx` or `.test.js`. Backend access-control coverage belongs in `backend/tests/rls.test.mjs`; run it after changing migrations, policies, grants, or seed assumptions.

## Commit & Pull Request Guidelines

Recent history uses concise conventional commits, often scoped: `feat(admin): ...`, `polish(ui): ...`, `docs: ...`, and `Revert "..."`. Keep commits imperative and focused. Pull requests should describe the user-facing change, list verification commands run, link relevant issues, and include screenshots or videos for UI changes.

## Security & Configuration Tips

Do not commit local environment files or secrets. Treat Supabase Row Level Security as the authorization boundary; any schema, grant, or policy change should include a matching test or a clear note explaining existing coverage.
