# Portfolio Frontend

React + Vite single-page portfolio app. It uses Tailwind for styling, TanStack Query for server state, React Router for public/admin routes, and httpOnly-cookie auth through the backend.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the backend base URL, for example `http://localhost:5000/api/v1`.
3. Run `npm install`.
4. Run `npm run dev`.

## Scripts

- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm test` - Vitest suite

## Routes

- Public: `/`, `/projects`, `/projects/:slug`, `/about`, `/contact`
- Admin: `/admin/login`, `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`, `/admin/messages`

The project, contact, and profile screens are wired to the planned backend endpoints. Public pages include fallback content so the frontend remains usable while the remaining backend routes are being completed.
