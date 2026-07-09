-- ============================================================
-- Blog posts — mirrors `projects` (slug trigger, updated_at touch,
-- is_admin() write guard), plus draft/publish state and a markdown body.
-- Reuses public.slugify() and public.touch_updated_at() from the init migration.
-- ============================================================
create table public.posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  excerpt          text not null default '',
  content          text not null default '',   -- markdown body
  tags             text[] not null default '{}',
  cover_image_url  text,
  cover_image_path text,
  published        boolean not null default false,
  published_at     timestamptz,                -- the date shown to readers
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);

-- Auto-derive slug from title when slug is null/empty (same pattern as projects).
create or replace function public.posts_set_slug()
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

-- Stamp published_at the first time a post goes live; clear it if unpublished.
create or replace function public.posts_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published and new.published_at is null then
    new.published_at = now();
  elsif not new.published then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger posts_set_slug_trg
  before insert or update on public.posts
  for each row execute function public.posts_set_slug();

create trigger posts_set_published_at_trg
  before insert or update on public.posts
  for each row execute function public.posts_set_published_at();

create trigger posts_touch_updated_at_trg
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- RLS: anon reads published posts only; admin reads all + writes.
-- ============================================================
alter table public.posts enable row level security;

create policy "posts public read"
  on public.posts for select
  to anon, authenticated
  using (published or public.is_admin());

create policy "posts admin insert"
  on public.posts for insert
  to authenticated
  with check (public.is_admin());

create policy "posts admin update"
  on public.posts for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "posts admin delete"
  on public.posts for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- Storage: public bucket for post cover images; admin-only writes.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "blog-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

create policy "blog-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());
