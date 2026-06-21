# Portfolio Supabase Backend — Design

**Date:** 2026-06-21
**Status:** Approved (supersedes the Express + Mongoose MERN backend plan at `docs/superpowers/plans/2026-06-19-portfolio-backend.md`)

## Goal

Replace the planned (never-built) Express + Mongoose + MongoDB + Cloudinary backend with Supabase as the entire backend. The React frontend talks to Supabase directly via `supabase-js`; there is no server to host. Postgres + Row Level Security (RLS) enforce permissions, Supabase Auth handles the single-admin login, and Supabase Storage holds project images.

## Architecture

```
React frontend (supabase-js)        ← owned by Codex (frontend/)
  ├─ DB     → Postgres + RLS policies
  ├─ Auth   → Supabase Auth (single admin, signups disabled)
  └─ Images → Supabase Storage bucket "project-images"

Supabase project layer              ← owned by Claude (backend/)
```

**Decision:** Frontend calls Supabase directly (no Express server, no Edge Functions). Simplest, fewest moving parts, free-tier friendly. RLS is the security boundary.

**Ownership / project split:** Per the repo's project-split convention, the frontend integration code (the `supabase-js` client, queries, auth UI) is Codex's responsibility under `frontend/`. This spec covers only the **Supabase project layer** under `backend/supabase/`: SQL schema, functions, triggers, RLS policies, storage configuration, seed data, and setup docs.

## Deliverable layout

A Supabase CLI project rooted inside `backend/` (stays within the backend owner's lane):

```
backend/supabase/
  config.toml                     # project config; signups disabled
  migrations/
    <ts>_init.sql                 # tables, functions, triggers
    <ts>_rls.sql                  # enable RLS + policies
    <ts>_storage.sql              # storage bucket + storage policies
  seed.sql                        # sample profile row + a few projects (dev only)
  README.md                       # setup steps
backend/tests/
  rls.test.mjs                    # RLS smoke test (node + supabase-js)
backend/package.json              # test:rls script + dev deps
```

Frontend env vars (documented here, consumed by Codex): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Data model (Postgres)

### projects
Public read; admin-only write.

| column | type | notes |
|---|---|---|
| id | uuid | pk, default `gen_random_uuid()` |
| title | text | not null |
| slug | text | unique, not null; auto-derived from title when empty (trigger) |
| description | text | not null |
| content | text | default `''` |
| tags | text[] | default `'{}'` |
| cover_image_url | text | public URL of image in Storage; nullable |
| cover_image_path | text | object path in bucket (for deletes); nullable |
| live_url | text | nullable |
| repo_url | text | nullable |
| featured | boolean | default `false` |
| sort_order | integer | default `0` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()`; auto-touched by trigger |

Index: `(featured, sort_order)` for the public list query ordering.

### contact_messages
Public insert; admin-only read/update/delete.

| column | type | notes |
|---|---|---|
| id | uuid | pk, default `gen_random_uuid()` |
| name | text | not null |
| email | text | not null |
| message | text | not null |
| is_read | boolean | default `false` |
| created_at | timestamptz | default `now()` |

### profile
Single editable row. Public read; admin-only update.

| column | type | notes |
|---|---|---|
| id | integer | pk, default `1`, `check (id = 1)` — enforces a single row |
| name | text | |
| headline | text | |
| bio | text | |
| avatar_url | text | |
| socials | jsonb | default `'{}'` (e.g. `{ "github": "...", "linkedin": "..." }`) |
| resume_url | text | |
| updated_at | timestamptz | default `now()`; auto-touched by trigger |

## Functions & triggers

- `slugify(input text) returns text` — lowercase, strip non-alphanumeric to hyphens, collapse repeats, trim leading/trailing hyphens. Mirrors the old Mongoose slug logic.
- `projects_set_slug()` — BEFORE INSERT/UPDATE on `projects`: when `slug` is null/empty, set `slug = slugify(title)`.
- `touch_updated_at()` — BEFORE UPDATE: set `updated_at = now()`. Attached to `projects` and `profile`.

## RLS policies

RLS enabled on all three tables. Roles: `anon` (public, unauthenticated) and `authenticated` (the logged-in admin). Because signups are disabled and only one admin is provisioned, **any authenticated session = the admin**.

| table | anon | authenticated |
|---|---|---|
| projects | SELECT | SELECT, INSERT, UPDATE, DELETE |
| contact_messages | INSERT | SELECT, UPDATE, DELETE |
| profile | SELECT | UPDATE |

Policy expressions:
- public read: `for select using (true)` granted to `anon, authenticated`.
- admin write: `for {insert|update|delete} to authenticated using (true) with check (true)`.
- contact insert: `for insert with check (true)` (public submit — applies to `anon` and `authenticated`); no `anon` select policy → anon cannot read messages back.
- profile has no insert policy for anyone (seeded once via migration/seed); only update by `authenticated`.

## Storage

- Bucket `project-images`, `public = true` (objects publicly readable by URL).
- Storage RLS policies on `storage.objects` scoped to `bucket_id = 'project-images'`:
  - public `SELECT` (read).
  - `authenticated` `INSERT`, `UPDATE`, `DELETE`.
- `cover_image_path` on `projects` stores the object path so the frontend can delete the asset when a project is deleted or its image replaced.

## Auth

- `config.toml`: disable signups (`[auth] enable_signup = false`).
- One admin user (email + password) created manually via the Supabase dashboard or a documented seed step. README covers this.
- No custom users table, no custom JWT claims — Supabase Auth's `auth.users` and the `authenticated` role are sufficient.

## Migrations & seed

- Managed with the Supabase CLI. `supabase init` produces `config.toml`; migrations are timestamped SQL files applied via `supabase db push` (remote) or `supabase db reset` (local).
- `seed.sql`: one `profile` row and a couple of sample `projects` for local development. Not run against production.

## Cleanup

- Remove MERN debris from `backend/`: `debug-multipart.mjs`, `debug-schema.mjs`, and the stray `node_modules/` (no `package.json` ever existed).
- A fresh `backend/package.json` is added solely for the RLS test script and its dev dependency (`@supabase/supabase-js`).
- Mark `docs/superpowers/plans/2026-06-19-portfolio-backend.md` as superseded by this design (note at top; do not delete — kept as history).

## Testing / verification

1. **Migrations apply clean:** `supabase db reset` runs all migrations + seed with no errors.
2. **RLS smoke test** (`backend/tests/rls.test.mjs`, run via `npm run test:rls`): against a local `supabase start` instance, using the anon key and a signed-in admin session, assert:
   - anon can `select` from `projects`.
   - anon cannot `insert`/`update`/`delete` `projects` (policy violation).
   - anon can `insert` into `contact_messages` but cannot `select` them.
   - authenticated admin can perform all `projects` writes and read `contact_messages`.
   - anon can `select` `profile`; only authenticated can `update`.

   Requires Docker (for `supabase start`). If Docker is unavailable, fall back to verification step 1 only.

## Out of scope

- Frontend `supabase-js` client setup, data-fetching hooks, and admin auth UI (Codex / `frontend/`).
- Edge Functions, server-side rendering, email delivery for contact messages (could be a later Supabase Database Webhook / trigger, not now — YAGNI).
- Multi-admin / role management (single admin only).
