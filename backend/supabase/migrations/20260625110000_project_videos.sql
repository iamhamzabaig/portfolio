-- Project demo videos: optional per-project clip hosted in Supabase Storage.
-- Mirrors the cover-image columns + bucket, but writes are gated on is_admin()
-- from the start (not the legacy "any authenticated" pattern).

alter table public.projects
  add column if not exists video_url  text,
  add column if not exists video_path text;

-- Public bucket for project demo videos. 50 MB cap + mp4/webm only, enforced
-- server-side so an oversize/wrong-type upload is rejected even if the client
-- guard is bypassed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800,
        array['video/mp4', 'video/webm'])
on conflict (id) do nothing;

-- Idempotent: drop-then-create so a re-run does not error on existing policies
-- (mirrors the guarded pattern in 20260625100000_admin_rls.sql).
drop policy if exists "project-videos public read" on storage.objects;
drop policy if exists "project-videos admin insert" on storage.objects;
drop policy if exists "project-videos admin update" on storage.objects;
drop policy if exists "project-videos admin delete" on storage.objects;

create policy "project-videos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-videos');

create policy "project-videos admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-videos' and public.is_admin());

create policy "project-videos admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-videos' and public.is_admin())
  with check (bucket_id = 'project-videos' and public.is_admin());

create policy "project-videos admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-videos' and public.is_admin());
