# Portfolio Backend API

Express + Mongoose REST API. Projects CRUD, single-admin JWT auth, contact
messages, editable profile, Cloudinary image uploads.

## Setup

1. `cp .env.example .env` and fill in values (Mongo Atlas URI, Cloudinary keys,
   a 32+ char `JWT_SECRET`, `CLIENT_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
2. `npm install`
3. `npm run seed:admin` — create the admin user.
4. `npm run dev` — start on `PORT` (default 5000).

## Scripts

- `npm run dev` — watch-mode server
- `npm start` — production server
- `npm run seed:admin` — create/verify admin
- `npm test` — run the Vitest suite

## API (base `/api/v1`)

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/login` | public |
| POST | `/auth/logout` | admin |
| GET | `/auth/me` | admin |
| GET | `/projects` | public |
| GET | `/projects/:slug` | public |
| POST | `/projects` | admin (multipart `coverImage`) |
| PUT | `/projects/:id` | admin |
| DELETE | `/projects/:id` | admin |
| POST | `/contact` | public (rate-limited) |
| GET | `/contact` | admin |
| DELETE | `/contact/:id` | admin |
| GET | `/profile` | public |
| PUT | `/profile` | admin |

## Deploy (Render)

- Build command: `npm install`
- Start command: `npm start`
- Set all `.env` vars in the Render dashboard. Set `CLIENT_ORIGIN` to the
  deployed frontend URL and `NODE_ENV=production` (enables `Secure; SameSite=None`
  cookies for cross-site auth).
- The server trusts a single reverse-proxy hop (`app.set('trust proxy', 1)`) so
  `express-rate-limit` keys on the real client IP rather than Render's proxy IP.
