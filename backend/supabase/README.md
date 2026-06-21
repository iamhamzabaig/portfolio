# Portfolio Supabase Backend

This is the entire backend: Postgres schema, RLS policies, Storage, and Auth,
managed by the Supabase CLI. The frontend talks to Supabase directly via
`supabase-js`; there is no server to run.

## Layout

- `config.toml` — project config (signups disabled).
- `migrations/` — schema, triggers, RLS, storage (applied in filename order).
- `seed.sql` — sample profile + projects for local dev only.
- `../tests/rls.test.mjs` — RLS smoke test (`npm run test:rls`).

## Local development

Requires Docker.

```bash
cd backend
npm install
npx supabase start      # boots local Postgres/Auth/Storage in Docker
npm run db:reset        # applies all migrations + seed
npm run test:rls        # asserts RLS policies
```

`npx supabase status` prints the local API URL, Studio URL, anon key, and
service-role key.

> **Note on ports:** Local Supabase ports are remapped from the default 543xx
> range to 553xx (API 55321, DB 55322, Studio 55323) to avoid the Windows
> Hyper-V reserved port range (54280–54379). This is normal — `npx supabase
> status` will show these non-default ports.

## Connecting a hosted project

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push    # applies migrations to the hosted project
```

## Creating the admin (signups are disabled)

Either in the dashboard (Authentication → Users → Add user, set a password,
mark email confirmed), or via the Auth admin API using the service-role key.
There is exactly one admin; any authenticated session is treated as the admin.

## Frontend environment variables

The frontend (under `frontend/`) needs:

```
VITE_SUPABASE_URL=<API_URL>
VITE_SUPABASE_ANON_KEY=<ANON_KEY>
```

Never expose the service-role key to the frontend.
