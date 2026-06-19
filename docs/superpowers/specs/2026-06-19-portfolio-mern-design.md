# Portfolio Website — MERN Decoupled Architecture (Design Spec)

- **Date:** 2026-06-19
- **Status:** Approved (design); pending implementation plan
- **Author:** waqarraza54@gmail.com

## 1. Goal & Context

Build a personal portfolio website on the MERN stack with a fully decoupled
frontend and backend so each can deploy independently on free tiers:

- Frontend: React + Vite → Vercel (or GitHub Pages)
- Backend: Node + Express → Render
- Database: MongoDB → MongoDB Atlas
- Media: Cloudinary (project cover images)

The provided screenshots (`codewithmukesh` style: near-black background, purple
accent, mono labels, large display numerals) are a **visual style reference
only** — not content to clone.

## 2. Scope (locked decisions)

| Decision | Choice |
| --- | --- |
| Core content entity | **Projects only** (portfolio pieces) |
| Auth model | **Single admin**, JWT login. Public read; admin-only writes. No public registration. |
| Secondary backend features | **Contact form** (visitor → DB), **Profile/About** (editable bio + stats) |
| Dropped (YAGNI) | Newsletter backend, multi-user accounts, blog, courses |
| Frontend styling | **Tailwind CSS** with theme tokens |
| Server-state layer | **TanStack Query (React Query)** over an axios client |
| JWT transport | **httpOnly cookie** (`Secure; HttpOnly; SameSite=None`) |

### Out of scope

Newsletter storage/sending, comments, search backend, analytics, blog/courses,
multi-tenant users. May be added later as separate specs.

## 3. Architecture

Two independent codebases (`frontend/`, `backend/`), each with its own
`package.json`, deployed separately.

```
Browser ──HTTPS──> Frontend (Vercel, static SPA)
   │  axios (withCredentials: true)
   └──────────────> Backend API (Render, Express)  /api/v1
                         ├── MongoDB Atlas (Mongoose)
                         └── Cloudinary (image storage)
```

- Frontend holds **no** DB/Cloudinary secrets; talks only to the backend via
  `VITE_API_URL`.
- Backend holds all secrets, signs the JWT, and proxies uploads to Cloudinary.
- Frontend and backend live on different domains → cross-site cookies require
  `SameSite=None; Secure` and CORS `credentials: true` with an exact origin
  whitelist (no `*` with credentials).

## 4. Backend Design (layered MVC)

**Request flow:** `route → validate → [auth] → controller → service → model`

- **Controllers** stay thin (parse req, shape res). **Services** own business
  logic and all Mongoose queries — testable and swappable.
- **app.js / server.js** are split: `app.js` builds the Express app (no port,
  importable in tests); `server.js` connects the DB and starts the listener.

### 4.1 Data models

**Project**
- `title` (string, required)
- `slug` (string, unique, derived from title)
- `description` (string)
- `content` (string, long-form / markdown — optional)
- `tags` (string[])
- `coverImage` `{ url, publicId }` — `publicId` retained so deleting a project
  also deletes the Cloudinary asset
- `liveUrl`, `repoUrl` (string, optional)
- `featured` (bool, default false)
- `order` (number, for manual sort)
- timestamps

**User (admin)**
- `email` (unique), `password` (bcrypt-hashed via pre-save hook)
- `role` (`'admin'`)
- No public registration; seeded from env via `seed/seedAdmin.js`.

**ContactMessage**
- `name`, `email`, `message`, `read` (bool), timestamps
- Public create; admin list/delete.

**Profile (singleton)**
- `name`, `headline`, `bio`, `avatar` `{ url, publicId }`
- `stats` (array of `{ label, value, suffix, description }` — the "by the
  numbers" block)
- `socials` (array of `{ platform, url }`)
- Exactly one document; admin edits, public reads.

### 4.2 API surface (`/api/v1`)

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/projects` | public | list (filter by tag/featured) |
| GET | `/projects/:slug` | public | one |
| POST | `/projects` | admin | create (+ cover upload) |
| PUT | `/projects/:id` | admin | update (+ optional new cover) |
| DELETE | `/projects/:id` | admin | delete (+ Cloudinary asset) |
| POST | `/auth/login` | public | set JWT cookie |
| POST | `/auth/logout` | admin | clear cookie |
| GET | `/auth/me` | admin | current admin |
| POST | `/contact` | public | submit message (rate-limited) |
| GET | `/contact` | admin | list messages |
| DELETE | `/contact/:id` | admin | delete message |
| GET | `/profile` | public | get profile |
| PUT | `/profile` | admin | update profile (+ optional avatar) |

### 4.3 Cloudinary integration

- `config/cloudinary.js` configures the SDK from env.
- `middlewares/upload.middleware.js` uses `multer` +
  `multer-storage-cloudinary` to stream the incoming file straight to
  Cloudinary (folder e.g. `portfolio/projects`), with file-type and size
  limits. Controller reads `req.file.path` (CDN url) + `req.file.filename`
  (publicId) and persists both.
- On project/profile delete or image replace, the service calls
  `cloudinary.uploader.destroy(publicId)`.

### 4.4 Security

- `helmet` for headers.
- `cors` with env-driven origin whitelist + `credentials: true`.
- `express-rate-limit` on `/auth/login` and `/contact`.
- `cookie-parser`; JWT in `Secure; HttpOnly; SameSite=None` cookie.
- Passwords bcrypt-hashed; password never returned in responses.
- Central `error.middleware.js` (last in chain) + `notFound.middleware.js`.
- Zod validation on all write payloads via `validate.middleware.js` → 422 on
  failure.
- `config/env.js` validates required env vars at boot and fails fast.

## 5. Frontend Design (feature-based)

- **Two route trees:** public site (`/`, `/projects`, `/projects/:slug`,
  `/about`, `/contact`, 404) and admin (`/admin/login`, `/admin` dashboard,
  project list/editor, messages) gated by `ProtectedRoute`.
- **Tailwind** theme tokens derived from the screenshots (near-black surfaces,
  purple accent, mono label font, large display numerals) in
  `tailwind.config.js`.
- **TanStack Query** over a single `axiosClient` (`withCredentials: true`) for
  all server state (lists, detail, mutations with cache invalidation).
- **Context** only for auth state and theme toggle — never for server data.
- **Component mapping from the design:**
  - Navbar, Footer, ThemeToggle, Container → `components/layout`
  - Hero, AnnouncementPill, StatCard, BadgeMarquee → `features/home`
  - ProjectCard, ProjectGrid, ProjectFilter, ProjectForm, ImageDropzone →
    `features/projects`
  - ContactForm → `features/contact`
  - LoginForm, ProtectedRoute → `features/auth`

## 6. Directory Structure

```text
p-folio/
├── README.md
├── .gitignore
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # load+validate process.env (fail fast)
│   │   │   ├── db.js                  # Mongoose connect (Atlas)
│   │   │   ├── cloudinary.js          # Cloudinary SDK config
│   │   │   └── cors.js                # origin whitelist + credentials
│   │   ├── models/
│   │   │   ├── project.model.js
│   │   │   ├── user.model.js          # admin, bcrypt hash hook
│   │   │   ├── contactMessage.model.js
│   │   │   └── profile.model.js       # singleton bio + stats
│   │   ├── controllers/
│   │   │   ├── project.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── contact.controller.js
│   │   │   └── profile.controller.js
│   │   ├── services/
│   │   │   ├── project.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── contact.service.js
│   │   │   └── profile.service.js
│   │   ├── routes/
│   │   │   ├── index.js               # mount under /api/v1
│   │   │   ├── project.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── contact.routes.js
│   │   │   └── profile.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # verify JWT cookie, attach req.user
│   │   │   ├── upload.middleware.js    # multer + storage-cloudinary
│   │   │   ├── validate.middleware.js  # run zod schema -> 422
│   │   │   ├── error.middleware.js     # central handler (last)
│   │   │   └── notFound.middleware.js
│   │   ├── validators/
│   │   │   ├── project.validator.js
│   │   │   ├── auth.validator.js
│   │   │   └── contact.validator.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   └── generateToken.js        # sign JWT
│   │   ├── seed/
│   │   │   └── seedAdmin.js            # create admin from env (one-off)
│   │   ├── app.js                      # build express app
│   │   └── server.js                   # connect db + listen
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js          # baseURL=VITE_API_URL, withCredentials
    │   ├── app/
    │   │   ├── App.jsx
    │   │   ├── router.jsx              # public + admin route trees
    │   │   └── queryClient.js          # TanStack Query client
    │   ├── components/
    │   │   ├── ui/                     # Button, Input, Modal, Spinner, Chip, Card
    │   │   └── layout/                 # Navbar, Footer, ThemeToggle, Container
    │   ├── features/
    │   │   ├── home/
    │   │   │   └── components/         # Hero, AnnouncementPill, StatCard, Marquee
    │   │   ├── projects/
    │   │   │   ├── api/                # projects.api.js + query hooks
    │   │   │   └── components/         # ProjectCard, ProjectGrid, ProjectForm, ImageDropzone
    │   │   ├── contact/
    │   │   │   ├── api/
    │   │   │   └── components/         # ContactForm
    │   │   ├── about/
    │   │   │   ├── api/
    │   │   │   └── components/
    │   │   └── auth/
    │   │       ├── api/                # auth.api.js (login/logout/me)
    │   │       └── components/         # LoginForm, ProtectedRoute
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/                      # useDebounce, useMediaQuery
    │   ├── layouts/
    │   │   ├── PublicLayout.jsx
    │   │   └── AdminLayout.jsx
    │   ├── pages/
    │   │   ├── public/                 # Home, Projects, ProjectDetail, About, Contact, NotFound
    │   │   └── admin/                  # Login, Dashboard, ProjectsAdmin, ProjectEditor, Messages
    │   ├── styles/
    │   │   └── index.css               # tailwind directives + globals
    │   ├── utils/                      # formatters, constants
    │   └── main.jsx                    # root + providers
    ├── .env.example                    # VITE_API_URL
    ├── .gitignore
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

## 7. Environment Variables

**backend/.env.example**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=7d
COOKIE_NAME=token
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
```

**frontend/.env.example**
```
VITE_API_URL=http://localhost:5000/api/v1
```

## 8. Testing Strategy

- Backend: unit tests on services (mocked models) + integration tests on routes
  via `app.js` with an in-memory Mongo (`mongodb-memory-server`) and a stubbed
  Cloudinary upload.
- Frontend: component tests (Vitest + Testing Library) for forms and cards;
  query hooks tested with a mocked axios client.

## 9. Open Questions / Risks

- Vercel ↔ Render cross-site cookies: verify `SameSite=None; Secure` works on
  both free tiers (Render serves HTTPS by default; OK). Fallback: Bearer token.
- Render free tier cold starts (~30s) — acceptable for a portfolio; note in
  README.
- Cloudinary free tier transformation/storage limits — fine for portfolio
  volume.
```
