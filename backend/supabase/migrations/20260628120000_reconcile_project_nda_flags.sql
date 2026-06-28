-- Reconcile the projects NDA flags across environments.
--
-- History: an early version of 20260626120000 shipped a single `is_private`
-- column, which was applied to the remote DB. That migration was later edited
-- in place to split the flag into `live_private` / `repo_private`, but the
-- filename/timestamp was unchanged, so Supabase's migration history already
-- marked it applied and never re-ran it. Result: the remote kept `is_private`
-- and never got the split columns, while a fresh `db reset` produces the split
-- columns and no `is_private`. This migration converges both states and is safe
-- to run on either.

-- Ensure the canonical columns exist (no-op where they already do).
alter table public.projects
  add column if not exists live_private boolean not null default false,
  add column if not exists repo_private boolean not null default false,
  add column if not exists screenshots  jsonb   not null default '[]'::jsonb;

-- If the legacy single flag is still present, fold it into both new columns
-- before dropping it. Entirely skipped on databases that never had it.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'is_private'
  ) then
    update public.projects
      set live_private = is_private,
          repo_private = is_private
      where is_private;
    alter table public.projects drop column is_private;
  end if;
end $$;
