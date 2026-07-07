# Portfolio Frontend

React + Vite single-page portfolio app. Tailwind for styling, TanStack Query for
server state, React Router for public/admin routes, and **Supabase** (Auth +
Postgres + Storage) accessed directly from the client — no REST backend to run.

It ships as an **installable PWA** with an Apple-style design system: a fluid type
scale on semantic tokens, a ⌘K command palette, a mobile bottom tab bar, and a
light/dark toggle. The tokens and components are catalogued live at `/styleguide`.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set the Supabase connection (from `cd backend && npx supabase status`):

   ```bash
   VITE_SUPABASE_URL=<your-api-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

   > ⚠️ **Never** put the Supabase service-role key in the frontend.
   > Without these, the app still boots and falls back to static placeholder content.
3. Run `npm install`.
4. Run `npm run dev`.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm test` — Vitest suite (includes the typography-contract guardrail)
- `npm run generate-pwa-assets` — regenerate the PWA icon set from `public/app-icon.svg`

## Routes

- Public: `/`, `/projects`, `/projects/:slug`, `/about`, `/contact`, `/styleguide`
- Admin: `/admin/login`, `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`, `/admin/messages`, `/admin/profile`

Admin routes are gated by Supabase Auth; write access is enforced by Row Level
Security in Postgres, not the UI. Public pages include fallback content so the
site stays usable even before the Supabase connection is configured.

## Design system

Typography, color, radius, and elevation live as tokens in `tailwind.config.js`
and render live at `/styleguide`. Text must flow through the semantic type tokens
(`text-fluid-*`, `text-body*`, `text-caption`, `text-micro`, `text-eyebrow`) — the
`tests/typography-contract.test.js` guardrail fails the build if raw Tailwind
sizes (`text-xl`) or arbitrary pixels (`text-[11px]`) reappear in public code.
