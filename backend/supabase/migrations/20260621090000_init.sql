-- ============================================================
-- Functions
-- ============================================================

-- Kebab-case a string: lowercase, non-alphanumerics -> hyphens,
-- collapse repeats, trim leading/trailing hyphens.
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  );
$$;

-- Set updated_at = now() on UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- projects
-- ============================================================
create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  description      text not null,
  content          text not null default '',
  tags             text[] not null default '{}',
  cover_image_url  text,
  cover_image_path text,
  live_url         text,
  repo_url         text,
  featured         boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index projects_featured_sort_idx on public.projects (featured, sort_order);

-- Auto-derive slug from title when slug is null/empty.
create or replace function public.projects_set_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.title);
  end if;
  return new;
end;
$$;

create trigger projects_set_slug_trg
  before insert or update on public.projects
  for each row execute function public.projects_set_slug();

create trigger projects_touch_updated_at_trg
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ============================================================
-- contact_messages
-- ============================================================
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- profile (single editable row)
-- ============================================================
create table public.profile (
  id         integer primary key default 1 check (id = 1),
  name       text,
  headline   text,
  bio        text,
  avatar_url text,
  socials    jsonb not null default '{}',
  resume_url text,
  updated_at timestamptz not null default now()
);

create trigger profile_touch_updated_at_trg
  before update on public.profile
  for each row execute function public.touch_updated_at();
