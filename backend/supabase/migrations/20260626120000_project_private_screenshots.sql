-- Private/NDA flag + multiple screenshots per project. Screenshots are stored
-- as a jsonb array of {url, path} objects in the existing public project-images
-- bucket (no new bucket/policies needed; existing projects RLS covers the row).
alter table public.projects
  add column if not exists is_private  boolean not null default false,
  add column if not exists screenshots jsonb   not null default '[]'::jsonb;
