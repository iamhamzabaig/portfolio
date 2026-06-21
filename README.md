<div align="center">

# ✦ Portfolio

### A fast, modern personal portfolio — React SPA front, Supabase back.

*Near-black canvas, purple accent, mono labels, oversized display numerals.*
*Public site for visitors, a private admin for the one person who owns it.*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## Overview

A decoupled personal portfolio in a single monorepo:

- **`frontend/`** — a React + Vite single-page app styled with Tailwind. Public pages for projects, an about/profile section, and a contact form; a gated admin area to manage it all.
- **`backend/`** — a [Supabase](https://supabase.com) project (PostgreSQL + Row Level Security + Auth + Storage). No server to run or host — the SPA talks to Supabase directly, and **Row Level Security is the security boundary.**

Content is built around three things: **Projects** (the portfolio pieces), an editable **Profile**, and **Contact** messages from visitors. A single admin signs in to write; everyone else gets read-only access — enforced in the database, not just the UI.

---

## ✨ Highlights

- 🎨 **Distinct visual identity** — spatial dark theme, purple accent, light/dark toggle.
- ⚡ **Zero-backend-server architecture** — Supabase Postgres, Auth, and Storage accessed straight from the client.
- 🔐 **Security in the database** — Row Level Security + least-privilege table grants. Public reads, single-admin writes, visitor messages no one but the admin can read.
- 🧩 **Feature-sliced frontend** — `auth`, `projects`, `profile`, and `contact` as self-contained features.
- 🗄️ **Versioned schema** — every table, trigger, policy, and bucket lives in SQL migrations applied by the Supabase CLI.
- ✅ **Tested access control** — an automated RLS smoke test asserts every permission rule end-to-end.
- 🚀 **Free-tier friendly** — frontend deploys to Vercel; backend runs on Supabase.

---

## 🖼 Preview

<div align="center">

<img src="Screenshot%202026-06-19%20125535.png" width="80%" alt="Portfolio — landing" />

<br/><br/>

<img src="Screenshot%202026-06-19%20125636.png" width="49%" alt="Projects" />
<img src="Screenshot%202026-06-19%20125701.png" width="49%" alt="Project detail" />

</div>

---

## 🛠 Tech Stack

| Layer | Stack |
| --- | --- |
| **Frontend** | React 18 · Vite 6 · Tailwind CSS 3 · React Router 6 |
| **Data / state** | TanStack Query 5 · React Hook Form · Zod |
| **Motion / UI** | Framer Motion · Lucide icons |
| **Backend** | Supabase — PostgreSQL · Row Level Security · Supabase Auth · Supabase Storage |
| **Schema** | Supabase CLI migrations (SQL) |
| **Testing** | Vitest (frontend) · `node --test` + supabase-js (RLS smoke test) |
| **Hosting** | Vercel (frontend) · Supabase (backend) |

---

## 🧭 Architecture

```
┌─────────────────────────────┐
│   React SPA  (frontend/)     │   public pages + gated admin
│   Vite · Tailwind · Router   │
└──────────────┬──────────────┘
               │  supabase-js (HTTPS)
               ▼
┌─────────────────────────────┐
│   Supabase  (backend/)       │
│                              │
│   Postgres  → projects,      │   RLS: public read,
│               contact, profile│        admin-only writes
│   Auth      → single admin   │   signups disabled
│   Storage   → project-images │   public read, admin write
└─────────────────────────────┘
```

**Permission model (enforced by RLS + table grants):**

| Table | Anonymous visitor | Authenticated admin |
| --- | --- | --- |
| `projects` | read | read · create · update · delete |
| `contact_messages` | submit only | read · update · delete |
| `profile` | read | update |

---

## 📁 Repository Layout

```
.
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── features/         # auth · projects · profile · contact
│   │   ├── pages/            # public/ + admin/
│   │   ├── components/       # layout + ui
│   │   └── ...
│   └── package.json
│
├── backend/
│   └── supabase/             # Supabase project
│       ├── migrations/       # schema · RLS · grants · storage (SQL)
│       ├── seed.sql          # sample data for local dev
│       ├── config.toml       # signups disabled, local ports
│       └── README.md         # backend setup guide
│
└── docs/                     # design specs + implementation plans
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20+**
- Docker (only for running Supabase locally)

### 1 — Backend (Supabase)

```bash
cd backend
npm install
npx supabase start      # boots local Postgres / Auth / Storage in Docker
npm run db:reset        # applies all migrations + seed
npm run test:rls        # asserts the RLS policies (12 checks)
```

`npx supabase status` prints the local API URL and keys. Full guide: [`backend/supabase/README.md`](backend/supabase/README.md).

### 2 — Frontend (React)

```bash
cd frontend
npm install
npm run dev             # Vite dev server
```

Set the Supabase connection in `frontend/.env`:

```bash
VITE_SUPABASE_URL=<your-api-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Never** put the Supabase service-role key in the frontend.

### Creating the admin

Signups are disabled by design. Create the single admin in the Supabase dashboard
(**Authentication → Users → Add user**) or via the Auth admin API with the service-role key.

---

## 🧪 Testing

```bash
# Frontend component/unit tests
cd frontend && npm test

# Backend Row Level Security smoke test (needs Docker)
cd backend && npm run test:rls
```

The RLS suite provisions an admin, then asserts the full permission matrix: anonymous reads succeed, anonymous writes are rejected, visitor messages stay private, and the admin can manage everything.

---

## 🗺 Roadmap

- [x] Supabase schema, RLS policies, storage, seed
- [x] Automated RLS smoke test
- [ ] Frontend wired to `supabase-js`
- [ ] Production deploy (Vercel + hosted Supabase)

---

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

Built by **Hamza Munawar** · [@iamhamzabaig](https://github.com/iamhamzabaig)

</div>
