<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  HEADER  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d0d12,100:7c3aed&height=200&section=header&text=Portfolio&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=React%20SPA%20·%20Supabase%20backend&descSize=18&descAlignY=60&animation=fadeIn" width="100%" alt="Portfolio" />

<a href="https://readme-typing-svg.demolab.com">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&pause=1000&color=A855F7&center=true&vCenter=true&width=620&lines=Public+site+%2B+private+admin.;Row+Level+Security+is+the+boundary.;Zero+backend+servers+to+run.;Near-black+canvas%2C+purple+accent." alt="Typing tagline" />
</a>

<br/><br/>

<!-- Tech -->
<a href="#-tech-stack">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwindcss,supabase,postgres,vercel,vitest&perline=7" alt="Tech stack" />
</a>

<br/><br/>

<!-- Shields -->
<img src="https://img.shields.io/github/last-commit/iamhamzabaig/portfolio?style=flat-square&color=7c3aed&labelColor=0d0d12" alt="Last commit" />
<img src="https://img.shields.io/github/languages/top/iamhamzabaig/portfolio?style=flat-square&color=7c3aed&labelColor=0d0d12" alt="Top language" />
<img src="https://img.shields.io/github/repo-size/iamhamzabaig/portfolio?style=flat-square&color=7c3aed&labelColor=0d0d12" alt="Repo size" />
<img src="https://img.shields.io/github/stars/iamhamzabaig/portfolio?style=flat-square&color=7c3aed&labelColor=0d0d12" alt="Stars" />
<img src="https://img.shields.io/badge/PRs-welcome-7c3aed?style=flat-square&labelColor=0d0d12" alt="PRs welcome" />
<img src="https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square&labelColor=0d0d12" alt="License MIT" />

<br/><br/>

<!-- Nav -->
<a href="#-overview">Overview</a> &nbsp;•&nbsp;
<a href="#-features">Features</a> &nbsp;•&nbsp;
<a href="#-architecture">Architecture</a> &nbsp;•&nbsp;
<a href="#-tech-stack">Tech</a> &nbsp;•&nbsp;
<a href="#-getting-started">Getting Started</a> &nbsp;•&nbsp;
<a href="#-testing">Testing</a> &nbsp;•&nbsp;
<a href="#-roadmap">Roadmap</a>

</div>

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  OVERVIEW  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 📌 Overview

A personal portfolio built as a **decoupled monorepo** — and a small case study in shipping a real product with **no backend server to maintain**.

| | |
| --- | --- |
| 🖥 **`frontend/`** | React + Vite single-page app, Tailwind-styled. Public pages for projects, an about/profile section, and a contact form — plus a gated admin to manage everything. |
| 🗄 **`backend/`** | A [Supabase](https://supabase.com) project: PostgreSQL + Row Level Security + Auth + Storage. The SPA talks to Supabase directly; **the database itself enforces who can do what.** |

Content revolves around three things — **Projects**, an editable **Profile**, and visitor **Contact** messages. One admin signs in to write; everyone else is read-only, enforced in Postgres rather than trusted to the UI.

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  FEATURES  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

#### 🎨 Distinct visual identity
Spatial dark theme, purple accent, mono labels and oversized display numerals, with a light/dark toggle.

</td>
<td width="50%" valign="top">

#### 🔐 Security in the database
Row Level Security **plus** least-privilege table grants. Public reads, single-admin writes, and visitor messages no one but the admin can read.

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### ⚡ Zero-backend-server
Postgres, Auth, and Storage accessed straight from the client through Supabase — nothing to deploy or babysit.

</td>
<td width="50%" valign="top">

#### 🧩 Feature-sliced frontend
`auth`, `projects`, `profile`, and `contact` are self-contained slices — easy to reason about and grow.

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### 🗄 Versioned schema
Every table, trigger, policy, and storage bucket lives in SQL migrations applied by the Supabase CLI.

</td>
<td width="50%" valign="top">

#### ✅ Tested access control
An automated RLS smoke test provisions an admin and asserts the **entire** permission matrix end-to-end.

</td>
</tr>
</table>

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ARCHITECTURE  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 🧭 Architecture

```
        ┌──────────────────────────────┐
        │   React SPA   (frontend/)     │   public pages + gated admin
        │   Vite · Tailwind · Router    │
        └───────────────┬──────────────┘
                        │  supabase-js  (HTTPS)
                        ▼
        ┌──────────────────────────────┐
        │   Supabase    (backend/)      │
        │                               │
        │   Postgres  →  projects,      │   RLS: public read,
        │                contact, profile│        admin-only writes
        │   Auth      →  single admin   │   signups disabled
        │   Storage   →  project-images │   public read, admin write
        └──────────────────────────────┘
```

**Permission model** — enforced by Row Level Security + table grants, not the UI:

| Table | 👤 Anonymous visitor | 🔑 Authenticated admin |
| --- | :---: | :---: |
| `projects` | read | read · create · update · delete |
| `contact_messages` | submit only | read · update · delete |
| `profile` | read | update |

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  TECH  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

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

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  STRUCTURE  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 📁 Repository Layout

```
.
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── features/         # auth · projects · profile · contact
│       ├── pages/            # public/ + admin/
│       ├── components/       # layout + ui
│       └── ...
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

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  GETTING STARTED  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 🚀 Getting Started

> **Prerequisites:** Node.js **20+** and Docker (Docker only needed to run Supabase locally).

<details open>
<summary><b>1 · Backend — Supabase</b></summary>

<br/>

```bash
cd backend
npm install
npx supabase start      # boots local Postgres / Auth / Storage in Docker
npm run db:reset        # applies all migrations + seed
npm run test:rls        # asserts the RLS policies (12 checks)
```

`npx supabase status` prints the local API URL and keys.
Full guide → [`backend/supabase/README.md`](backend/supabase/README.md)

</details>

<details>
<summary><b>2 · Frontend — React</b></summary>

<br/>

```bash
cd frontend
npm install
npm run dev             # Vite dev server
```

Configure the Supabase connection in `frontend/.env`:

```bash
VITE_SUPABASE_URL=<your-api-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> ⚠️ **Never** put the Supabase service-role key in the frontend.

</details>

<details>
<summary><b>3 · Create the admin</b></summary>

<br/>

Signups are disabled by design. Create the single admin in the Supabase dashboard
(**Authentication → Users → Add user**) or via the Auth admin API with the service-role key.

</details>

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  TESTING  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 🧪 Testing

```bash
# Frontend component / unit tests
cd frontend && npm test

# Backend Row Level Security smoke test (needs Docker)
cd backend && npm run test:rls
```

The RLS suite provisions an admin, then asserts the full matrix: anonymous reads succeed, anonymous writes are rejected, visitor messages stay private, and the admin can manage everything.

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ROADMAP  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 🗺 Roadmap

- [x] Supabase schema, RLS policies, storage, seed
- [x] Automated RLS smoke test
- [x] Project README + license
- [ ] Frontend wired to `supabase-js`
- [ ] Production deploy (Vercel + hosted Supabase)

<br/>

<!-- ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  FOOTER  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ -->

## 📄 License

Released under the [MIT License](LICENSE).

<br/>

<div align="center">

Built by **Hamza Munawar**

<a href="https://github.com/iamhamzabaig">
  <img src="https://img.shields.io/badge/GitHub-@iamhamzabaig-7c3aed?style=for-the-badge&logo=github&logoColor=white&labelColor=0d0d12" alt="GitHub" />
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,100:0d0d12&height=120&section=footer" width="100%" alt="" />

</div>
